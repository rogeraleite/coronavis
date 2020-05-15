import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() zoomOutput = new EventEmitter<any>();
  @Output() selectedDayOutput = new EventEmitter<any>();
  

  protected svg: any;
  protected gCanvas: any;
  protected color_scale: any;
  protected divKey;
  protected width;
  protected height;
  protected margin = {top: -5, right: 0, bottom: 10, left: 0};
  protected newTransform: any;

  protected zoom: any;
  protected received_zoom_flag: boolean = true;
  protected currentTransform;

  protected current_data;
  protected current_data_grouped;
  protected events_data;
  protected yDimension = "cases";

  protected axis_x: any;
  protected axis_y: any;
  protected scale_x: any;
  protected scale_y: any;
  protected gAxis_x: any;
  protected gAxis_y: any;

  protected event_elements: any;
  
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
    this.width = $(this.divKey).width()*0.99;
    this.margin.right = 0;//- $(this.divKey).width()*0.05;
    this.height = ($(document).height()/18) //+ this.margin.top/2;         
    this.currentTransform = d3.zoomIdentity.translate(100,0).scale(1);
  }
  getData() {    
    this.current_data = this.dm.getCurrentDataByCountryList(null);    
    this.events_data = this.dm.getEventsDataByCountryList(null);

    this.current_data_grouped = d3.nest() // nest function allows to group the calculation per level of a factor
                                  .key((d) => {return d.country;})
                                  .entries(this.current_data);
  }

  createChart() {
    this.filterSelectedCountryEvents();
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
    this.drawDateSelector();
    this.applyZoomFeature();
  }

  drawDateSelector() {
    let date = this.dm.getSelectedDate();
    this.gCanvas.append("rect")
                .attr("class", "selector")
                .attr("height", ()=>{ 
                  let size = this.calculateRectSize(100);
                  return size;
                })
                .attr("width", 8)
                .style("fill", "none")
                .style("stroke", "black")
                .attr("x", () => { return this.scale_x(date); })
                .attr("y", (d)=>{ 
                  let size = this.calculateRectSize(100);
                  let x = this.height-size-this.margin.bottom;
                  return x;
                });
  }

  filterSelectedCountryEvents() {
    let result = []

    this.events_data.forEach((e)=>{
      if(this.dm.isSelectedCountry(e.country)){
        result.push(e);
      }
    })

    this.events_data = result;
  }

  setSVG() {
    this.svg = d3.select(this.divKey)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .attr("transform", "translate("+this.margin.right+"," + this.margin.top + ")");
  }
  setCanvas() {
    this.gCanvas = this.svg.append("g")
                           .attr("class", "canvas-timeline");
  }
  setXYScales() {
    this.scale_x = d3.scaleTime().range([0, this.width]);
    this.scale_y = d3.scalePoint().range([this.height, 0]);
  }
  scaleXYDomains() {
    this.setXDomain_asDate();
    this.setYDomain_asCountries();
  }
  setYDomain_asCountries() {
    this.scale_y.domain([0,this.height/100]);
  }
  setXDomain_asDate(){
    this.scale_x.domain(d3.extent(this.events_data, (d) => { return d.date; }));
  }
  calculateColors() {
    let map_result = this.current_data_grouped.map(function(d){ return d.key }) // list of group names      
    this.color_scale = d3.scaleOrdinal()
                         .domain(map_result)
                         .range(this.dm.getColorsArray())
  }
  drawData() {
    this.event_elements = this.gCanvas.selectAll("rect")
                          .data(this.events_data)
                          .enter()
                            .append("rect")
                            .attr("height", (d)=>{ 
                              let size = this.calculateRectSize(d.LegacyStringencyIndexForDisplay);
                              return size;
                            })
                            .attr("width", 8)
                            .style("fill", (d) => { 
                              let color = this.dm.getColorByCountry(d.country);
                              if(this.dm.separateEventNotes(d).length== 0){
                                color = "white"
                              }
                              return color;
                            })
                            .attr("x", (d) => { return this.scale_x(d.date); })
                            .attr("y", (d)=>{ 
                              let size = this.calculateRectSize(d.LegacyStringencyIndexForDisplay);
                              let x = this.height-size-this.margin.bottom;
                              return x;
                            })
                            .on("click", (d) => {
                              this.updateSelectedDate(d);
                            });
  }
  calculateRectSize(value){
    let size = (value/100)*(this.height-this.margin.bottom-1);
    return size
  }
  drawAxis() {    
    this.drawAxisX();
    // this.drawAxisY(); 
  }
  drawAxisX(){
    this.axis_x = d3.axisTop(this.scale_x)
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height-this.margin.bottom) + ")")
                              .call(this.axis_x);        
  }
  drawAxisY(){
    this.axis_y =  d3.axisLeft()
                      .scale(this.scale_y)
                      .tickSize(this.height)
    this.gAxis_y = this.svg.append("g")
                            .attr("class", "axis axis-y")                              
                            .call(this.axis_y);   
  }


  applyZoomFeature() {          
      let zoomed = () => {
        this.newTransform = d3.event.transform;    
        this.applyZoom(this.newTransform);
        this.emitZoomOutput(this.newTransform);
      } 
      this.zoom = d3.zoom()
                    .scaleExtent([0.7, 5])
                    .translateExtent([[-300, -150], [this.width + 150, this.height + 150]])
                    .on('zoom', zoomed);
      this.zoom(this.svg);
                    
      this.svg.call(this.zoom)    
              .call(this.zoom.transform, this.currentTransform);
  }

  transformCanvas(transform){
    if(this.gCanvas){      
      this.currentTransform = d3.zoomIdentity.translate(transform.x, 0).scale(transform.k);
      this.gCanvas.attr("transform", this.currentTransform);
    }    
  }
  receiveZoom(transform){
    if(this.svg){
        let t = d3.zoomIdentity
                  .translate(transform.x, transform.y)                  
                  .scale(transform.k);        
        this.activeReceivedZoomFlag();
        this.svg.call(this.zoom.transform, t);
    }
  }
  applyZoom(transform){
    if(transform){      
      this.zoomAxisX(transform);     
      this.transformCanvas(transform);
      this.paintAxis();   
    }
  }
  emitZoomOutput(transform){
    if(!this.hasJustReceivedZoom()){  
      this.zoomOutput.emit(transform);
    }
    this.deactivateReceivedZoomFlag();          
  }

  emitDaySelectionOutput(d){
    this.selectedDayOutput.emit(d)
  }

  paintAxis(){     
    if(this.gAxis_x){
      let axis_color = "gray";
      let axis_opacity = .1;  
      this.gAxis_x.selectAll(".tick line")
                  .attr("stroke",axis_color)
                  .attr("opacity",axis_opacity);
      this.gAxis_x.selectAll(".tick text")
                  .attr("transform", "translate(0,18)");
                  // .attr("transform", "translate(-8,-15) rotate(90)");
      // this.gAxis_y.selectAll(".tick line")
      //             .attr("stroke",axis_color)
      //             .attr("opacity",axis_opacity)
      //             .attr("transform", "translate(0,18)");;
    }
  }

  zoomAxisX(curTransform){        
    if(curTransform && this.gAxis_x){
        this.gAxis_x.call(this.axis_x.scale(curTransform.rescaleX(this.scale_x)));
    }
  }
  refreshChart(){
    this.cleanCanvas();
    this.createChart();
  }
  cleanCanvas(){
    if(this.svg) this.svg.remove();
  }
  changeFeature(feature){      
    this.yDimension = feature;
    this.refreshChart();
  }
  isDeathsDimension(){
    return this.yDimension == "deaths"
  }
  isCasesDimension(){
    return this.yDimension == "cases"
  }
  hasJustReceivedZoom(){
    return this.received_zoom_flag;
  }
  deactivateReceivedZoomFlag(){
    this.received_zoom_flag = false;
  }
  activeReceivedZoomFlag(){
    this.received_zoom_flag = true;
  }

  loadCountriesByArray(countries:Array<string>){
    let first_country = countries[0];
    this.current_data = this.dm.getCurrentDataByCountryList([first_country]);       
    this.events_data = this.dm.getEventsDataByCountryList(first_country);
    this.current_data_grouped = d3.nest() // nest function allows to group the calculation per level of a factor
                                  .key((d) => {return d.country;})
                                  .entries(this.current_data);
    this.refreshChart();
  }
  // timeline-chart
  
  updateSelectedCountry(){
    let selected_country = this.dm.getSelectedCountry();
    this.loadCountriesByArray([selected_country]);
  }
  updateSelectedDate(d){
    this.dm.setSelectedDate(d.date);
    this.emitDaySelectionOutput(d);
    this.refreshChart();
  }
}
