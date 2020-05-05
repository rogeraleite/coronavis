import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  protected svg: any;
  protected gCanvas: any;
  protected divKey;
  protected width;
  protected height;
  protected margin = {top: 5, right: 0, bottom: 0, left: 0};

  protected event_data;
  
  constructor() { }

  ngOnInit() {
    this.setup();
    this.createChart();
  }
  setup() {
    this.setDimensionsVariables();
    this.getData();
  }
  setDimensionsVariables(){
    this.divKey = ".timeline-chart";
    this.width = $(this.divKey).width()
    this.height = ($(document).height()/15) + this.margin.top/2;         
  }
  getData() {    
    this.event_data = this.dm.getCurrentDataByCountryList(null);
  }
  createChart() {
    /////////////////////// Part1
    this.setSVG();
    this.setCanvas();
    /////////////////////// Part2
    this.setXYScales();
    this.scaleXYDomains();
    this.calculateColors();
    /////////////////////// Part3
    this.drawData();
    this.drawAxis();  
  }

  setSVG() {
    this.svg = d3.select(this.divKey)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .attr("transform", "translate(0," + this.margin.top + ")");
  }
  setCanvas() {
    this.gCanvas = this.svg.append("g")
                           .attr("class", "canvas")
                           .append("rect")
                           .attr("x", 0)
                           .attr("y", 0)
                           .attr("width", this.width)
                           .attr("height", this.height)
                           .attr("color", "blue");
  }
  setXYScales() {
    throw new Error("Method not implemented.");
  }
  scaleXYDomains() {
    throw new Error("Method not implemented.");
  }
  calculateColors() {
    throw new Error("Method not implemented.");
  }
  drawData() {
    throw new Error("Method not implemented.");
  }
  drawAxis() {
    throw new Error("Method not implemented.");
  }

  // timeline-chart
}
