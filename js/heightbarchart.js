/*  
    Copyright Abid Rahman 2018
    Filename: heightbarchart.js
    JS file for the height barchart comparisons
*/
$( document ).ready(function () {
    //Average indonesian, american, canadian, dutch, and nba player
    var dataset = [ 
                    {label:"Indonesia",     value:62.3},
                    {label:"USA",           value:69},
                    {label:"Canada",        value:69.5},
                    {label:"Netherlands",   value:72.3},
                    {label:"NBA",           value:79.0},
                ];
        hChartwidth = 400;
        hChartheight = 220;

    // Add the svg for the chart
    var hChartsvg = d3.select("#hchart").append("svg")
                .attr("id", "hchartsvg")
                .attr("width", hChartwidth)
                .attr("height", hChartheight);

    bar = hChartsvg.selectAll("g")
        .data(dataset)
        .enter()
        .append("g");

    //Add title to chart
    hChartsvg.append("text")
        .attr("class" , "hCharttitle")
        .attr("x", 20)
        .attr("y", 20)
        .text("Average Male Height (inches)");

    // Add bars to the chart svg
    bar.append("rect")
        .attr("x", function(_, i) { return (i*80) + 20; })
        .attr("y", function(d) { return hChartheight - (d.value-55)*7 - 50; })
        .attr("width", 40)
        .attr("height", function(d) { return (d.value-55)*7; })
        .style("fill", function(d) { 
            if (d.label == "NBA") { return "rgba(210, 220, 150, 0.9)"; 
            } else { return "rgba(127, 140, 141, 0.8)"; }
        });

    // Add values to the bars
    bar.append("text")
        .attr("class", "hChartvalue")
        .text(function(d) { return d3.round(d.value); })
        .attr("x", function(_, i) { return (i*80) + 40; })
        .attr("y", function(d) { return hChartheight - (d.value-55)*7 - 30; });

    // Add labels to the bars
    bar.append("text")
        .attr("class", "hChartlabel")
        .text(function(d) { return d.label; })
        .attr("x", function(_, i) { return (i*80) + 40; })
        .attr("y", hChartheight - 30);
});