import { Component, OnInit, Input } from '@angular/core';

import * as d3 from "d3";
import * as $ from 'jquery';
import { SelectorContext } from '@angular/compiler';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-main-linechart',
  templateUrl: './main-linechart.component.html',
  styleUrls: ['./main-linechart.component.css']
})
export class MainLinechartComponent implements OnInit {
  
  @Input() dm: DataManagerComponent;
  
  private svg: any;
  private svg_width: any;
  private svg_height: any;
  private x: any;
  private y: any;

  private valueLine;

  private margin = {top: 50, right: 30, bottom: 30, left: 90};
  private width = 400 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;
  private data = [
    {date: "2007-04-23", value: 93.24},
    {date: "2007-04-24", value: 95.35},
    {date: "2007-04-25", value: 98.84},
    {date: "2007-04-26", value: 99.92},
    {date: "2007-04-29", value: 99.8},
    {date: "2007-05-01", value: 99.47},
    {date: "2007-05-02", value: 100.39},
    {date: "2007-05-03", value: 100.4},
    {date: "2007-05-04", value: 100.81},
    {date: "2007-05-07", value: 103.92},
     {date: "2007-05-08", value: 105.06},
     {date: "2007-05-09", value: 106.88},
     {date: "2007-05-09", value: 107.34},
     {date: "2007-05-10", value: 108.74},
     {date: "2007-05-13", value: 109.36},
     {date: "2007-05-14", value: 107.52},
     {date: "2007-05-15", value: 107.34},
     {date: "2007-05-16", value: 109.44},
     {date: "2007-05-17", value: 110.02},
     {date: "2007-05-20", value: 111.98},
     {date: "2007-05-21", value: 113.54},
     {date: "2007-05-22", value: 112.89},
     {date: "2007-05-23", value: 110.69},
     {date: "2007-05-24", value: 113.62},
     {date: "2007-05-28", value: 114.35},
     {date: "2007-05-29", value: 118.77},
     {date: "2007-05-30", value: 121.19},
     {date: "2007-06-01", value: 118.4},
     {date: "2007-06-04", value: 121.33},
     {date: "2007-06-05", value: 122.67},
     {date: "2007-06-06", value: 123.64},
     {date: "2007-06-07", value: 124.07},
     {date: "2007-06-08", value: 124.49},
     {date: "2007-06-10", value: 120.19},
     {date: "2007-06-11", value: 120.38},
     {date: "2007-06-12", value: 117.5},
     {date: "2007-06-13", value: 118.75},
     {date: "2007-06-14", value: 120.5},
     {date: "2007-06-17", value: 125.09},
     {date: "2007-06-18", value: 123.66},
  ]
 
  constructor() { }

  ngOnInit() {    
    this.createChart()
  }
  
  createChart(){
    /////////////////////// Part1
    this.setSVG();
    this.setValueLine();
    /////////////////////// Part2
    this.formatData();
    this.scaleXYDomains();
    /////////////////////// Part3
    this.drawLines();
    this.drawAxis();  
  }

  ngAfterContentInit(){  
    $("path.line").css({ fill: "none", stroke: "steelblue" })
  }

  //////////////////////////////////////////////// Part1
  setSVG(){
    this.svg_width = this.width + this.margin.left + this.margin.right;
    this.svg_height = this.height + this.margin.top + this.margin.bottom;
    this.svg = d3.select('div.linechart')
                  .append("svg")
                  .attr("width", this.svg_width)
                  .attr("height", this.svg_height)
                  .append("g")
                  .attr("transform",
                        "translate(" + this.margin.left + "," +
                                       this.margin.top + ")");
  }  
  setValueLine(){    
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    let _x = this.x;
    let _y = this.y;

    this.valueLine = d3.line()
                       .x(function(d) { return _x(d.date); })
                       .y(function(d) { return _y(d.value); });
  }
  //////////////////////////////////////////////// Part2
  formatData() {
    let parseTime = d3.timeParse("%Y-%m-%d");
    this.data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.value = +d.value;
    });
  }
  scaleXYDomains() {
    this.x.domain(d3.extent(this.data, function(d) { return d.date; }));
    this.y.domain([d3.min(this.data, function(d) { return d.value; }),
                   d3.max(this.data, function(d) { return d.value; })]);
  }
  //////////////////////////////////////////////// Part3
  drawLines() {
    this.svg.append("path")
            .data([this.data])
            .attr("class", "line")
            .attr("d", this.valueLine);
  }
  drawAxis() {
    // Add the X Axis
    this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x));

    // Add the Y Axis
    this.svg.append("g")
            .call(d3.axisLeft(this.y));
  }

  

}
