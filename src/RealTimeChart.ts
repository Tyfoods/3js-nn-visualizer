//@ts-ignore

import * as d3 from 'd3';

function randomNumberBounds(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
}

const DURATION = 500;

//Credit https://bl.ocks.org/pjsier/fbf9317b31f070fd540c5523fef167ac

export default class RealTimeChart {

    lineArr: any[];
    MAX_LENGTH: number;
    duration: number;
    chart: any;

    constructor(seedData: any){

        this.lineArr = [];
        this.MAX_LENGTH = 100;
        this.duration = DURATION;
        this.chart = this.realTimeLineChart();

        // console.log("Real time chart INIT");

        this.seedData(seedData);

        // setInterval((()=>{
        //     this.updateData();
        // }), 500);

        // d3.select("#chart").datum(this.lineArr).call(this.chart);
        d3.select(window).on('resize', this.resize);
    }

    addTitle(title: string = ""){
        d3.select("#chart svg")
            .append("text")
            .attr("x", (300 / 2))             
            .attr("y", 15)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("color", "#000")
            .text(title);
    }

    addChart(){
        // console.log("Adding chart to screen");
        d3.select("#chart").datum(this.lineArr).call(this.chart);
    }

    removeChart(){
        // console.log("Removing chart from screen");
        d3.select("#chart").html("");
    }

    seedData(seedData: any) {
        // var now = new Date();
        for (var i = 0; i < this.MAX_LENGTH; ++i) {
            this.lineArr.push({
            // time: new Date(now.getTime() - ((this.MAX_LENGTH - i) * this.duration)),
            time: 0,
            // x: randomNumberBounds(0, 5),
            // y: randomNumberBounds(0, 2.5),
            // z: randomNumberBounds(0, 10)
            Error: seedData.error,
            // y: 0,
            // z: 0
            });
        }
    }

    updateData(data: any) {
        // var now = new Date();

        
        var lineData = {
            // time: now,
            time: data.time,
            Error: data.error,
            // y: randomNumberBounds(0, 2.5),
            // z: randomNumberBounds(0, 10)
        };

        this.lineArr.push(lineData);
        
        if (this.lineArr.length > 30) {
            this.lineArr.shift();
        }
        d3.select("#chart").datum(this.lineArr).call(this.chart);
    }

    resize() {
        if (d3.select("#chart svg").empty()) {
            return;
        }
        this.chart.width(+d3.select("#chart").style("width").replace(/(px)/g, ""));
        d3.select("#chart").call(this.chart);
    }


    realTimeLineChart() {
        
        var margin = {top: 20, right: 20, bottom: 20, left: 20},
            width = 300,
            height = 200,
            duration = DURATION,
            //@ts-ignore
            color = d3.schemeCategory10;
            function chart(selection: any) {
                
                // Based on https://bl.ocks.org/mbostock/3884955
                selection.each(function(data: any) {
                    data = ["Error"].map(function(c) {
                    // data = ["x", "y", "z"].map(function(c) {
                        return {
                            label: c,
                            values: data.map(function(d: any) {
                                return {time: +d.time, value: d[c]};
                            })
                        };
                    });
                    
                    //@ts-ignore
                    var t = d3.transition().duration(duration).ease(d3.easeLinear),
                    //@ts-ignore
                    x = d3.scaleTime().rangeRound([0, width-margin.left-margin.right]),
                    //@ts-ignore
                    y = d3.scaleLinear().rangeRound([height-margin.top-margin.bottom, 0]),
                    //@ts-ignore
                    z = d3.scaleOrdinal(color);
                    //@ts-ignore
                    var xMin = d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.time; })});
                    // console.log("xMin: ", xMin);
                    // var xMin = 0;
                    //@ts-ignore
                    // var xMax = 10000;
                    var xMax = new Date(new Date(d3.max(data, function(c) {
                        //@ts-ignore
                        return d3.max(c.values, function(d) { return d.time; })
                    })).getTime() - (duration*2));
                    
                    x.domain([xMin, xMax]);
                    y.domain([
                        //@ts-ignore
                        d3.min(data, function(c) { return d3.min(c.values, function(d) { return d.value; })}),
                        //@ts-ignore
                        d3.max(data, function(c) { return d3.max(c.values, function(d) { return d.value; })})
                    ]);
            z.domain(data.map(function(c: any) { return c.label; }));
        
            //@ts-ignore
            var line = d3.line()
                //@ts-ignore
                .curve(d3.curveLinear)
                // .curve(d3.curveBasis)
                .x(function(d: any) { return x(d.time); })
                .y(function(d: any) { return y(d.value); });
        
            //@ts-ignore
            var svg = d3.select(this).selectAll("svg").data([data]);

            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "axis x");
            gEnter.append("g").attr("class", "axis y");
            gEnter.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width-margin.left-margin.right)
                .attr("height", height-margin.top-margin.bottom);
            gEnter.append("g")
                .attr("class", "lines")
                .attr("clip-path", "url(#clip)")
                .selectAll(".data").data(data).enter()
                .append("path")
                    .attr("class", "data");
        
            var legendEnter = gEnter.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (width-margin.right-margin.left-75) + ",25)");
            legendEnter.append("rect")
                .attr("width", 50)
                .attr("height", 75)
                .attr("fill", "#ffffff")
                .attr("fill-opacity", 0.7);
            legendEnter.selectAll("text")
                .data(data).enter()
                .append("text")
                .attr("y", function(d: any, i: any) { /* console.log(20); */ return i; })
                // .attr("y", function(d: any, i: any) { return (i*20) + 25; })
                .attr("x", 5)
                .attr("fill", function(d: any) { return z(d.label); });
        
            var svg = selection.select("svg");
            svg.attr('width', width).attr('height', height);
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
            g.select("g.axis.x")
                .attr("transform", "translate(0," + (height-margin.bottom-margin.top) + ")")
                .transition(t)
                //@ts-ignore
                .call(d3.axisBottom(x).ticks(5));
            g.select("g.axis.y")
                .transition(t)
                .attr("class", "axis y")
                //@ts-ignore
                .call(d3.axisLeft(y));
        
            g.select("defs clipPath rect")
                .transition(t)
                .attr("width", width-margin.left-margin.right)
                .attr("height", height-margin.top-margin.right);
        
            g.selectAll("g path.data")
                .data(data)
                .style("stroke", function(d: any) { return z(d.label); })
                .style("stroke-width", 1)
                .style("fill", "none")
                .transition()
                .duration(duration)
                //@ts-ignore
                .ease(d3.easeLinear)
                .on("start", tick);
        
            g.selectAll("g .legend text")
                .data(data)
                .text(function(d: any) {
                return d.label.toUpperCase() + ": " + d.values[d.values.length-1].value;
                });
        
                // For transitions https://bl.ocks.org/mbostock/1642874
                function tick() {

                    //Makes transitions smooth
                    //Draws line every time step.

                    //@ts-ignore
                    d3.select(this)
                    .attr("d", function(d: any) {  return line(d.values); })
                    .attr("transform", null);
            
                    var xMinLess = new Date(new Date(xMin).getTime() - duration);
                    //@ts-ignore
                    d3.active(this)
                        .attr("transform", "translate(" + x(xMinLess) + ",0)")
                    .transition()
                        .on("start", tick);
                }
            });
        }

        // chart.addTitle = function(title: string = ""){
        //          //Adding title
        //     this.append("text")
        //         .attr("x", (width / 2))             
        //         .attr("y", 0 - (margin.top / 2))
        //         .attr("text-anchor", "middle")  
        //         .style("font-size", "16px") 
        //         .style("text-decoration", "underline")  
        //         .text(title);
        // }
        
        chart.margin = function(_:any) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
        };
        
        chart.width = function(_:any) {
            if (!arguments.length) return width;
            width = _;
            return chart;
        };
        
        chart.height = function(_:any) {
            if (!arguments.length) return height;
            height = _;
            return chart;
        };
        
        chart.color = function(_:any)  {
            if (!arguments.length) return color;
            color = _;
            return chart;
        };
        
        chart.duration = function(_:any)  {
            if (!arguments.length) return duration;
            duration = _;
            return chart;
        };
        
        return chart;
    }
}