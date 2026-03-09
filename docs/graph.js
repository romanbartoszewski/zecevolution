// ================================================================
//  graph.js — Zecevolucja v3
//  CRUD + GitHub sync (read) + GitHub push (write via PAT)
// ================================================================

// ─── GitHub config ─────────────────────────────────────────────
const GH = (() => {
  const host  = window.location.hostname;
  const parts = host.split(".");
  // Na GitHub Pages hostname = owner.github.io
  // Lokalnie ustaw ręcznie:
  const owner = (host === "localhost" || host === "127.0.0.1")
    ? "TWOJ_USERNAME"
    : parts[0];
  return {
    owner,
    repo:   "zecevolution",
    branch: "main",
    api:    `https://api.github.com/repos/${owner}/zecevolution`,
    raw:    `https://raw.githubusercontent.com/${owner}/zecevolution/main`,
  };
})();

// Mapowanie katalogu → typ węzła
const DIR_TYPE = {
  "B": "B", "C": "C",
  "kanon": "meta", "logi": "stan", "docs": "proces", "": "proces",
};

// ─── Config ────────────────────────────────────────────────────
const STORAGE_KEY = "zecevolution_v1";
const PAT_KEY     = "zece_gh_pat";

const COLOR = {
  proces:     "#00e5b0",
  stan:       "#66ffaa",
  zagrożenie: "#ff3d5a",
  meta:       "#ff9d2e",
  B:          "#4d9fff",
  C:          "#c084fc",
};

const NODE_R     = 18;
const NODE_R_KGR = 30;

// ─── DOM ───────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const graphEl = $("graph");

// ─── Size ──────────────────────────────────────────────────────
let W, H;
function refreshSize() {
  const r = graphEl.getBoundingClientRect();
  W = Math.max(320, r.width  || window.innerWidth);
  H = Math.max(240, r.height || window.innerHeight);
}
refreshSize();

// ─── SVG ───────────────────────────────────────────────────────
// gZoom = zoom target | gMain = pulse target (KGR)
// Oddzielenie warstw zapobiega nadpisywaniu pulsu przez zoom handler
const svg   = d3.select("#graph").append("svg").attr("width", W).attr("height", H);
const gZoom = svg.append("g");
const gMain = gZoom.append("g");

let currentZoomTx = d3.zoomIdentity;

const zoom = d3.zoom().on("zoom", (e) => {
  currentZoomTx = e.transform;
  gZoom.attr("transform", currentZoomTx);
});
svg.call(zoom);

function applyPulse(scale = 1) {
  const cx = W / 2 / currentZoomTx.k;
  const cy = H / 2 / currentZoomTx.k;
  gMain.attr("transform",
    `translate(${cx * (1 - scale)},${cy * (1 - scale)}) scale(${scale})`
  );
}

// ─── SVG Defs ──────────────────────────────────────────────────
const defs = svg.append("defs");

defs.append("filter").attr("id", "kgrGlow")
  .attr("x", "-60%").attr("y", "-60%").attr("width", "220%").attr("height", "220%")
  .call((f) => {
    f.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", 2.8).attr("result", "b");
    f.append("feMerge").call((m) => {
      m.append("feMergeNode").attr("in", "b");
      m.append("feMergeNode").attr("in", "SourceGraphic");
    });
  });

const energyGrad = defs.append("linearGradient").attr("id", "kgrEnergy")
  .attr("gradientUnits", "userSpaceOnUse")
  .attr("x1", 0).attr("y1", 0).attr("x2", 220).attr("y2", 0);
energyGrad.append("stop").attr("offset",   "0%").attr("stop-color", "#ffaa00").attr("stop-opacity", .95);
energyGrad.append("stop").attr("offset",  "50%").attr("stop-color", "#00ffff").attr("stop-opacity", .95);
energyGrad.append("stop").attr("offset", "100%").attr("stop-color", "#ffaa00").attr("stop-opacity", .95);

// ─── Layer groups (stała kolejność) ────────────────────────────
const gLinks  = gMain.append("g").attr("class", "g-links");
const gNodes  = gMain.append("g").attr("class", "g-nodes");
const gLabels = gMain.append("g").attr("class", "g-labels");

// ─── State ─────────────────────────────────────────────────────
let graphData    = { nodes: [], links: [] };
let sim          = null;
let linkSel      = gLinks.selectAll("line");
let nodeSel      = gNodes.selectAll("circle");
let labelSel     = gLabels.selectAll("text");

let labelsOn     = true;
let selectedNode = null;
let filterState  = {};
let kgrMode      = false;
let kgrTimer     = null;
let linkingMode  = false;
let linkSrc      = null;
let formMode     = null; // "add" | "edit"

// ─── PAT Auth ──────────────────────────────────────────────────
const getPat    = ()      => localStorage.getItem(PAT_KEY) || "";
const savePat   = (pat)   => localStorage.setItem(PAT_KEY, pat.trim());
const clearPat  = ()      => localStorage.removeItem(PAT_KEY);
const isAuthed  = ()      => !!getPat();

function ghHeaders() {
  return {
    "Authorization": `token ${getPat()}`,
    "Accept":        "application/vnd.github+json",
    "Content-Type":  "application/json",
  };
}

// ─── Persistence ───────────────────────────────────────────────
function cleanData(d) {
  return {
    nodes: d.nodes.map((n) => {
      const o = { id: n.id, type: n.type };
      if (n.description) o.description = n.description;
      if (n.url)         o.url         = n.url;
      if (n.ghPath)      o.ghPath      = n.ghPath;
      return o;
    }),
    links: d.links.map((l) => ({
      source: typeof l.source === "object" ? l.source.id : l.source,
      target: typeof l.target === "object" ? l.target.id : l.target,
    })),
  };
}

function saveToStorage() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData(graphData))); }
  catch (e) { console.warn("Storage write failed:", e); }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Toast ─────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, warn = false) {
  const el = $("toast");
  el.textContent = msg;
  el.className   = warn ? "toast-warn show" : "show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = warn ? "toast-warn" : ""), 2800);
}

// ─── Status ────────────────────────────────────────────────────
function setStatus({ loading, error }) {
  const lEl = $("status-loading"), eEl = $("status-error");
  if (lEl) lEl.style.display = loading ? "" : "none";
  if (eEl) eEl.style.display = error   ? "" : "none";
}

// ─── Simulation ────────────────────────────────────────────────
function buildSim() {
  if (sim) sim.stop();
  sim = d3.forceSimulation(graphData.nodes)
    .force("link",    d3.forceLink(graphData.links).id((d) => d.id).distance(120))
    .force("charge",  d3.forceManyBody().strength(-320))
    .force("center",  d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide(34));

  sim.on("tick", () => {
    linkSel.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
           .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    nodeSel.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labelSel.attr("x", (d) => d.x).attr("y", (d) => d.y - 28);
  });
}

// ─── Render (general update pattern) ──────────────────────────
function renderGraph() {
  // Links
  linkSel = gLinks.selectAll("line")
    .data(graphData.links, (l) => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      return `${s}→${t}`;
    });
  linkSel.exit().remove();
  linkSel = linkSel.enter().append("line")
    .attr("stroke", "#1e2a38").attr("stroke-width", 1.8).attr("stroke-opacity", 0.9)
    .merge(linkSel);

  // Nodes
  nodeSel = gNodes.selectAll("circle").data(graphData.nodes, (d) => d.id);
  nodeSel.exit().remove();
  nodeSel = nodeSel.enter().append("circle")
    .attr("r", NODE_R).attr("fill", "#0c1118")
    .attr("stroke", (d) => COLOR[d.type] || "#4a5568").attr("stroke-width", 2)
    .style("cursor", "pointer")
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
    .on("click", onNodeClick)
    .merge(nodeSel)
    .attr("stroke", (d) => COLOR[d.type] || "#4a5568");

  // Labels
  labelSel = gLabels.selectAll("text").data(graphData.nodes, (d) => d.id);
  labelSel.exit().remove();
  labelSel = labelSel.enter().append("text")
    .attr("fill", "#567080").attr("font-size", 11)
    .attr("font-family", "'JetBrains Mono', monospace")
    .attr("text-anchor", "middle").style("pointer-events", "none")
    .merge(labelSel).text((d) => d.id);

  gLabels.style("display", labelsOn ? "" : "none");

  sim.nodes(graphData.nodes);
  sim.force("link").links(graphData.links);
  sim.alpha(0.4).restart();

  applyFilters();
  renderFilters();
}

// ─── Filters ───────────────────────────────────────────────────
function renderFilters() {
  const el = $("filters");
  if (!el) return;
  el.innerHTML = "";
  const types = [...new Set(graphData.nodes.map((n) => n.type).filter(Boolean))];
  types.forEach((type) => {
    if (!(type in filterState)) filterState[type] = true;
    const color = COLOR[type] || "#ccc";
    const row   = document.createElement("label");
    row.className = "filter-row";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = filterState[type]; cb.className = "filter-checkbox";
    const dot = document.createElement("span");
    dot.className = "filter-dot";
    dot.style.borderColor = color;
    dot.style.background  = filterState[type] ? color + "22" : "transparent";
    const txt = document.createElement("span");
    txt.className = "filter-text"; txt.textContent = type;
    cb.addEventListener("change", () => {
      filterState[type] = cb.checked;
      dot.style.background = cb.checked ? color + "22" : "transparent";
      applyFilters();
    });
    row.append(cb, dot, txt);
    el.appendChild(row);
  });
}

function applyFilters() {
  if (!nodeSel || nodeSel.empty()) return;
  nodeSel.style("display",  (d) => filterState[d.type] === false ? "none" : "");
  labelSel.style("display", (d) => labelsOn && filterState[d.type] !== false ? "" : "none");
  linkSel.style("display",  (l) => {
    const s = l.source?.type, t = l.target?.type;
    return filterState[s] === false || filterState[t] === false ? "none" : "";
  });
}

// ─── Panel state machine ────────────────────────────────────────
function showMain() { $("view-main").style.display = ""; $("view-form").style.display = "none"; }
function showForm() { $("view-main").style.display = "none"; $("view-form").style.display = ""; }

function panelDefault() {
  formMode = null; showMain();
  $("node-title").textContent = "zecevolucja";
  $("node-title").className   = "";
  const b = $("node-type-badge");
  b.textContent = ""; b.style.color = ""; b.style.borderColor = "";
  $("node-description").textContent = "Kliknij węzeł grafu, aby zobaczyć opis.";
  $("node-description").className   = "desc-placeholder";
  const lk = $("node-link");
  if (lk) { lk.textContent = ""; lk.href = "#"; lk.style.display = "none"; }
  $("node-actions").style.display = "none";
  const ghp = $("node-gh-path");
  if (ghp) ghp.style.display = "none";
}

function panelDetail(d) {
  if (!d) return;
  formMode = null; showMain();
  const color = COLOR[d.type] || "#6a7a8a";
  $("node-title").textContent = d.id;
  $("node-title").className   = "node-active";
  const b = $("node-type-badge");
  b.textContent = d.type || ""; b.style.color = color; b.style.borderColor = color;
  const desc = $("node-description");
  desc.textContent = d.description || "(brak opisu)"; desc.className = "";
  const lk = $("node-link");
  if (lk) {
    const href = d.url || "";
    if (href) {
      // Konwertuj raw URL → GitHub blob URL
      const htmlUrl = href
        .replace("raw.githubusercontent.com", "github.com")
        .replace(`/${GH.branch}/`, `/blob/${GH.branch}/`);
      lk.textContent = "↗ GitHub"; lk.href = htmlUrl; lk.style.display = "";
    } else {
      lk.textContent = ""; lk.href = "#"; lk.style.display = "none";
    }
  }
  $("node-actions").style.display = "";
  const ghp = $("node-gh-path");
  if (ghp) {
    ghp.textContent   = d.ghPath || "";
    ghp.style.display = d.ghPath ? "" : "none";
  }
}

function panelForm(mode, nodeData = null) {
  formMode = mode; showForm();
  $("form-mode-title").textContent = mode === "edit" ? `Edytuj: ${nodeData?.id || ""}` : "Nowy węzeł";
  $("form-id").value    = nodeData?.id          || "";
  $("form-id").disabled = mode === "edit";
  $("form-type").value  = nodeData?.type        || "proces";
  $("form-desc").value  = nodeData?.description || "";
  $("form-url").value   = nodeData?.url         || "";
  setTimeout(() => (mode === "edit" ? $("form-desc") : $("form-id")).focus(), 40);
}

function closeForm() {
  formMode = null; showMain();
  if (selectedNode) panelDetail(selectedNode); else panelDefault();
}

// ─── CRUD ──────────────────────────────────────────────────────
function submitForm() {
  const id   = $("form-id").value.trim();
  const type = $("form-type").value;
  const desc = $("form-desc").value.trim();
  const url  = $("form-url").value.trim();
  if (!id) { $("form-id").focus(); showToast("ID jest wymagane", true); return false; }

  if (formMode === "add") {
    if (graphData.nodes.find((n) => n.id === id)) {
      showToast("Węzeł o tym ID już istnieje", true); return false;
    }
    const n = { id, type };
    if (desc) n.description = desc;
    if (url)  n.url         = url;
    graphData.nodes.push(n);
    saveToStorage(); buildSim(); renderGraph();
    selectedNode = graphData.nodes.find((n) => n.id === id);
    panelDetail(selectedNode);
    showToast(`Dodano: ${id}`);

  } else if (formMode === "edit" && selectedNode) {
    selectedNode.type        = type;
    selectedNode.description = desc || undefined;
    selectedNode.url         = url  || undefined;
    saveToStorage(); renderGraph();
    panelDetail(selectedNode);
    showToast(`Zapisano: ${id}`);
    // Jeśli węzeł pochodzi z GitHub, zaktualizuj też .md
    if (selectedNode.ghPath && isAuthed() && desc) {
      saveNodeDescToMd(selectedNode);
    }
  }
  return true;
}

function deleteSelectedNode() {
  if (!selectedNode) return;
  const id = selectedNode.id;
  graphData.nodes = graphData.nodes.filter((n) => n.id !== id);
  graphData.links = graphData.links.filter((l) => {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return s !== id && t !== id;
  });
  selectedNode = null; stopKgr(); saveToStorage(); buildSim(); renderGraph();
  panelDefault(); showToast(`Usunięto: ${id}`);
}

// ─── Link mode ─────────────────────────────────────────────────
function startLinkMode() {
  linkingMode = true; linkSrc = null;
  document.body.classList.add("linking");
  $("link-banner").classList.add("active");
  $("link-banner-text").textContent = "Kliknij węzeł źródłowy";
  selectedNode = null;
  if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
  panelDefault();
}

function cancelLinkMode() {
  linkingMode = false; linkSrc = null;
  document.body.classList.remove("linking");
  $("link-banner").classList.remove("active");
  if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
}

// ─── Node click ────────────────────────────────────────────────
function onNodeClick(event, d) {
  event.stopPropagation();

  if (linkingMode) {
    if (!linkSrc) {
      linkSrc = d;
      nodeSel.classed("selected", (n) => n.id === d.id).attr("stroke-width", (n) => n.id === d.id ? 3 : 2);
      $("link-banner-text").textContent = `${d.id} → kliknij węzeł docelowy`;
    } else {
      if (linkSrc.id !== d.id) {
        const s = linkSrc.id, t = d.id;
        const dup = graphData.links.some((l) => {
          const ls = typeof l.source === "object" ? l.source.id : l.source;
          const lt = typeof l.target === "object" ? l.target.id : l.target;
          return ls === s && lt === t;
        });
        if (dup) { showToast("Relacja już istnieje", true); }
        else {
          graphData.links.push({ source: s, target: t });
          saveToStorage(); buildSim(); renderGraph();
          showToast(`Relacja: ${s} → ${t}`);
        }
      }
      cancelLinkMode();
    }
    return;
  }

  selectedNode = d;
  nodeSel.classed("selected", (n) => n.id === d.id).attr("stroke-width", (n) => n.id === d.id ? 3 : 2);
  panelDetail(d);
  if (d.id === "KGR") startKgr(); else stopKgr();
}

svg.on("click", () => {
  if (linkingMode) { cancelLinkMode(); return; }
  if (selectedNode) {
    selectedNode = null;
    if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
    stopKgr(); panelDefault();
  }
});

// ─── KGR mode ──────────────────────────────────────────────────
function startKgr() {
  if (kgrMode) return; kgrMode = true;
  sim.alphaTarget(0.55).restart();
  nodeSel.filter((n) => n.id === "KGR").transition().duration(300).attr("r", NODE_R_KGR);
  linkSel.attr("filter", "url(#kgrGlow)").attr("stroke", "url(#kgrEnergy)");
  const t0 = performance.now();
  kgrTimer = d3.timer(() => {
    const t = (performance.now() - t0) / 1000;
    applyPulse(1 + Math.sin(t * 2.6) * 0.011);
    const w = 1 + Math.sin(t * 11.0) * 0.18;
    linkSel.attr("stroke-width", 1.4 * w).attr("stroke-opacity", 0.5 + 0.3 * Math.sin(t * 6.0));
    energyGrad.attr("gradientTransform", `translate(${(t * 85) % 220},0)`);
  });
}

function stopKgr() {
  if (!kgrMode) return; kgrMode = false;
  if (kgrTimer) { kgrTimer.stop(); kgrTimer = null; }
  sim.alphaTarget(0); applyPulse(1);
  nodeSel.transition().duration(250).attr("r", NODE_R);
  linkSel.attr("filter", null).attr("stroke", "#1e2a38").attr("stroke-width", 1.8).attr("stroke-opacity", 0.9);
  energyGrad.attr("gradientTransform", "translate(0,0)");
}

// ─── Export JSON ───────────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(cleanData(graphData), null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "data.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("data.json pobrano — skopiuj do docs/");
}

// ─── Fit view ──────────────────────────────────────────────────
function fitView() {
  if (!graphData.nodes.length) return;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  graphData.nodes.forEach(({ x, y }) => {
    if (typeof x !== "number" || typeof y !== "number") return;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  });
  if (!isFinite(x0)) { svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity); return; }
  const pad = 70, gW = x1 - x0 || 1, gH = y1 - y0 || 1;
  const scale = Math.min(4, Math.max(0.1, Math.min((W - pad) / gW, (H - pad) / gH)));
  const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(scale).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
  svg.transition().duration(350).call(zoom.transform, t);
}

// ================================================================
//  GITHUB SYNC (odczyt repo → graf)
// ================================================================

const GH_SKIP_DIRS = new Set(["docs", "logi", ".git"]);
const GH_SKIP_FILES = new Set([
  "docs/graph.js","docs/style.css","docs/index.html",
  "docs/data.json","docs/ontology.json",".nojekyll","STRUKTURA.txt",
]);

function extractDescription(md) {
  const lines = md.split("\n");
  const buf = []; let inPara = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { if (inPara && buf.length) break; continue; }
    if (/^#{1,6}\s/.test(line)) { if (inPara && buf.length) break; inPara = true; continue; }
    if (/^[-*_]{3,}$/.test(line) || /^```/.test(line)) continue;
    inPara = true; buf.push(line);
    if (buf.join(" ").length > 160) break;
  }
  return buf.join(" ")
    .replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ").trim().slice(0, 180) || "(brak opisu)";
}

function typeFromPath(path) {
  if (path.startsWith("B/")) return "B";
  if (path.startsWith("C/")) return "C";
  return DIR_TYPE[path.split("/")[0]] || "proces";
}

function nodeIdFromPath(path) {
  return path.replace(/\.md$/i, "").split("/").pop()
    .replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractInternalLinks(md, currentPath) {
  const dir = currentPath.split("/").slice(0, -1).join("/");
  const links = []; const re = /\[([^\]]+)\]\(([^)#]+\.md[^)]*)\)/gi; let m;
  while ((m = re.exec(md)) !== null) {
    let href = m[2].trim().split("#")[0];
    if (!href.startsWith("http")) {
      const parts = (dir ? dir + "/" + href : href).split("/");
      const res = [];
      for (const p of parts) { if (p === "..") res.pop(); else if (p && p !== ".") res.push(p); }
      links.push(res.join("/"));
    }
  }
  return links;
}

async function syncFromGitHub() {
  const btn = $("btn-gh-sync");
  if (btn) { btn.disabled = true; btn.textContent = "⟳ Pobieranie…"; }
  showToast("Łączę z GitHub…");

  try {
    const treeRes = await fetch(`${GH.api}/git/trees/${GH.branch}?recursive=1`);
    if (!treeRes.ok) throw new Error(`GitHub API ${treeRes.status}`);
    const treeData = await treeRes.json();

    const mdFiles = treeData.tree.filter((item) => {
      if (item.type !== "blob" || !item.path.endsWith(".md")) return false;
      if (GH_SKIP_FILES.has(item.path)) return false;
      return !GH_SKIP_DIRS.has(item.path.split("/")[0]);
    });

    showToast(`Pobrano strukturę (${mdFiles.length} plików)…`);

    // Fetch content równolegle, max 20 plików (rate limit)
    const batch = mdFiles.slice(0, 20);
    const contents = await Promise.all(batch.map(async (item) => {
      try {
        const res = await fetch(`${GH.raw}/${item.path}`);
        return { path: item.path, md: res.ok ? await res.text() : "" };
      } catch { return { path: item.path, md: "" }; }
    }));

    const pathToId = new Map();
    const newNodes = [];
    const allLinks = [];
    const linkMap  = new Map();

    contents.forEach(({ path, md }) => {
      const id = nodeIdFromPath(path);
      pathToId.set(path, id);
      const existing = graphData.nodes.find((n) => n.id === id || n.ghPath === path);
      newNodes.push({
        id,
        type:        typeFromPath(path),
        description: existing?.description || extractDescription(md),
        url:         `${GH.raw}/${path}`,
        ghPath:      path,
        x: existing?.x, y: existing?.y,
      });
      if (md) linkMap.set(path, extractInternalLinks(md, path));
    });

    // Linki z cross-references
    linkMap.forEach((targets, srcPath) => {
      const srcId = pathToId.get(srcPath);
      if (!srcId) return;
      targets.forEach((tgtPath) => {
        const tgtId = pathToId.get(tgtPath);
        if (!tgtId || tgtId === srcId) return;
        if (!allLinks.some((l) => l.source === srcId && l.target === tgtId))
          allLinks.push({ source: srcId, target: tgtId });
      });
    });

    // Linki hierarchiczne (katalog → plik) dla spójności grafu
    const dirNodes = new Map();
    newNodes.forEach((n) => {
      const top = (n.ghPath || "").split("/")[0];
      if (top && !dirNodes.has(top)) dirNodes.set(top, top.toUpperCase());
    });
    dirNodes.forEach((id, dir) => {
      if (!newNodes.find((n) => n.id === id))
        newNodes.push({ id, type: DIR_TYPE[dir] || "proces", description: `Katalog ${dir}/`, ghPath: dir });
    });
    newNodes.forEach((n) => {
      const top = (n.ghPath || "").split("/")[0];
      const dirId = dirNodes.get(top);
      if (dirId && dirId !== n.id && !allLinks.some((l) => l.source === dirId && l.target === n.id))
        allLinks.push({ source: dirId, target: n.id });
    });

    // Zachowaj ręcznie dodane węzły
    const manualNodes = graphData.nodes.filter(
      (n) => !n.ghPath && !newNodes.find((x) => x.id === n.id)
    );
    const manualLinks = graphData.links
      .map((l) => ({
        source: typeof l.source === "object" ? l.source.id : l.source,
        target: typeof l.target === "object" ? l.target.id : l.target,
      }))
      .filter((l) => manualNodes.some((n) => n.id === l.source || n.id === l.target));

    graphData = { nodes: [...newNodes, ...manualNodes], links: [...allLinks, ...manualLinks] };
    saveToStorage(); buildSim(); renderGraph();
    showToast(`✓ Zsynchronizowano ${newNodes.length} węzłów`);

  } catch (err) {
    console.error("GitHub sync failed:", err);
    showToast(`Błąd sync: ${err.message}`, true);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "⟳ Sync GitHub"; }
  }
}

// ================================================================
//  GITHUB PUSH (zapis → repo via PAT)
// ================================================================

async function ghPut(path, content, message) {
  const url = `${GH.api}/contents/${path}`;

  // Pobierz aktualny SHA (wymagany do PUT)
  let sha = null;
  const getRes = await fetch(url, { headers: ghHeaders() });
  if (getRes.ok) {
    sha = (await getRes.json()).sha;
  } else if (getRes.status !== 404) {
    const err = await getRes.json();
    throw new Error(err.message || `GET ${getRes.status}`);
  }

  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(content))),
    branch:  GH.branch,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(url, {
    method: "PUT", headers: ghHeaders(), body: JSON.stringify(body),
  });
  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(err.message || `PUT ${putRes.status}`);
  }
  return putRes.json();
}

async function saveGraphToGitHub() {
  if (!isAuthed()) { showAuthModal(); return; }
  const btn = $("btn-gh-push");
  if (btn) { btn.disabled = true; btn.textContent = "⬆ Zapisuję…"; }
  try {
    await ghPut(
      "docs/data.json",
      JSON.stringify(cleanData(graphData), null, 2),
      "chore: aktualizacja grafu z interfejsu"
    );
    showToast("✓ docs/data.json zapisany na GitHub");
  } catch (e) {
    console.error("Push failed:", e);
    showToast(`Błąd zapisu: ${e.message}`, true);
    if (e.message.includes("401") || e.message.toLowerCase().includes("bad cred")) {
      clearPat(); updateAuthUI();
      showToast("Token wygasł — zaloguj się ponownie", true);
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "⬆ Zapisz na GitHub"; }
  }
}

// Zaktualizuj pierwszy akapit w pliku .md po edycji opisu węzła
async function saveNodeDescToMd(node) {
  if (!node.ghPath || !isAuthed()) return;
  try {
    const res = await fetch(`${GH.raw}/${node.ghPath}`);
    if (!res.ok) return;
    let md = await res.text();
    // Zamień pierwszy akapit po nagłówku
    md = md.replace(
      /(^#{1,6}[^\n]+\n)([^\n#][^\n]*(\n[^\n#][^\n]*)*)(\n|$)/m,
      (match, heading) => heading + "\n" + node.description + "\n\n"
    );
    await ghPut(node.ghPath, md, `docs: aktualizacja opisu ${node.id}`);
    showToast(`✓ ${node.ghPath} zaktualizowany`);
  } catch (e) {
    showToast(`Nie można zaktualizować .md: ${e.message}`, true);
  }
}

// ================================================================
//  AUTH MODAL (PAT)
// ================================================================

function buildAuthModal() {
  if ($("auth-modal")) return;
  const el = document.createElement("div");
  el.id = "auth-modal";
  el.innerHTML = `
    <div id="auth-box">
      <p class="section-label" style="margin-bottom:12px">GitHub Personal Access Token</p>
      <p style="font-size:12px;color:#567080;margin-bottom:14px;line-height:1.65">
        Token przechowywany wyłącznie w localStorage tej przeglądarki.<br>
        Wymagane uprawnienie: <code>contents:write</code><br>
        <a href="https://github.com/settings/tokens/new?scopes=repo&description=zecevolution"
           target="_blank" rel="noopener" style="color:#4d9fff">↗ Wygeneruj token na GitHub</a>
      </p>
      <div class="form-field">
        <label class="form-label" for="auth-pat-input">Personal Access Token</label>
        <input class="form-input" id="auth-pat-input" type="password"
               placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" autocomplete="off" spellcheck="false"/>
      </div>
      <div class="btn-row" style="margin-top:14px">
        <button id="auth-save"   class="btn btn-primary">Weryfikuj i zapisz</button>
        <button id="auth-cancel" class="btn">Anuluj</button>
      </div>
      <p id="auth-status" style="font-size:11px;color:#567080;margin-top:10px;min-height:16px;font-family:var(--font-mono)"></p>
    </div>`;
  document.body.appendChild(el);

  $("auth-save").addEventListener("click", async () => {
    const pat = $("auth-pat-input").value.trim();
    if (!pat) return;
    $("auth-status").textContent = "Weryfikuję…";
    $("auth-save").disabled = true;
    try {
      const res = await fetch(GH.api, {
        headers: { "Authorization": `token ${pat}`, "Accept": "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      savePat(pat);
      $("auth-status").textContent = "✓ Token poprawny";
      updateAuthUI();
      setTimeout(hideAuthModal, 700);
    } catch (e) {
      $("auth-status").textContent = `✗ ${e.message}`;
    } finally {
      $("auth-save").disabled = false;
    }
  });

  $("auth-pat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter")  $("auth-save").click();
    if (e.key === "Escape") hideAuthModal();
  });
  $("auth-cancel").addEventListener("click", hideAuthModal);
  el.addEventListener("click", (e) => { if (e.target === el) hideAuthModal(); });
}

function showAuthModal() {
  buildAuthModal();
  $("auth-modal").classList.add("active");
  setTimeout(() => $("auth-pat-input")?.focus(), 60);
}

function hideAuthModal() {
  $("auth-modal")?.classList.remove("active");
}

function updateAuthUI() {
  const authed   = isAuthed();
  const btnPush  = $("btn-gh-push");
  const btnLogin = $("btn-gh-login");
  if (btnPush)  btnPush.style.display = authed ? "" : "none";
  if (btnLogin) {
    btnLogin.textContent = authed ? "✕ Wyloguj" : "🔑 Zaloguj";
    btnLogin.title       = authed ? "Usuń token GitHub" : "Podaj PAT GitHub";
  }
}

// ─── Button wiring ─────────────────────────────────────────────
function wireButtons() {
  $("btn-reset-view")?.addEventListener("click", () =>
    svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

  $("btn-fit-view")?.addEventListener("click", fitView);

  $("btn-toggle-labels")?.addEventListener("click", () => {
    labelsOn = !labelsOn;
    $("btn-toggle-labels").style.opacity = labelsOn ? "1" : "0.45";
    gLabels.style("display", labelsOn ? "" : "none");
    applyFilters();
  });

  $("btn-add-node")?.addEventListener("click", () => {
    cancelLinkMode(); selectedNode = null;
    if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
    stopKgr(); panelForm("add");
  });

  $("btn-add-link")?.addEventListener("click", () => {
    if (linkingMode) cancelLinkMode(); else startLinkMode();
  });

  $("btn-export")?.addEventListener("click", exportJSON);
  $("btn-cancel-link")?.addEventListener("click", cancelLinkMode);

  // GitHub
  $("btn-gh-sync")?.addEventListener("click", syncFromGitHub);
  $("btn-gh-push")?.addEventListener("click", saveGraphToGitHub);
  $("btn-gh-login")?.addEventListener("click", () => {
    if (isAuthed()) { clearPat(); updateAuthUI(); showToast("Token usunięty"); }
    else showAuthModal();
  });

  // Node actions
  $("btn-edit-node")?.addEventListener("click", () => {
    if (selectedNode) panelForm("edit", selectedNode);
  });

  $("btn-delete-node")?.addEventListener("click", () => {
    if (!selectedNode) return;
    if (confirm(`Usunąć węzeł "${selectedNode.id}" i wszystkie jego relacje?`))
      deleteSelectedNode();
  });

  // Form
  $("btn-form-submit")?.addEventListener("click", () => { if (submitForm()) closeForm(); });
  $("btn-form-cancel")?.addEventListener("click", closeForm);
}

// ─── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener("keydown", (e) => {
  const inInput = e.target.closest("input, textarea, select");
  if (e.key === "Escape") {
    if ($("auth-modal")?.classList.contains("active")) { hideAuthModal(); return; }
    if (linkingMode) { cancelLinkMode(); return; }
    if (formMode)    { closeForm();      return; }
    if (selectedNode) {
      selectedNode = null;
      if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
      stopKgr(); panelDefault();
    }
    return;
  }
  if (!inInput && (e.key === "l" || e.key === "L")) {
    labelsOn = !labelsOn;
    const b = $("btn-toggle-labels"); if (b) b.style.opacity = labelsOn ? "1" : "0.45";
    gLabels.style("display", labelsOn ? "" : "none");
    applyFilters();
  }
  if (!inInput && e.key === "Delete" && selectedNode && !formMode) {
    if (confirm(`Usunąć węzeł "${selectedNode.id}"?`)) deleteSelectedNode();
  }
  if (e.key === "Enter" && formMode && e.target.tagName !== "TEXTAREA") {
    if (submitForm()) closeForm();
  }
});

// ─── Resize ────────────────────────────────────────────────────
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    refreshSize(); svg.attr("width", W).attr("height", H);
    if (sim) { sim.force("center", d3.forceCenter(W / 2, H / 2)); sim.alpha(0.2).restart(); }
  }, 100);
});

// ─── Bootstrap ─────────────────────────────────────────────────
setStatus({ loading: true, error: false });
wireButtons();
panelDefault();
updateAuthUI();

const cached = loadFromStorage();
if (cached?.nodes?.length) {
  graphData = cached;
  setStatus({ loading: false, error: false });
  buildSim(); renderGraph();
} else {
  d3.json("data.json")
    .then((raw) => {
      graphData = raw; saveToStorage();
      setStatus({ loading: false, error: false });
      buildSim(); renderGraph();
    })
    .catch(() => {
      setStatus({ loading: false, error: false });
      syncFromGitHub(); // brak data.json → auto-sync
    });
}
