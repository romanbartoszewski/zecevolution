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

svg.call(
  d3.zoom().on("zoom", (event) => {
    container.attr("transform", event.transform);
  })
);

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

    // Labels
    const label = container
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .text((d) => d.id)
      .attr("fill", "#ccc")
      .attr("font-size", 14)
      .attr("text-anchor", "middle");

    // --- P1: FILTRY W PANELU (#filters), bez fixed div na body ---
    const types = [...new Set((data.nodes || []).map((n) => n.type).filter(Boolean))];

    // stan filtrów (one source of truth)
    const filterState = Object.fromEntries(types.map((t) => [t, true]));

    function applyFilters() {
      node.style("display", (d) => (filterState[d.type] === false ? "none" : "block"));
      label.style("display", (d) => (filterState[d.type] === false ? "none" : "block"));

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

      // TRYB KGR (UI-only) — nie dotykamy definicji, tylko efekt wizualny
      if (d.id === "KGR") {
        simulation.alphaTarget(0.6).restart();

        node
          .transition()
          .duration(300)
          .attr("r", (n) => (n.id === "KGR" ? 28 : 18));

        link
          .transition()
          .duration(300)
          .attr("stroke", (l) =>
            l.source.id === "KGR" || l.target.id === "KGR" ? "#ffaa00" : "#444"
          );
      } else {
        simulation.alphaTarget(0);
        node.transition().duration(300).attr("r", 18);
        link.transition().duration(300).attr("stroke", "#444");
      }
    });

    overlay.on("click", () => overlay.classed("hidden", true));
    overlayContent.on("click", (e) => e.stopPropagation());

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
