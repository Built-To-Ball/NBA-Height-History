/*  
    Copyright Abid Rahman 2018
    Filename: histogram.js
    JS file for the NBA height history animation graph
*/

// The main SVG for the histogram
var histSVG = d3.select(".histgraph").append("svg"),
    histWidth = 300,
    histHeight = 400;

histSVG.attr("height", histHeight)
       .attr("width", histWidth);

// The y axis for the histogram
var histoY = d3.scale.linear(),
    histoYaxis = d3.svg.axis();

var delta = 0.001,
    i = 0, j,
    n = 100, // Total number of random points.
    k = 20; // Number of points to replace per frame.

//The location of the initial hexagons
var rx = histWidth / 2,
    ry = d3.random.normal(histHeight/2, 40),
    points = d3.range(n).map(function() { return [rx, ry()]; });

//The color of the hexagons, range between light red and red
var histColor = d3.scale.linear()
    .domain([0, 20])
    .range(["#E8B5B3", "#D64640"]);

//Init the hexbin
var hexbin = d3.hexbin()
    .radius(15)
    .extent([[0, 0], [histWidth, histHeight]]);

var hexagon = histSVG.selectAll("path")
    .data(hexbin(points))
    .enter().append("path")
        .attr("d", hexbin.hexagon(14.5))
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("fill", function(d) { return histColor(d.length); });


histoYaxis.scale(histoY).orient("left");
histoY.range([histHeight - 20, 20]);
histoY.domain([60,95]);

histSVG.append("text")
    .attr("class", "yearLabelTitle")
    .attr("x", 185)
    .attr("y", 25)
    .text("Rookie Year: ");

//Render the plot y axis
histSVG.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(50, 0)")
    .call(histoYaxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", -20)
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Player Height (inches)");

d3.interval(function(elapsed) {
    rx = histWidth / 2,
    ry = d3.random.normal((histHeight/2) + 40*Math.sin(elapsed * delta), 40);
    for (j = 0; j < k; ++j, i = (i + 1) % n) points[i][0] = rx, points[i][1] = ry();

    hexagon = hexagon
        .data(hexbin(points), function(d) { return d.x + "," + d.y; });

    histSVG.selectAll(".hex").data(hexbin(points), function(d) { return d.x + "," + d.y; }).exit().remove();
    histSVG.select(".yearLabel").remove();

    hexagon = hexagon.enter().append("path")
        .attr("class", "hex")
        .attr("d", hexbin.hexagon(14.5))
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    histSVG.selectAll(".hex").attr("fill", function(d) { return histColor(d.length); });

    histSVG.append("text")
        .attr("class", "yearLabel")
        .attr("x", 200)
        .attr("y", 50)
        .text("2018");

}, 100);