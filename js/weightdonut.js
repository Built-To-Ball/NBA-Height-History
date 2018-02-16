/*  
    Copyright Abid Rahman 2018
    Filename: weightdonut.js
    JS file for the NBA height history average line graph
*/
$( document ).ready(function () {

    // avgweightSVG.append("text")
    //     .attr("id", "avgwtitle")
    //     .attr("x", 450)
    //     .attr("y", 0)
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .text("Percentage of Drafted Players Over 250lbs");

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

        //Calculate average height for every year
        Object.keys(years).map(function(objectKey, index) {
            averages.push({
                x: objectKey,
                y: (years[objectKey].over250 / years[objectKey].total) * 100
            });
        });
    });


    d3.select("input[value=\"total\"]").property("checked", true);

    var circSvg = d3.select("#weightdonut")
        .append("svg")
        .append("g");
    
    circSvg.append("g")
        .attr("class", "slices");
    circSvg.append("g")
        .attr("class", "labelName");
    circSvg.append("g")
        .attr("class", "lines");
    circSvg.append("g")
        .attr("class", "donutTitle");

    circSvg.select(".donutTitle").append("text")
        .attr("class","chartTitle")
        .attr("transform", "translate(0, -20)")
        .text("Percentage of Drafted Players")
        .style("text-anchor", "middle");

    circSvg.select(".donutTitle").append("text")
        .attr("class","yearTitle");
    
    var width = 900,
        height = 450,
        radius = Math.min(width, height) / 2;
    
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });
    
    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);
    
    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
    
    circSvg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scale.ordinal()
        .range(["rgb(206, 81, 74)", "rgb(190,200,138)"]);
    
    datasetTotal = [
            {label:"Over 250 lbs", value:40},
            {label:"Under 250 lbs", value:60}
            ];
    
    change(datasetTotal);
    
    // d3.selectAll("input")
    //     .on("change", selectDataset);
    
    function change(data) {
    
        /* ------- PIE SLICES -------*/
        var slice = circSvg.select(".slices").selectAll("path.slice")
            .data(pie(data), function(d){ return d.data.label; });
    
        slice.enter()
            .insert("path")
            .style("fill", function(d) { return color(d.data.label); })
            .attr("class", "slice");
    
        slice.transition().duration(1000)
            .attrTween("d", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = d;
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        slice.on("mouseover", function(d){
                d3.select(this).transition()
                    .attr('d', d3.svg.arc()
                        .outerRadius(radius * 0.875)
                        .innerRadius(radius * 0.40)
                    );
            });
        slice.on("mouseout", function(d){
                d3.select(this).transition().duration(500)
                    .ease('bounce')
                    .attr('d', d3.svg.arc()
                        .outerRadius(radius * 0.80)
                        .innerRadius(radius * 0.40)
                    );
            });
    
        slice.exit()
            .remove();
    
        /* ------- TEXT LABELS -------*/
    
        var text = circSvg.select(".labelName").selectAll("text")
            .data(pie(data), function(d){ return d.data.label; });

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .text(function(d) {
                return (d.data.label+": "+d.value+"%");
            });
    
        function midAngle(d){
            return d.startAngle + (d.endAngle - d.startAngle)/2;
        }
    
        text.transition().duration(1000)
            .attrTween("transform", function(d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            })
            .text(function(d) {
                return (d.data.label+": "+d.value+"%");
            });
    
    
        text.exit()
            .remove();
    
        /* ------- SLICE TO TEXT POLYLINES -------*/
    
        var polyline = circSvg.select(".lines").selectAll("polyline")
            .data(pie(data), function(d){ return d.data.label; });
    
        polyline.enter()
            .append("polyline");
    
        polyline.transition().duration(1000)
            .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });
    
        polyline.exit()
            .remove();
    }

    /* ------- SLIDER -------- */
    var x = d3.scale.linear()
        .domain([1947, 2018])
        .range([40, width - 40])
        .clamp(true);

    var slider = circSvg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(-" + width/2 + ", " + height/2 + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay");

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(15))
    .enter().append("text")
        .attr("x", x)
        .attr("text-anchor", "middle")
        .text(function(d) { return d; });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
});