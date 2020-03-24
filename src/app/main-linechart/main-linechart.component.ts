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
  private groups;

  private margin = {top: 50, right: 30, bottom: 30, left: 90};
  private width = 1200 - this.margin.left - this.margin.right;
  private height = 900 - this.margin.top - this.margin.bottom;
  private data;
 
  constructor() { }

  ngOnInit() {        
    this.data = this.dm.getDataByCountryList(["Brazil","Argentina"]);
    console.log(this.data)
    //{date: "2007-04-24", value: 95.35},
    this.createChart()
  }
  
  createChart(){
    /////////////////////// Part1
    this.setSVG();
    this.groupData()
    /////////////////////// Part2
    this.formatData();
    this.setValueLine();
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
  groupData() {
    this.groups = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key(function(d) { return d.country;})
                    .entries(this.data);
  }
  //////////////////////////////////////////////// Part2
  formatData() {
    this.data.forEach(function(d) {
        d.confirmed = +d.confirmed;
    });
  }
  setValueLine(){    
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    let _x = this.x;
    let _y = this.y;

    this.valueLine = d3.line()
                       .x(function(d) { return _x(d.date); })
                       .y(function(d) { return _y(+d.confirmed); });
  }
  scaleXYDomains() {
    this.x.domain(d3.extent(this.data, function(d) { 
      return d.date; 
    }));
    this.y.domain([d3.min(this.data, function(d) { return +d.confirmed; }),
                   d3.max(this.data, function(d) { return +d.confirmed; })]);
  }
  //////////////////////////////////////////////// Part3
  drawLines() {
    let res = this.groups.map(function(d){ return d.key }) // list of group names
    let color = d3.scaleOrdinal()
                  .domain(res)
                  .range(this.dm.getColorsArray())

    console.log(this.groups)
    this.svg.selectAll(".line")
            .data(this.groups)
            .enter()
              .append("path")
              .attr("fill", "none")
              .attr("stroke", function(d){ 
                return color(d.key) 
              })
              .attr("stroke-width", 2)
              .attr("d", (d)=>{
                return this.valueLine(d.values)
              })
  }
  drawAxis() {
    // Add the X Axis
    this.svg.append("g")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x)
                    .tickFormat(d3.timeFormat("%Y-%m-%d")));

    // Add the Y Axis
    this.svg.append("g")
            .call(d3.axisLeft(this.y));
  }

  

}
