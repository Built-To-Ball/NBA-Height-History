/*  
    Copyright Abid Rahman 2018
    Filename: linechart.js
    JS file for the NBA height history average line graph
*/

var avgweightSVG = d3.select(".avgwlinechart").append("svg"),
    avglwwidth = 650,
    avglwheight = 400;
    
avgweightSVG.attr("height", avglwheight)
      .attr("width", avglwwidth);

//X axis
var avglwx = d3.scale.linear(),
    avglwxaxis = d3.svg.axis().tickFormat(d3.format("d"));

avglwxaxis.scale(avglwx).orient("bottom");
avglwx.range([20, avglwwidth - 20]);
avglwx.domain([1947, 2018]);

//Y axis
var avglwy = d3.scale.linear(),
    avglwyaxis = d3.svg.axis().tickFormat(d3.format("d"));

avglwyaxis.scale(avglwy).orient("left");
avglwy.range([avglwheight - 20, 20]);
avglwy.domain([0,30]);

//Init tip
var avgwTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) {
        return "<span>" + d.x + "<br>" + d3.round(d.y) + "%<br></span>";
    });

avgweightSVG.call(avgwTip);

//Init valueline
var valuewline = d3.svg.line()
    .x(function(d) { return avglwx(d.x); })
    .y(function(d) { return avglwy(d.y); });

avgweightSVG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, 380)")
    .call(avglwxaxis);

avgweightSVG.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(20, 0)")
    .call(avglwyaxis);

avgweightSVG.append("text")
    .attr("id", "avgwtitle")
    .attr("x", 450)
    .attr("y", 0)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Percentage of Drafted Players Over 250lbs");

d3.csv("data/player_data.csv", function(error, players) {
    if (error) throw error;

    var years = {},
        averages = [];

    //Preprocess data
    players.forEach(function(d, index, object) {
        d.weight = +d.weight;
        d.year_start = +d.year_start;

        //For each year, get an array of the weight values
        if (!(d.year_start in years)) {
            years[d.year_start] = {
                total: 0,
                over250: 0
            };
        }
        years[d.year_start].total += 1;
        if (d.weight > 250) { years[d.year_start].over250 += 1; }
    });

    console.log(years);

    //Calculate average height for every year
    Object.keys(years).map(function(objectKey, index) {
        averages.push({
            x: objectKey,
            y: (years[objectKey].over250 / years[objectKey].total) * 100
        });
    });

    console.log(averages);

    //Add value line path
    avgweightSVG.append("path")
        .attr("d", valuewline(averages))
        .attr("stroke", "#C64C40")
        .attr("fill", "none")
        .attr("stroke-width", "2.5")
        .attr("shape-rendering", "auto");

    avgweightSVG.selectAll("dot")
        .data(averages)
      .enter().append("circle")
        .attr("r", 4)
        .attr("cx", function(d) { return avglwx(d.x); })
        .attr("cy", function(d) { return avglwy(d.y); })
        .attr("stroke", "#C64C40")
        .attr("fill", "none")
        .on("mouseover", function(d) {
            avgwTip.show(d);
            d3.select(this).style("fill", "C64C40");
        })
        .on("mouseout", function(d) {
            avgwTip.hide(d);
            d3.select(this).style("fill", "none");
        });

    //Append line for Shaq's rookie year
    avgweightSVG.append("path")
        .attr("d", "M " + avglwx(1993) + " 350 L " + avglwx(1993) + " 150")
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-opacity", "0.8");
    
    avgweightSVG.append("text")
        .attr("class", "label")
        .attr("x", avglwx(1993) - 5)
        .attr("y", 200)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Shaquille O'Neal's Rookie Year");
});