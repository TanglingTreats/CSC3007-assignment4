// Get data
const fetch_case_data = fetch("./cases-sample.json").then((res) => {
  return res.json();
});
const fetch_links_data = fetch("./links-sample.json").then((res) => {
  return res.json();
});

(async () => {
  const case_data = await fetch_case_data;
  const links_data = await fetch_links_data;

  console.log(case_data);
  console.log(links_data);
})();

let width = 800,
  height = 800;

var slider = document.getElementById("myRange");
var output = document.getElementById("x-force");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
  output.innerHTML = this.value;
  simulation
    .force(
      "x",
      d3
        .forceX()
        .strength(0.5)
        .x((d) => xPosition(d.class) * this.value + width / (classNumber - 1))
    )
    .force(
      "y",
      d3
        .forceY()
        .strength(0.2)
        .y(height / 2)
    )
    .alphaTarget(0.3)
    .restart();
};

let svg = d3.select("svg").attr("width", width).attr("height", height);

let classNumber = 5;
let colorScale = d3
  .scaleLinear()
  .domain([0, classNumber - 1])
  .range([0, 1]);

let xPosition = d3
  .scaleLinear()
  .domain([0, classNumber - 1])
  .range([0, 5]);

let xPosStep = 110;

let numOfData = 100;
let data = [];
for (let i = 0; i < numOfData; i++) {
  let obj = { x: 400, y: 400 };
  obj.id = "node" + i;
  obj.class = Math.floor(Math.random() * classNumber);
  data.push(obj);
}

let links = [];
for (let i = 0; i < numOfData / 2; i++) {
  let obj = {};
  obj.source = "node" + Math.floor((Math.random() * numOfData) / 2);
  obj.target = "node" + Math.floor(Math.random() * numOfData);
  links.push(obj);
}

let node = svg
  .append("g")
  .attr("id", "nodes")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("r", 10)
  .style("fill", (d) => d3.interpolateViridis(colorScale(d.class)))
  .call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

let linkpath = svg
  .append("g")
  .attr("id", "links")
  .selectAll("path")
  .data(links)
  .enter()
  .append("path")
  .attr("fill", "none")
  .attr("stroke", "black");

let simulation = d3
  .forceSimulation()
  .nodes(data)
  .force(
    "x",
    d3
      .forceX()
      .strength(0.5)
      .x((d) => xPosition(d.class) * xPosStep + width / (classNumber - 1))
  )
  .force(
    "y",
    d3
      .forceY()
      .strength(0.3)
      .y(height / 2)
  )
  .force("charge", d3.forceManyBody().strength(0))
  .force("collide", d3.forceCollide().strength(0.1).radius(15))
  .force(
    "link",
    d3
      .forceLink(links)
      .id((d) => d.id)
      .distance(60)
      .strength(0.5)
  )
  .on("tick", (d) => {
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    linkpath.attr(
      "d",
      (d) =>
        "M" +
        d.source.x +
        "," +
        d.source.y +
        " " +
        d.target.x +
        "," +
        d.target.y
    );
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
