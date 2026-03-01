// P0/P1: stabilne wymiary (kontener #graph), loading/error UX, filtry w panelu (#filters)

const graphEl = document.getElementById("graph");

// Status UI (index.html)
const statusLoadingEl = document.getElementById("status-loading");
const statusErrorEl = document.getElementById("status-error");

// Panel filtrów (index.html)
const filtersEl = document.getElementById("filters");

function setStatus({ loading, error }) {
  if (statusLoadingEl) statusLoadingEl.style.display = loading ? "block" : "none";
  if (statusErrorEl) statusErrorEl.style.display = error ? "block" : "none";
}

function getGraphSize() {
  const rect = graphEl ? graphEl.getBoundingClientRect() : null;
  const w = rect && rect.width ? rect.width : window.innerWidth;
  const h = rect && rect.height ? rect.height : window.innerHeight;
  return { width: Math.max(320, Math.floor(w)), height: Math.max(240, Math.floor(h)) };
}

function clearElement(el) {
  if (!el) return;
  while (el.firstChild) el.removeChild(el.firstChild);
}

let { width, height } = getGraphSize();

const svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const container = svg.append("g");

let currentTransform = d3.zoomIdentity;

function applyTransform(pulseScale = 1) {
  // Skalowanie "wokół środka ekranu", żeby puls nie powodował dryfu
  const cx = width / 2;
  const cy = height / 2;

  const p = pulseScale;
  const x = cx - (cx - currentTransform.x) * p;
  const y = cy - (cy - currentTransform.y) * p;
  const k = currentTransform.k * p;

  container.attr("transform", `translate(${x},${y}) scale(${k})`);
}

const zoom = d3.zoom().on("zoom", (event) => {
  currentTransform = event.transform;
  applyTransform(1);
});
svg.call(zoom);

// --- P1: Tryb KGR (UI-only): puls, drżenie relacji, animowany gradient energii ---
const defs = svg.append("defs");

// Glow dla relacji
defs
  .append("filter")
  .attr("id", "kgrGlow")
  .attr("x", "-50%")
  .attr("y", "-50%")
  .attr("width", "200%")
  .attr("height", "200%")
  .call((f) => {
    f.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2.2)
      .attr("result", "blur");
    f.append("feMerge").call((m) => {
      m.append("feMergeNode").attr("in", "blur");
      m.append("feMergeNode").attr("in", "SourceGraphic");
    });
  });

// Gradient energii (animowany przez gradientTransform)
const energyGradient = defs
  .append("linearGradient")
  .attr("id", "kgrEnergy")
  .attr("gradientUnits", "userSpaceOnUse")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 220)
  .attr("y2", 0);

energyGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffaa00").attr("stop-opacity", 0.95);
energyGradient.append("stop").attr("offset", "50%").attr("stop-color", "#00ffff").attr("stop-opacity", 0.95);
energyGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffaa00").attr("stop-opacity", 0.95);

let kgrMode = false;
let kgrTimer = null;

function startKgrMode({ simulation, nodeSel, linkSel }) {
  if (kgrMode) return;
  kgrMode = true;

  // "więcej energii"
  simulation.alphaTarget(0.6).restart();

  // podkreśl KGR
  nodeSel
    .transition()
    .duration(250)
    .attr("r", (n) => (n.id === "KGR" ? 28 : 18));

  // relacje: glow + gradient
  linkSel
    .attr("filter", "url(#kgrGlow)")
    .attr("stroke", "url(#kgrEnergy)");

  const t0 = performance.now();

  kgrTimer = d3.timer(() => {
    const t = (performance.now() - t0) / 1000;

    // globalne pulsowanie: delikatne (fazowe)
    const pulse = 1 + Math.sin(t * 2.6) * 0.012;
    applyTransform(pulse);

    // "drżenie relacji": modulacja grubości i opacity + przesuw gradientu
    const wobble = 1 + Math.sin(t * 11.0) * 0.18;
    linkSel
      .attr("stroke-width", 1.35 * wobble)
      .attr("stroke-opacity", 0.55 + 0.25 * Math.sin(t * 6.0));

    const offset = (t * 90) % 220;
    energyGradient.attr("gradientTransform", `translate(${offset},0)`);
  });
}

function stopKgrMode({ simulation, nodeSel, linkSel }) {
  if (!kgrMode) return;
  kgrMode = false;

  simulation.alphaTarget(0);

  // wyłącz timer
  if (kgrTimer) {
    kgrTimer.stop();
    kgrTimer = null;
  }

  // wróć do normalnego transformu (bez pulsu)
  applyTransform(1);

  // reset wyglądu
  nodeSel.transition().duration(250).attr("r", 18);

  linkSel
    .attr("filter", null)
    .attr("stroke", "#444")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 1);

  energyGradient.attr("gradientTransform", "translate(0,0)");
}

setStatus({ loading: true, error: false });

d3.json("data.json")
  .then((data) => {
    setStatus({ loading: false, error: false });

    const overlay = d3.select("#overlay");
    const overlayContent = d3.select("#overlay-content");

    const colorMap = {
      proces: "#00ffff",
      stan: "#00ff88",
      zagrożenie: "#ff5555",
      meta: "#ffaa00",
    };

    // Force
    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links
    const link = container
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#444")
      .attr("stroke-width", 1.5);

    // Nodes
    const node = container
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 18)
      .attr("fill", "#1e1e1e")
      .attr("stroke", (d) => colorMap[d.type] || "#ccc")
      .attr("stroke-width", 2)
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

       // Labels (P1: wydajność — auto-hide dla dużych grafów)
    const LABELS_AUTOHIDE_THRESHOLD = 150;
    let labelsVisible = (data.nodes || []).length <= LABELS_AUTOHIDE_THRESHOLD;

    const label = container
      .append("g")
      .attr("data-layer", "labels")
      .style("display", labelsVisible ? "block" : "none")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("fill", "#ccc")
      .attr("font-size", 14)
      .attr("text-anchor", "middle");

    // Toggle etykiet: klawisz "L"
    document.addEventListener("keydown", (e) => {
      if (e.key === "l" || e.key === "L") {
        labelsVisible = !labelsVisible;
        container
          .select('g[data-layer="labels"]')
          .style("display", labelsVisible ? "block" : "none");
      }
    });

    // --- P1: FILTRY W PANELU (#filters), bez fixed div na body ---
    const types = [...new Set((data.nodes || []).map((n) => n.type).filter(Boolean))];

    // stan filtrów (one source of truth)
    const filterState = Object.fromEntries(types.map((t) => [t, true]));

    function applyFilters() {
      node.style("display", (d) => (filterState[d.type] === false ? "none" : "block"));
           label.style("display", (d) =>
        labelsVisible && filterState[d.type] !== false ? "block" : "none"
      );

      // Krawędzie: pokazuj tylko jeśli oba końce są widoczne (czytelniejsze i logiczniejsze)
      link.style("display", (l) => {
        const sType = l.source && l.source.type;
        const tType = l.target && l.target.type;
        const sOn = filterState[sType] !== false;
        const tOn = filterState[tType] !== false;
        return sOn && tOn ? "block" : "none";
      });
    }

    // render UI filtrów
    if (filtersEl) {
      clearElement(filtersEl);

      // minimalny markup bez inline CSS w JS (style dopniemy w style.css w kolejnym kroku)
      types.forEach((type) => {
        const row = document.createElement("label");
        row.className = "filter-row";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = true;
        cb.className = "filter-checkbox";
        cb.addEventListener("change", () => {
          filterState[type] = cb.checked;
          applyFilters();
              // P1: sterowanie widokiem (reset / fit)
    const btnReset = document.getElementById("btn-reset-view");
    const btnFit = document.getElementById("btn-fit-view");

    if (btnReset) {
      btnReset.addEventListener("click", () => {
        svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity);
      });
    }

    if (btnFit) {
      btnFit.addEventListener("click", () => {
        // jeśli nie ma pozycji (np. przed pierwszym tick), zrób szybki restart
        simulation.alpha(0.2).restart();

        // bounding box na podstawie aktualnych x/y węzłów
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        for (const n of data.nodes) {
          const x = n.x;
          const y = n.y;
          if (typeof x !== "number" || typeof y !== "number") continue;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
          // fallback: reset jeśli nie da się policzyć bbox
          svg.transition().duration(250).call(zoom.transform, d3.zoomIdentity);
          return;
        }

        const graphW = maxX - minX;
        const graphH = maxY - minY;

        // margines w ekranie
        const pad = 60;
        const scale = Math.min(
          4, // górny limit zoom-in, żeby nie przesadzić
          Math.max(
            0.1,
            Math.min((width - pad) / graphW, (height - pad) / graphH)
          )
        );

        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        const transform = d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-midX, -midY);

        svg.transition().duration(350).call(zoom.transform, transform);
      });
    }
        });

        const dot = document.createElement("span");
        dot.className = "filter-dot";
        dot.style.borderColor = colorMap[type] || "#ccc";

        const text = document.createElement("span");
        text.className = "filter-text";
        text.textContent = type;

        row.appendChild(cb);
        row.appendChild(dot);
        row.appendChild(text);

        filtersEl.appendChild(row);
      });
    }

    applyFilters();

    // Click node
    node.on("click", (event, d) => {
      event.stopPropagation();

      d3.select("#overlay-title").text(d.id);
      d3.select("#overlay-description").text(d.description || "");

      overlay.classed("hidden", false);

            // TRYB KGR (UI-only): globalny puls + świecące relacje + gradient energii
      if (d.id === "KGR") {
        startKgrMode({ simulation, nodeSel: node, linkSel: link });
      } else {
        stopKgrMode({ simulation, nodeSel: node, linkSel: link });
      }
    });

    overlay.on("click", () => {
  overlay.classed("hidden", true);
  stopKgrMode({ simulation, nodeSel: node, linkSel: link });
});
    overlayContent.on("click", (e) => e.stopPropagation());
        // UX: Esc zamyka overlay
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !overlay.classed("hidden")) {
        overlay.classed("hidden", true);
      }
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y - 28);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Resize
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const size = getGraphSize();
        width = size.width;
        height = size.height;

        svg.attr("width", width).attr("height", height);
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.2).restart();
      }, 100);
    });
  })
  .catch((err) => {
    console.error("Failed to load data.json:", err);
    setStatus({ loading: false, error: true });
  });
