/*  
    Copyright Abid Rahman 2018
    Filename: histogram.js
    JS file for the NBA height history animation graph
*/

$(document).ready(function() {
  // The main SVG for the histogram
  var histSVG = d3.select("#histgraph").append("svg"),
    histWidth = 300,
    histHeight = 400;

  histSVG.attr("height", histHeight).attr("width", histWidth);

  // The y axis for the histogram
  var histoY = d3.scale.linear(),
    histoYaxis = d3.svg.axis();

  //The color of the hexagons, range between light red and red
  var histColor = d3.scale
    .linear()
    .domain([0, 20])
    .range(["#0E181D", "rgb(210, 220, 135)"]);

  //Setup the Y Axis
  histoYaxis.scale(histoY).orient("left");
  histoY.range([histHeight - 20, 20]);
  histoY.domain([60, 95]);

  //Render the Y axis
  histSVG
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(50, 0)")
    .call(histoYaxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", -20)
    .attr("y", 6)
    .attr("dy", "0.9em")
    .style("text-anchor", "end")
    .text("Player Height (inches)");

  //Render the year label title
  histSVG
    .append("text")
    .attr("class", "yearLabelTitle")
    .attr("x", 180)
    .attr("y", 25)
    .text("Rookie Year: ");

  //Import the data
  d3.csv("data/player_data.csv", function(error, players) {
    if (error) throw error;

    var years = {},
      numYears = 0,
      currYear = 0;

    //Preprocess data
    players.forEach(function(d, index, object) {
      d.height = +d.height;
      d.year_start = +d.year_start;

      //For each year, get an array of the height values
      if (!(d.year_start in years)) {
        years[d.year_start] = [];
        numYears += 1;
      }
      years[d.year_start].push(d.height);
    });

    //The location of the initial hexagons
    var rx = histWidth / 2,
      ry = d3.scale
        .linear()
        .range([histHeight - 15, 15])
        .domain(
          d3.extent(players, function(d) {
            return d.height;
          })
        )
        .nice();

    var points = years[Object.keys(years)[0]].map(function(d) {
      return new Array(rx, ry(d));
    });

    //Init the hexbin
    var hexbin = d3
      .hexbin()
      .radius(15)
      .extent([[0, 0], [histWidth, histHeight]]);

    d3.interval(function(elapsed) {
      (rx = histWidth / 2),
        (ry = d3.scale
          .linear()
          .range([histHeight - 15, 15])
          .domain(
            d3.extent(players, function(d) {
              return d.height;
            })
          )
          .nice());

      points = years[Object.keys(years)[currYear]].map(function(d) {
        return new Array(rx, ry(d));
      });

      hexagon = histSVG.selectAll("path").data(hexbin(points), function(d) {
        return d.x + "," + d.y;
      });

      histSVG
        .selectAll(".hex")
        .data(hexbin(points), function(d) {
          return d.x + "," + d.y;
        })
        .exit()
        .remove();
      histSVG.select(".yearLabel").remove();

      hexagon = hexagon
        .enter()
        .append("path")
        .attr("class", "hex")
        .attr("d", hexbin.hexagon(14.5))
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("fill", "#0E181D");

      histSVG
        .selectAll(".hex")
        .transition()
        .attr("fill", function(d) {
          return histColor(d.length);
        });

      histSVG
        .append("text")
        .attr("class", "yearLabel")
        .attr("x", 200)
        .attr("y", 50)
        .text(Object.keys(years)[currYear]);

      currYear += 1;
      if (currYear == numYears) {
        currYear = 0;
      }
    }, 500);
  });
});
