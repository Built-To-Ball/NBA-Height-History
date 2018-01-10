/*  
    Copyright Abid Rahman 2018
    Filename: linechart.js
    JS file for the NBA height history average line graph
*/

var avgSVG = d3.select(".avglinegraph").append("svg"),
    avglwidth = 650,
    avglheight = 400;
    
avgSVG.attr("height", avglheight)
      .attr("width", avglwidth);

//X axis
var avglx = d3.scale.linear(),
    avglxaxis = d3.svg.axis().tickFormat(d3.format("d"));

avglxaxis.scale(avglx).orient("bottom");
avglx.range([20, avglwidth - 20]);
avglx.domain([1947, 2018]);

//Y axis
var avgly = d3.scale.linear(),
    avglyaxis = d3.svg.axis();

avglyaxis.scale(avgly).orient("left");
avgly.range([avglheight - 20, 20]);
avgly.domain([72,82]);

//Init valueline
var valueline = d3.svg.line()
    .x(function(d) { return avglx(d.x); })
    .y(function(d) { return avgly(d.y); });

//Init tip
var avgTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) {
        return "<span>" + d.x + "<br>" + d3.round(d.y, 2) + " in<br></span>";
    });

avgSVG.call(avgTip);

avgSVG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, 380)")
    .call(avglxaxis)
    .append("text")
    .attr("class", "label")
    .attr("x", avglwidth - 20)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Year");

avgSVG.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(20, 0)")
    .call(avglyaxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("x", -20)
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Player Height (inches)");

d3.csv("data/player_data.csv", function(error, players) {
    if (error) throw error;

    var years = {},
        averages = [];

    //Preprocess data
    players.forEach(function(d, index, object) {
        d.height = +d.height;
        d.year_start = +d.year_start;

        //For each year, get an array of the height values
        if (!(d.year_start in years)) {
            years[d.year_start] = [];
        }
        years[d.year_start].push(d.height);
    });

    //Calculate average height for every year
    Object.keys(years).map(function(objectKey, index) {
        averages.push({
            x: objectKey,
            y: d3.mean(years[objectKey])
        });
    });

    console.log(averages);

    //Add value line path
    avgSVG.append("path")
        .attr("d", valueline(averages))
        .attr("stroke", "#C64C40")
        .attr("fill", "none")
        .attr("stroke-width", "2.5")
        .attr("shape-rendering", "auto");

    avgSVG.selectAll("dot")
        .data(averages)
      .enter().append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return avglx(d.x); })
        .attr("cy", function(d) { return avgly(d.y); })
        .attr("stroke", "#C64C40")
        .attr("fill", "none")
        .on("mouseover", function(d) {
            avgTip.show(d);
            d3.select(this).style("fill", "C64C40");
        })
        .on("mouseout", function(d) {
            avgTip.hide(d);
            d3.select(this).style("fill", "none");
        });

});