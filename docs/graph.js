// ================================================================
//  graph.js — Zecevolucja v2
//  CRUD: add/edit/delete nodes & links, localStorage persistence,
//  export data.json, KGR mode, filters, zoom/fit/reset
// ================================================================

// ─── Config ────────────────────────────────────────────────────
const STORAGE_KEY = "zecevolution_v1";

const COLOR = {
  proces:     "#00e5b0",
  stan:       "#66ffaa",
  zagrożenie: "#ff3d5a",
  meta:       "#ff9d2e",
  B:          "#4d9fff",
  C:          "#c084fc",
};

// ─── DOM helpers ───────────────────────────────────────────────
const $  = (id) => document.getElementById(id);
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
const svg = d3.select("#graph").append("svg").attr("width", W).attr("height", H);
const gMain = svg.append("g");          // transform target
let   tx  = d3.zoomIdentity;

const zoom = d3.zoom().on("zoom", (e) => {
  tx = e.transform;
  gMain.attr("transform", tx);
});
svg.call(zoom);

// Pulse helper (KGR mode)
function applyTx(pScale = 1) {
  const cx = W / 2, cy = H / 2;
  const k  = tx.k * pScale;
  const x  = cx - (cx - tx.x) * pScale;
  const y  = cy - (cy - tx.y) * pScale;
  gMain.attr("transform", `translate(${x},${y}) scale(${k})`);
}

// ─── SVG Defs ──────────────────────────────────────────────────
const defs = svg.append("defs");

defs.append("filter").attr("id", "glow")
  .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%")
  .call((f) => {
    f.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", 2.5).attr("result", "b");
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

// ─── State ─────────────────────────────────────────────────────
let graphData     = { nodes: [], links: [] };
let sim           = null;
let linkSel, nodeSel, labelSel;

let labelsOn      = true;
let selectedNode  = null;
let filterState   = {};
let kgrMode       = false;
let kgrTimer      = null;
let linkingMode   = false;
let linkSrc       = null;
let formMode      = null; // "add" | "edit"

// ─── Persistence ───────────────────────────────────────────────
function cleanData(d) {
  return {
    nodes: d.nodes.map((n) => {
      const o = { id: n.id, type: n.type };
      if (n.description) o.description = n.description;
      if (n.url)         o.url         = n.url;
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
  toastTimer = setTimeout(() => (el.className = warn ? "toast-warn" : ""), 2600);
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
    .force("link",    d3.forceLink(graphData.links).id((d) => d.id).distance(115))
    .force("charge",  d3.forceManyBody().strength(-300))
    .force("center",  d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide(32));
}

// ─── D3 general-update render ──────────────────────────────────
function renderGraph() {
  // Links
  gMain.selectAll("g.g-links").remove();
  const gLinks = gMain.append("g").attr("class", "g-links");
  linkSel = gLinks.selectAll("line")
    .data(graphData.links)
    .join("line")
    .attr("stroke", "#1e2a38")
    .attr("stroke-width", 1.8)
    .attr("stroke-opacity", 0.9);

  // Nodes
  gMain.selectAll("g.g-nodes").remove();
  const gNodes = gMain.append("g").attr("class", "g-nodes");
  nodeSel = gNodes.selectAll("circle")
    .data(graphData.nodes, (d) => d.id)
    .join("circle")
    .attr("r", 18)
    .attr("fill", "#0c1118")
    .attr("stroke", (d) => COLOR[d.type] || "#4a5568")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .call(
      d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag",  (e, d) => { d.fx = e.x;   d.fy = e.y; })
        .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
    )
    .on("click", onNodeClick);

  // Labels
  gMain.selectAll("g.g-labels").remove();
  const gLabels = gMain.append("g").attr("class", "g-labels").style("display", labelsOn ? "" : "none");
  labelSel = gLabels.selectAll("text")
    .data(graphData.nodes, (d) => d.id)
    .join("text")
    .text((d) => d.id)
    .attr("fill", "#567080")
    .attr("font-size", 11)
    .attr("font-family", "'JetBrains Mono', monospace")
    .attr("text-anchor", "middle")
    .style("pointer-events", "none");

  // Update sim
  sim.nodes(graphData.nodes);
  sim.force("link").links(graphData.links);
  sim.alpha(0.4).restart();

  sim.on("tick", () => {
    linkSel
      .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
    nodeSel.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    labelSel.attr("x", (d) => d.x).attr("y", (d) => d.y - 27);
  });

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

    const color  = COLOR[type] || "#ccc";
    const row    = document.createElement("label");
    row.className = "filter-row";

    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = filterState[type]; cb.className = "filter-checkbox";

    const dot = document.createElement("span");
    dot.className = "filter-dot";
    dot.style.borderColor = color;
    dot.style.background  = filterState[type] ? color + "22" : "transparent";

    const txt = document.createElement("span");
    txt.className   = "filter-text";
    txt.textContent = type;

    cb.addEventListener("change", () => {
      filterState[type]     = cb.checked;
      dot.style.background  = cb.checked ? color + "22" : "transparent";
      applyFilters();
    });

    row.append(cb, dot, txt);
    el.appendChild(row);
  });
}

function applyFilters() {
  if (!nodeSel || !linkSel || !labelSel) return;
  nodeSel.style("display",  (d) => filterState[d.type] === false ? "none" : "");
  labelSel.style("display", (d) => labelsOn && filterState[d.type] !== false ? "" : "none");
  linkSel.style("display",  (l) => {
    const s = l.source && l.source.type;
    const t = l.target && l.target.type;
    return filterState[s] === false || filterState[t] === false ? "none" : "";
  });
}

// ─── Panel: state machine ───────────────────────────────────────

function panelDefault() {
  formMode = null;
  $("view-main").style.display = "";
  $("view-form").style.display = "none";
  $("node-title").textContent  = "zecevolucja";
  $("node-title").className    = "";
  $("node-type-badge").textContent = "";
  $("node-description").textContent = "Kliknij węzeł grafu, aby zobaczyć opis.";
  $("node-description").className   = "desc-placeholder";
  const lk = $("node-link"); if (lk) { lk.textContent = ""; lk.href = "#"; }
  $("node-actions").style.display = "none";
}

function panelDetail(d) {
  formMode = null;
  $("view-main").style.display = "";
  $("view-form").style.display = "none";

  const color = COLOR[d.type] || "#6a7a8a";
  $("node-title").textContent = d.id;
  $("node-title").className   = "node-active";

  const badge = $("node-type-badge");
  badge.textContent    = d.type || "";
  badge.style.color       = color;
  badge.style.borderColor = color;

  const desc = $("node-description");
  desc.textContent = d.description || "(brak opisu)";
  desc.className   = "";

  const lk = $("node-link");
  if (lk) {
    const href = d.url || "";
    if (href) { lk.textContent = "↗ Otwórz link"; lk.href = href; }
    else       { lk.textContent = ""; lk.href = "#"; }
  }
  $("node-actions").style.display = "";
}

function panelForm(mode, nodeData = null) {
  formMode = mode;
  $("view-main").style.display = "none";
  $("view-form").style.display = "";

  $("form-mode-title").textContent = mode === "edit" ? `Edytuj: ${nodeData?.id || ""}` : "Nowy węzeł";
  $("form-id").value    = nodeData?.id          || "";
  $("form-id").disabled = mode === "edit";       // ID immutable (breaks links)
  $("form-type").value  = nodeData?.type         || "proces";
  $("form-desc").value  = nodeData?.description  || "";
  $("form-url").value   = nodeData?.url          || "";

  setTimeout(() => $("form-id").focus(), 50);
}

function closeForm() {
  formMode = null;
  $("view-form").style.display = "none";
  $("view-main").style.display = "";
  selectedNode ? panelDetail(selectedNode) : panelDefault();
}

// ─── CRUD operations ───────────────────────────────────────────

function submitForm() {
  const id   = $("form-id").value.trim();
  const type = $("form-type").value;
  const desc = $("form-desc").value.trim();
  const url  = $("form-url").value.trim();

  if (!id) { $("form-id").focus(); showToast("ID jest wymagane", true); return; }

  if (formMode === "add") {
    if (graphData.nodes.find((n) => n.id === id)) {
      showToast("Węzeł o tym ID już istnieje", true); return;
    }
    const newNode = { id, type };
    if (desc) newNode.description = desc;
    if (url)  newNode.url         = url;
    graphData.nodes.push(newNode);
    saveToStorage();
    buildSim();
    renderGraph();
    selectedNode = graphData.nodes.find((n) => n.id === id);
    if (nodeSel) nodeSel.classed("selected", (n) => n.id === id).attr("stroke-width", (n) => n.id === id ? 3 : 2);
    panelDetail(selectedNode);
    showToast(`Dodano: ${id}`);

  } else if (formMode === "edit" && selectedNode) {
    selectedNode.type        = type;
    selectedNode.description = desc || undefined;
    selectedNode.url         = url  || undefined;
    saveToStorage();
    if (nodeSel) nodeSel.attr("stroke", (d) => COLOR[d.type] || "#4a5568");
    panelDetail(selectedNode);
    showToast(`Zapisano: ${id}`);
  }
}

function deleteSelectedNode() {
  if (!selectedNode) return;
  const id = selectedNode.id;

  // Remove node
  graphData.nodes = graphData.nodes.filter((n) => n.id !== id);

  // Remove attached links (resolve id from D3 object ref)
  graphData.links = graphData.links.filter((l) => {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    return s !== id && t !== id;
  });

  selectedNode = null;
  saveToStorage();
  buildSim();
  renderGraph();
  panelDefault();
  stopKgr();
  showToast(`Usunięto: ${id}`);
}

// ─── Link (edge) mode ──────────────────────────────────────────
function startLinkMode() {
  linkingMode = true;
  linkSrc     = null;
  document.body.classList.add("linking");
  $("link-banner").classList.add("active");
  $("link-banner-text").textContent = "Kliknij węzeł źródłowy";

  // deselect current
  selectedNode = null;
  if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
  panelDefault();
}

function cancelLinkMode() {
  linkingMode = false;
  linkSrc     = null;
  document.body.classList.remove("linking");
  $("link-banner").classList.remove("active");
  if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
}

// ─── Node click handler ────────────────────────────────────────
function onNodeClick(event, d) {
  event.stopPropagation();

  if (linkingMode) {
    if (!linkSrc) {
      // First click = source
      linkSrc = d;
      nodeSel.classed("selected", (n) => n.id === d.id).attr("stroke-width", (n) => n.id === d.id ? 3 : 2);
      $("link-banner-text").textContent = `${d.id} → kliknij węzeł docelowy`;
    } else {
      // Second click = target
      if (linkSrc.id !== d.id) {
        const s  = linkSrc.id;
        const t  = d.id;
        const dup = graphData.links.some((l) => {
          const ls = typeof l.source === "object" ? l.source.id : l.source;
          const lt = typeof l.target === "object" ? l.target.id : l.target;
          return ls === s && lt === t;
        });
        if (!dup) {
          graphData.links.push({ source: s, target: t });
          saveToStorage();
          buildSim();
          renderGraph();
          showToast(`Relacja: ${s} → ${t}`);
        } else {
          showToast("Relacja już istnieje", true);
        }
      }
      cancelLinkMode();
    }
    return;
  }

  // Normal select
  selectedNode = d;
  nodeSel.classed("selected", (n) => n.id === d.id).attr("stroke-width", (n) => n.id === d.id ? 3 : 2);
  panelDetail(d);

  if (d.id === "KGR") startKgr();
  else stopKgr();
}

// Background click = deselect
svg.on("click", () => {
  if (linkingMode) { cancelLinkMode(); return; }
  if (selectedNode) {
    selectedNode = null;
    if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
    stopKgr();
    panelDefault();
  }
});

// ─── KGR mode ──────────────────────────────────────────────────
function startKgr() {
  if (kgrMode) return;
  kgrMode = true;
  sim.alphaTarget(0.6).restart();
  if (nodeSel) nodeSel.transition().duration(250).attr("r", (n) => n.id === "KGR" ? 30 : 18);
  if (linkSel) linkSel.attr("filter", "url(#glow)").attr("stroke", "url(#kgrEnergy)");
  const t0 = performance.now();
  kgrTimer = d3.timer(() => {
    const t = (performance.now() - t0) / 1000;
    applyTx(1 + Math.sin(t * 2.6) * 0.012);
    const w = 1 + Math.sin(t * 11) * 0.18;
    if (linkSel) linkSel.attr("stroke-width", 1.35 * w).attr("stroke-opacity", 0.55 + 0.25 * Math.sin(t * 6));
    energyGrad.attr("gradientTransform", `translate(${(t * 90) % 220},0)`);
  });
}

function stopKgr() {
  if (!kgrMode) return;
  kgrMode = false;
  sim.alphaTarget(0);
  if (kgrTimer) { kgrTimer.stop(); kgrTimer = null; }
  applyTx(1);
  if (nodeSel) nodeSel.transition().duration(250).attr("r", 18);
  if (linkSel) linkSel.attr("filter", null).attr("stroke", "#1e2a38").attr("stroke-width", 1.8).attr("stroke-opacity", 0.9);
  energyGrad.attr("gradientTransform", "translate(0,0)");
}

// ─── Export ────────────────────────────────────────────────────
function exportJSON() {
  const clean = cleanData(graphData);
  const blob  = new Blob([JSON.stringify(clean, null, 2)], { type: "application/json" });
  const url   = URL.createObjectURL(blob);
  const a     = document.createElement("a");
  a.href = url; a.download = "data.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("data.json pobrano — skopiuj do docs/");
}

// ─── View controls ─────────────────────────────────────────────
function fitView() {
  if (!graphData.nodes.length) return;
  simulation && sim.alpha(0.1).restart();

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  graphData.nodes.forEach(({ x, y }) => {
    if (typeof x !== "number" || typeof y !== "number") return;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  });
  if (!isFinite(minX)) { svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity); return; }

  const pad = 70;
  const gW  = maxX - minX || 1, gH = maxY - minY || 1;
  const scale = Math.min(4, Math.max(0.1, Math.min((W - pad) / gW, (H - pad) / gH)));
  const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(scale).translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
  svg.transition().duration(350).call(zoom.transform, t);
}

// ─── Button wiring ─────────────────────────────────────────────
function wireButtons() {
  // View
  const btnReset = $("btn-reset-view");
  if (btnReset) btnReset.addEventListener("click", () =>
    svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity));

  const btnFit = $("btn-fit-view");
  if (btnFit) btnFit.addEventListener("click", fitView);

  const btnLabels = $("btn-toggle-labels");
  if (btnLabels) btnLabels.addEventListener("click", () => {
    labelsOn = !labelsOn;
    btnLabels.style.opacity = labelsOn ? "1" : "0.45";
    gMain.select("g.g-labels").style("display", labelsOn ? "" : "none");
    applyFilters();
  });

  // Graph edit
  const btnAddNode = $("btn-add-node");
  if (btnAddNode) btnAddNode.addEventListener("click", () => {
    cancelLinkMode();
    selectedNode = null;
    if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
    panelForm("add");
  });

  const btnAddLink = $("btn-add-link");
  if (btnAddLink) btnAddLink.addEventListener("click", () => {
    if (linkingMode) { cancelLinkMode(); return; }
    startLinkMode();
  });

  const btnExport = $("btn-export");
  if (btnExport) btnExport.addEventListener("click", exportJSON);

  const btnCancelLink = $("btn-cancel-link");
  if (btnCancelLink) btnCancelLink.addEventListener("click", cancelLinkMode);

  // Node actions
  const btnEdit = $("btn-edit-node");
  if (btnEdit) btnEdit.addEventListener("click", () => {
    if (selectedNode) panelForm("edit", selectedNode);
  });

  const btnDelete = $("btn-delete-node");
  if (btnDelete) btnDelete.addEventListener("click", () => {
    if (!selectedNode) return;
    if (confirm(`Usunąć węzeł "${selectedNode.id}" i wszystkie jego relacje?`)) {
      deleteSelectedNode();
    }
  });

  // Form
  const btnSubmit = $("btn-form-submit");
  if (btnSubmit) btnSubmit.addEventListener("click", () => {
    submitForm();
    closeForm();
  });

  const btnCancel = $("btn-form-cancel");
  if (btnCancel) btnCancel.addEventListener("click", closeForm);
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (linkingMode) { cancelLinkMode(); return; }
    if (formMode) { closeForm(); return; }
    if (selectedNode) {
      selectedNode = null;
      if (nodeSel) { nodeSel.classed("selected", false); nodeSel.attr("stroke-width", 2); }
      stopKgr(); panelDefault();
    }
  }
  if ((e.key === "l" || e.key === "L") && !e.target.closest("input, textarea, select")) {
    labelsOn = !labelsOn;
    const btn = $("btn-toggle-labels");
    if (btn) btn.style.opacity = labelsOn ? "1" : "0.45";
    gMain.select("g.g-labels").style("display", labelsOn ? "" : "none");
    applyFilters();
  }
  if (e.key === "Delete" && selectedNode && !formMode) {
    if (confirm(`Usunąć węzeł "${selectedNode.id}"?`)) deleteSelectedNode();
  }
  // Enter submits form
  if (e.key === "Enter" && formMode && e.target.tagName !== "TEXTAREA") {
    submitForm(); closeForm();
  }
});

// Resize
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    refreshSize();
    svg.attr("width", W).attr("height", H);
    if (sim) { sim.force("center", d3.forceCenter(W / 2, H / 2)); sim.alpha(0.2).restart(); }
  }, 100);
});

// ─── Bootstrap ─────────────────────────────────────────────────
setStatus({ loading: true, error: false });
wireButtons();

const cached = loadFromStorage();

if (cached && cached.nodes && cached.nodes.length) {
  // Use localStorage cache
  graphData = cached;
  setStatus({ loading: false, error: false });
  buildSim();
  renderGraph();
} else {
  // Load from data.json
  d3.json("data.json")
    .then((raw) => {
      setStatus({ loading: false, error: false });
      graphData = raw;
      saveToStorage(); // seed localStorage
      buildSim();
      renderGraph();
    })
    .catch((err) => {
      console.error("data.json load failed:", err);
      setStatus({ loading: false, error: true });
    });
}
