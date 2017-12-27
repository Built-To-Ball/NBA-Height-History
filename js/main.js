//JS file, where the magic happens

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) {
        return "<span>" + d.name + "</span>";
    });

svg.call(tip);

d3.csv("data/player_data.csv", function(error, data) {
    if (error) throw error;

    console.log(data.length);
    console.log(typeof data);

    data.forEach(function(d, index, object) {
        d.height = +d.height;
        d.weight = +d.weight;

        //There are 5 players with no weights, get rid of them
        if (d.weight == 0) {
            object.splice(index, 1);
        }

    });

    x.domain(d3.extent(data, function(d) { return d.weight; })).nice();
    y.domain(d3.extent(data, function(d) { return d.height; })).nice();

    // Render the total.
    d3.selectAll("#total")
    .text((data.length));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Player Weight (lbs)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Player Height (inches)");

    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.weight); })
        .attr("cy", function(d) { return y(d.height); })
        .style("fill", "red")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    
})