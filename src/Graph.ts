//@ts-ignore
import * as d3 from 'd3';

//Credit: https://bl.ocks.org/d3noob/13a36f70a4f060b97e41

export default class Graph {

    constructor(errorData: any, class1ErrorData: any, class2ErrorData: any, class3ErrorData: any){
        this.constructGraph(errorData, class1ErrorData, class2ErrorData, class3ErrorData);
    }


    constructGraph(errorData: any, class1ErrorData: any, class2ErrorData: any, class3ErrorData: any){
        // Set the dimensions of the canvas / graph
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;
        // var margin = {top: 20, right: 20, bottom: 20, left: 20},
        // width = 300,
        // height = 200;

        // const {errorData, class1ErrorData, class2ErrorData, class3ErrorData } = data;
        // let dataToSort = data.errorData ? data.errorData : data;
        //@ts-ignore
        let sortedData = Object.values(errorData).sort((a,b)=>{
            return b.time-a.time
        })
        console.log("Sorted Data: ", sortedData)

        let smallestTime = sortedData[sortedData.length-1].time
        let largestTime = sortedData[0].time

        console.log("Smallest Time: ", smallestTime)
        console.log("Largest Time: ", largestTime)

        // Set the ranges
        var x = d3.scaleLinear().domain([smallestTime, largestTime]).range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        
        // Define the axes
        const yAxisTick = (d: any)=>{
            // console.log("yAxistick: ", d);
            return d;
        }

        var xAxis = d3.axisBottom(x).ticks(10)
        var yAxis = d3.axisLeft(y).tickFormat(yAxisTick);

        
        // Define the line
        var valueline = d3.line()
        .x(function(d: any) {
            // console.log("D.time: ", d.time);
            return x(d.time);
        })
        .y(function(d: any) {
            // console.log("D.error: ", d.error);
            return y(d.error);
        });

        var class1ErrorDataLine = d3.line()
        .x(function(d: any) { return x(d.time); })
        .y(function(d: any) { return y(d.error); });

        var class2ErrorDataLine = d3.line()
        .x(function(d: any) { return x(d.time); })
        .y(function(d: any) { return y(d.error); });

        var class3ErrorDataLine = d3.line()
        .x(function(d: any) { return x(d.time); })
        .y(function(d: any) { return y(d.error); });
        
        // Adds the svg canvas
        var svg = d3.select("#chart")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",  
            "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        x.domain(d3.extent(errorData, function(d: any) { return d.time; }));
        y.domain([0, d3.max(errorData, function(d: any) { return d.error; })]);


        // Add the valueline path for all errors
        svg.append("path")
            .attr("class", "allClasses")
            .style("stroke", "black")
            .style("stroke-width", 2)
            .style("fill", "none")
            .style("shape-rendering", "crispEdges")
            .attr("d", valueline(errorData));

        // Add the valueline path for class 2
        // svg.append("path")
        //     .attr("class", "class1")
        //     .style("stroke", "red")
        //     .style("stroke-width", 2)
        //     .style("fill", "none")
        //     .style("shape-rendering", "crispEdges")
        //     .attr("d", class1ErrorDataLine(class1ErrorData));

        // // Add the valueline path for class 2
        // svg.append("path")
        //     .attr("class", "class2")
        //     .style("stroke", "blue")
        //     .style("stroke-width", 2)
        //     .style("fill", "none")
        //     .style("shape-rendering", "crispEdges")
        //     .attr("d", class2ErrorDataLine(class2ErrorData));

        // // Add the valueline path for class 3
        // svg.append("path")
        //     .attr("class", "class3")
        //     .style("stroke", "green")
        //     .style("stroke-width", 2)
        //     .style("fill", "none")
        //     .style("shape-rendering", "crispEdges")
        //     .attr("d", class3ErrorDataLine(class3ErrorData));
            

        // Add the X Axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Add the Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        let legendXPosition = width-(width*.1);
        let legendYPosition = height-(height*.9);

        svg.append("circle").attr("cx",legendXPosition-20).attr("cy",legendYPosition).attr("r", 6).style("fill", "black")
        svg.append("text").attr("x", legendXPosition).attr("y", legendYPosition).text("All Error").style("font-size", "15px").attr("alignment-baseline","middle")

        // svg.append("circle").attr("cx",legendXPosition-20).attr("cy",legendYPosition).attr("r", 6).style("fill", "red")
        // svg.append("text").attr("x", legendXPosition).attr("y", legendYPosition).text("Class 1").style("font-size", "15px").attr("alignment-baseline","middle")

        // svg.append("circle").attr("cx",legendXPosition-20).attr("cy",legendYPosition+30).attr("r", 6).style("fill", "blue")
        // svg.append("text").attr("x", legendXPosition).attr("y", legendYPosition+30).text("Class 2").style("font-size", "15px").attr("alignment-baseline","middle")

        // svg.append("circle").attr("cx",legendXPosition-20).attr("cy",legendYPosition+60).attr("r", 6).style("fill", "green")
        // svg.append("text").attr("x", legendXPosition).attr("y", legendYPosition+60).text("Class 3").style("font-size", "15px").attr("alignment-baseline","middle")

        // svg.append("circle").attr("cx",200).attr("cy",130).attr("r", 6).style("fill", "#69b3a2")
        // svg.append("circle").attr("cx",200).attr("cy",160).attr("r", 6).style("fill", "#404080")
        // svg.append("text").attr("x", 220).attr("y", 130).text("variable A").style("font-size", "15px").attr("alignment-baseline","middle")
        // svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")


        // .style("fill", "none") 
        // .style("stroke", "grey")
        // .style("stroke-width", "1")
        // .style("shape-rendering", "crispEdges")
    
    }


}