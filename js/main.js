//JS file, where the magic happens

//Setup SVG size vars
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//Setup the x and y axis 
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

//Used to color code based on position
var color = d3.scale.category10();

//Initialize the svg
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Initalize the mini hover tip
var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5, 0])
    .html(function(d) {
        return "<span>" + d.name + "<br>" + d.height + " in<br>" + d.weight + "lbs<br></span>";
    });

svg.call(tip);

//Import and handle the data
d3.csv("data/player_data.csv", function(error, players) {
    if (error) throw error;

    console.log(players.length);

    players.forEach(function(d, index, object) {
        d.height = +d.height;
        d.weight = +d.weight;
        d.year_start = +d.year_start;
        d.year_end = +d.year_end;

        //There are a few players with no weights, get rid of them
        if (d.weight == 0) {
            object.splice(index, 1);
        }
    });

    //Create crossfilters for the players
    var player = crossfilter(players),
        all = player.groupAll(),
        year = player.dimension(function(d) {
            return d.year_start;
        }),
        years = year.group(Math.floor);

    var charts = [
        barChart()
            .dimension(year)
            .group(years)
          .x(d3.scale.linear()
            .domain([1947, 2019])
            .rangeRound([0 , 900]))
    ];

    //Bind filter to DOM and listen for brush events that change the filter
    var chart = d3.selectAll(".chart")
        .data(charts)
        .each(function(chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });

    renderAll();

    function render(method) {
        d3.select(this).call(method);
    }

    //Handle brush moves on the filter
    function renderAll() {
        chart.each(render);
        d3.select("#active").text((all.value()));
    }

    window.filter = function(filters) {
        filters.forEach(function(d, i) {
            charts[i].filder(d);
        });
        renderAll();
    };

    window.reset = function(i) {
        charts[i].filter(null);
        renderAll();
    };

    x.domain(d3.extent(players, function(d) { return d.weight; })).nice();
    y.domain(d3.extent(players, function(d) { return d.height; })).nice();

    // Render the total.
    d3.selectAll("#total")
    .text((players.length));

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
        .data(players)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.weight); })
        .attr("cy", function(d) { return y(d.height); })
        .style("fill", function(d) { return color(d.position); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(_, i) { return "translate(0," + (250+i*20) + ")"; });
  
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);
  
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
    
    function barChart() {
        if (!barChart.id) barChart.id = 0;
    
        var margin = {top: 10, right: 10, bottom: 20, left: 20},
            x,
            y = d3.scale.linear().range([100, 0]),
            id = barChart.id++,
            axis = d3.svg.axis().orient("bottom"),
            brush = d3.svg.brush(),
            brushDirty,
            dimension,
            group,
            round;
    
        function chart(div) {
            var width = x.range()[1],
                height = y.range()[0];
    
            y.domain([0, group.top(1)[0].value]);
    
            div.each(function() {
            var div = d3.select(this),
                g = div.select("g");
    
            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title-reset").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");
    
                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
                g.append("clipPath")
                    .attr("id", "clip-" + id)
                .append("rect")
                    .attr("width", width)
                    .attr("height", height);
    
                g.selectAll(".bar")
                    .data(["background", "foreground"])
                .enter().append("path")
                    .attr("class", function(d) { return d + " bar"; })
                    .datum(group.all());
    
                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");
    
                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);
    
                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }
    
            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title-reset a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                g.selectAll("#clip-" + id + " rect")
                    .attr("x", 0)
                    .attr("width", width);
                } else {
                var extent = brush.extent();
                g.selectAll("#clip-" + id + " rect")
                    .attr("x", x(extent[0]))
                    .attr("width", x(extent[1]) - x(extent[0]));
                }
            }
    
            g.selectAll(".bar").attr("d", barPath);
            });
    
            function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
            }
            return path.join("");
            }
    
            function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            console.log(x);
            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
            }
        }
    
        brush.on("brushstart.chart", function() {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title-reset a").style("display", null);
        });
    
        brush.on("brush.chart", function() {
            var g = d3.select(this.parentNode),
                extent = brush.extent();
            if (round) g.select(".brush")
                .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
                .style("display", null);
            g.select("#clip-" + id + " rect")
                .attr("x", x(extent[0]))
                .attr("width", x(extent[1]) - x(extent[0]));
            dimension.filterRange(extent);
        });
    
        brush.on("brushend.chart", function() {
            if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
            }
        });
    
        chart.margin = function(_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };
    
        chart.x = function(_) {
            if (!arguments.length) return x;
            x = _;
            axis.scale(x);
            brush.x(x);
            return chart;
        };
    
        chart.y = function(_) {
            if (!arguments.length) return y;
            y = _;
            return chart;
        };
    
        chart.dimension = function(_) {
            if (!arguments.length) return dimension;
            dimension = _;
            return chart;
        };
    
        chart.filter = function(_) {
            if (_) {
            brush.extent(_);
            dimension.filterRange(_);
            } else {
            brush.clear();
            dimension.filterAll();
            }
            brushDirty = true;
            return chart;
        };
    
        chart.group = function(_) {
            if (!arguments.length) return group;
            group = _;
            return chart;
        };
    
        chart.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            return chart;
        };
    
        return d3.rebind(chart, brush, "on");
    }
});
