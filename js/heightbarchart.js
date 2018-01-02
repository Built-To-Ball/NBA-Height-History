/*  
    Copyright Abid Rahman 2018
    Filename: heightbarchart.js
    JS file for the height barchart comparisons
*/

//Average indonesian, american, canadian, dutch, and nba player
var dataset = [ 62.3, 69, 69.5, 72.5, 79.0 ],
    hChartwidth = 400;
    hChartheight = 200;

var hChartsvg = d3.select(".hchart").append("svg")
            .attr("id", "hchartsvg")
            .attr("width", hChartwidth)
            .attr("height", hChartheight);

hChartsvg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(_, i) { return i * 80; })
    .attr("y", function(d) { return hChartheight - (d-55)*7; })
    .attr("width", 40)
    .attr("height", function(d) { return (d-55)*7; })
    .style("fill", function(d) { return "rgba(" + (d3.round(d*3) - 50) + ", 10, 10, 0.8)"; });

hChartsvg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) { return d3.round(d); })
    .attr("x", function(_, i) { return (i*80) + 13.5; })
    .attr("y", function(d) { return hChartheight - (d-55)*7 + 20; });