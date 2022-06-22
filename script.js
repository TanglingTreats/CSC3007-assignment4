// Get data
const fetch_case_data = fetch("./cases-sample.json").then((res) => {
  return res.json();
});
const fetch_links_data = fetch("./links-sample.json").then((res) => {
  return res.json();
});

let width = 800,
  height = 800;

let svg = d3.select("svg").attr("width", width).attr("height", height);

var slider = document.getElementById("myRange");
var output = document.getElementById("x-force");
output.innerHTML = slider.value; // Display the default slider value

(async () => {
  let genderColorScale = d3
    .scaleOrdinal()
    .domain([0, 1])
    .range(["#51A1F0", "#E1ADFF"]);

  const cases_data = await fetch_case_data;
  const links_data = await fetch_links_data;

  const clean_cases_data = cases_data.map((cases) => {
    let gender_code = 0;
    switch (cases.gender) {
      case "male":
        gender_code = 0;
        break;
      case "female":
        gender_code = 1;
        break;
    }

    return {
      ...cases,
      gender: gender_code,
    };
  });

  const clean_links_data = links_data.map((link) => {
    return {
      source: link.infector,
      target: link.infectee,
      date: link.date,
    };
  });

  console.log(clean_cases_data);
  console.log(clean_links_data);

  const numOfData = clean_cases_data.length;

  let data = [];
  for (let i = 0; i < numOfData; i++) {
    let obj = { x: 400, y: 400, ...clean_cases_data[i] };
    //obj.id = "node" + cases_data[i].id;
    obj.class = clean_cases_data[i].gender;
    data.push(obj);
  }

  let links = [];
  const numOfLinks = clean_links_data.length;
  for (let i = 0; i < numOfLinks; i++) {
    let obj = {};
    obj.source = clean_links_data[i].source;
    obj.target = clean_links_data[i].target;
    links.push(obj);
  }

  let linkpath = svg
    .append("g")
    .attr("id", "links")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "black");

  let node = svg
    .append("g")
    .attr("id", "nodes")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 10)
    .style("fill", (d) => genderColorScale(d.class))
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  let simulation = d3
    .forceSimulation()
    .nodes(data)
    .force(
      "x",
      d3
        .forceX()
        .strength(0.5)
        .x(width / 2)
    )
    .force(
      "y",
      d3
        .forceY()
        .strength(0.3)
        .y(height / 2)
    )
    .force("charge", d3.forceManyBody().strength(0))
    .force("collide", d3.forceCollide().strength(0.5).radius(30))
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

  // Update the current slider value (each time you drag the slider handle)
  slider.oninput = function () {
    output.innerHTML = this.value;
    simulation
      .force("collide", d3.forceCollide().strength(0.5).radius(this.value))
      .alphaTarget(0.3)
      .restart();
  };
})();

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
