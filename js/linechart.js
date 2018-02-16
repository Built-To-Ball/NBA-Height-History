/*  
    Copyright Abid Rahman 2018
    Filename: linechart.js
    JS file for the NBA height history average line graph
*/
$( document ).ready(function () {
        
    var avgSVG = d3.select("#avgheightgraph").append("svg"),
        avglwidth = 950,
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
        avglyaxis = d3.svg.axis().tickFormat(d3.format(".0f"));

    avglyaxis.scale(avgly).orient("left");
    avgly.range([avglheight - 20, 20]);
    avgly.domain([74,80]);

    //Init valueline
    var valueline = d3.svg.line()
        .x(function(d) { return avglx(d.x); })
        .y(function(d) { return avgly(d.y); });

    //Add title to chart
    avgSVG.append("text")
        .attr("class" , "lCharttitle")
        .attr("x", 125)
        .attr("y", 75)
        .text("Average Height of Draft Class");

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

    //Setup the player info
    var yearInfoDisp = avgSVG.append("g").attr("class", "yearInfo").attr("transform", "translate(450, 275)");
            
    yearInfoDisp.append("text").attr("id", "yearInfoYear").attr("y", 0);
    yearInfoDisp.append("text").attr("id", "yearInfoValue").attr("y", 20);

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

        //Add value line path
        avgSVG.append("path")
            .attr("d", valueline(averages))
            .attr("stroke", "rgba(221, 225, 119, 0.7)")
            .attr("fill", "none")
            .attr("stroke-width", "2.5")
            .attr("shape-rendering", "auto");

        avgSVG.selectAll("dot")
            .data(averages)
        .enter().append("circle")
            .attr("r", 6)
            .attr("cx", function(d) { return avglx(d.x); })
            .attr("cy", function(d) { return avgly(d.y); })
            .attr("stroke", "rgb(206, 81, 74)")
            .attr("fill", "none")
            .on("mouseover", function(d) {
                d3.select(this).showYearInfo();
                d3.select(this).style("fill", "var(--main_lighter)");
            })
            .on("mouseout", function(d) {
                d3.select(this).hideYearInfo();
                d3.select(this).style("fill", "none");
            });
        
        //Appends year info to the SVG
        d3.selection.prototype.showYearInfo = function(d) {
            yearInfo = this[0][0].__data__;
            $(".yearInfo").css("display","block");

            avgSVG.select("#yearInfoYear").text("Year: " + yearInfo.x).style();
            avgSVG.select("#yearInfoValue").text("Average Height: " + yearInfo.y.toFixed(2) + " in");
            return this;
        };

        d3.selection.prototype.hideYearInfo = function() {
            $(".yearInfo").css("display","none");
            return this;
        };
    });
});