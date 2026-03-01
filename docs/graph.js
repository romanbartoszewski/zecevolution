// P0: stabilne wymiary (na kontenerze, nie na viewport) + loading/error UX

const graphEl = document.getElementById("graph");

// Status UI (dodane w index.html)
const statusLoadingEl = document.getElementById("status-loading");
const statusErrorEl = document.getElementById("status-error");

function setStatus({ loading, error }) {
  if (statusLoadingEl) statusLoadingEl.style.display = loading ? "block" : "none";
  if (statusErrorEl) statusErrorEl.style.display = error ? "block" : "none";
}

function getGraphSize() {
  // Jeśli #graph nie ma jeszcze rozmiaru (np. wstępny layout), fallback na viewport.
  const rect = graphEl ? graphEl.getBoundingClientRect() : null;
  const w = rect && rect.width ? rect.width : window.innerWidth;
  const h = rect && rect.height ? rect.height : window.innerHeight;
  return { width: Math.max(320, Math.floor(w)), height: Math.max(240, Math.floor(h)) };
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

    const link = container
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#444")
      .attr("stroke-width", 1.5);

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

    // FILTER PANEL (dynamicznie) — dług utrzymaniowy, ale nie ruszam w P0
    const filterPanel = d3
      .select("body")
      .append("div")
      .style("position", "fixed")
      .style("top", "20px")
      .style("right", "20px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("padding", "15px")
      .style("border", "1px solid #444");

    const types = [...new Set(data.nodes.map((n) => n.type))];

    types.forEach((type) => {
      const labelEl = filterPanel
        .append("label")
        .style("display", "block")
        .style("color", "#ccc");

      labelEl
        .append("input")
        .attr("type", "checkbox")
        .attr("checked", true)
        .on("change", function () {
          const visible = this.checked;

          node
            .filter((d) => d.type === type)
            .style("display", visible ? "block" : "none");

          // Uwaga: ta logika jest „na skróty” i przy wielu wyłączeniach typów bywa myląca.
          // P1: przebudujemy to na stan filtrów + pełne przeliczenie widoczności.
          link.style("display", (l) =>
            (l.source.type === type || l.target.type === type) && !visible ? "none" : "block"
          );
        });

      labelEl
        .append("span")
        .text(" " + type)
        .style("color", colorMap[type]);
    });

    // KLIK WĘZŁA
    node.on("click", (event, d) => {
      event.stopPropagation();

      d3.select("#overlay-title").text(d.id);
      d3.select("#overlay-description").text(d.description || "");

      overlay.classed("hidden", false);

      // TRYB KGR (UI-only)
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

    // P0: resize — przelicz rozmiar SVG i przestaw center force.
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
