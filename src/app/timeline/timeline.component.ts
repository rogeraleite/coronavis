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

  protected svg: any;
  protected gCanvas: any;
  protected color_scale: any;
  protected divKey;
  protected width;
  protected height;
  protected margin = {top: 5, right: 0, bottom: 0, left: 0};
  protected newTransform: any;

  protected zoom: any;
  protected received_zoom_flag: boolean = true;
  protected initialTransform;

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
    this.width = $(this.divKey).width()*1.05;
    this.margin.right = - $(this.divKey).width()*0.05;
    this.height = ($(document).height()/15) + this.margin.top/2;         
    this.initialTransform = this.dm.getInitialTransform();
  }
  getData() {    
    this.current_data = this.dm.getCurrentDataByCountryList(null);    
    this.events_data = this.dm.getEventsDataByCountryList(null);

    this.current_data_grouped = d3.nest() // nest function allows to group the calculation per level of a factor
                                  .key((d) => {return d.country;})
                                  .entries(this.current_data);
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
    this.applyZoomFeature();
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
    this.scale_y = d3.scalePoint().range([this.height*0.8, 0]);
  }
  scaleXYDomains() {
    this.setXDomain_asDate();
    this.setYDomain_asCountries();
  }
  setYDomain_asCountries() {
    let domain = this.dm.getCountriesSelection();
    this.scale_y.domain(domain);
  }
  setXDomain_asDate(){
    let latest_predicted_date = this.getLastDateAccordingToDimension();
    let first_date = this.dm.getFirstDate();
    this.scale_x.domain([first_date, latest_predicted_date]);
  }
  getLastDateAccordingToDimension(){
    if(this.isDeathsDimension() || this.isCasesDimension()) return new Date(this.dm.getLatestPredictedDate());
    return this.dm.getLastDate();
  }
  calculateColors() {
    let map_result = this.current_data_grouped.map(function(d){ return d.key }) // list of group names      
    this.color_scale = d3.scaleOrdinal()
                         .domain(map_result)
                         .range(this.dm.getColorsArray())
  }
  drawData() {
    this.event_elements = this.gCanvas.selectAll("circle")
                          .data(this.events_data)
                          .enter()
                            .append("circle")
                            .attr("r", 2.5)
                            .style("fill", (d) => { return this.color_scale(d.country) })
                            .attr("cx", (d) => { return this.scale_x(d.date); })
                            .attr("cy", (d) => {                               
                              return this.scale_y(d.country)
                            });
  }
  drawAxis() {    
    this.drawAxisX();
    this.drawAxisY(); 
  }
  drawAxisX(){
    this.axis_x = d3.axisTop(this.scale_x)
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height-1) + ")")
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
              .call(this.zoom.transform, this.initialTransform);
  }

  transformCanvas(transform){
    if(this.gCanvas){      
      let change_transform = d3.zoomIdentity.translate(transform.x, 0).scale(transform.k);
      this.gCanvas.attr("transform", change_transform);
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

  paintAxis(){     
    if(this.gAxis_x){
      let axis_color = "gray";
      let axis_opacity = .1;  
      this.gAxis_x.selectAll(".tick line")
                  .attr("stroke",axis_color)
                  .attr("opacity",axis_opacity);
      this.gAxis_x.selectAll(".tick text")
                  .attr("transform", "translate(-8,-15) rotate(90)");
      this.gAxis_y.selectAll(".tick line")
                  .attr("stroke",axis_color)
                  .attr("opacity",axis_opacity);
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
    this.current_data = this.dm.getCurrentDataByCountryList(countries);       
    this.events_data = this.dm.getEventsDataByCountryList(countries);
    this.refreshChart();
  }
  // timeline-chart
}
