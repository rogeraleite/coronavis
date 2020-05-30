import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AddEventComponent } from '../add-event/add-event.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  @Output() zoomOutput = new EventEmitter<any>();
  @Output() selectedDayOutput = new EventEmitter<any>();
  public form: FormGroup;
  
  protected svg: any;
  protected gCanvas: any;
  protected tooltip: any;
  protected color_scale: any;
  protected divKey;
  protected width;
  protected height;
  protected margin = {top: -5, right: 0, bottom: 10, left: 0};
  protected newTransform: any;

  private bar_width = 6;
  protected lineRule;
  protected zoom: any;
  protected received_zoom_flag: boolean = true;
  protected currentTransform;
  protected closeResult = '';

  protected current_data;
  protected current_data_grouped;
  protected events_data;
  protected yDimension = "cases";

  protected day_shadow: any;

  protected axis_x: any;
  protected axis_y: any;
  protected scale_x: any;
  protected scale_y: any;
  protected gAxis_x: any;
  protected gAxis_y: any;

  protected eventTypesDate: any = [];

  //https://www.weforum.org/agenda/2020/04/coronavirus-spread-covid19-pandemic-timeline-milestones/
  protected global_events = [{type:"global", title: "Diamond Princess cruise ship in quarantine", date: 1580857200000},
                             {type:"global", title: "first death in Europe", date: 1581634800000},
                             {type:"global", title: "Italy starts lockdown", date: 1582412400000},
                             {type:"global", title: "WHO calls it a pandemic", date: 1583881200000},
                             {type:"global", title: "no new local infections in China", date: 1584572400000},
                             {type:"global", title: "cases reach 1 million", date: 1585785600000}, //670543200000
                             {type:"global", title: "deaths reach 300.000", date: 1589493600000}]

  protected added_events = [{title: "placeholder example", date: 1583881200000}]

  protected country_event_elements: any;
  protected global_event_elements: any;
  protected added_event_elements: any;

  private type_selection = [];
  
  constructor(private modalService: NgbModal,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.setup();
    this.createChart();
    this.createForm();
  }
  setup() {
    this.setDimensionsVariables();
    this.getData();
  }
  setDimensionsVariables(){
    this.divKey = ".timeline-chart";
    this.width = $(this.divKey).width()//*0.99;
    this.margin.right = 0;//- $(this.divKey).width()*0.05;
    this.height = ($(document).height()/7) //+ this.margin.top/2;         
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
    this.drawToolTip();
    this.drawData();
    this.drawAxis();  
    this.drawDateSelector();
    this.applyZoomFeature();
  }

  drawToolTip() {
    if(this.tooltip) this.tooltip.remove()
    this.tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden");
  }
  addTooltipToCountryEvents() {
    this.country_event_elements.on("mouseover", (d)=>{
                          if(!this.dm.isEventEmpty(d)){ 
                            return this.tooltip.style("visibility", "visible");
                          }
                        })
                        .on("mousemove", (d)=>{                          
                          if(!this.dm.isEventEmpty(d)){ 
                            this.tooltip.html(this.getTooltipText(d))
                            return this.getTooltip();
                          }
                        })
                        .on("mouseout", (d)=>{                  
                          if(!this.dm.isEventEmpty(d)){ 
                            return this.tooltip.style("visibility", "hidden");       
                          }         
                        });
  }
  getTooltipText(d){
    let date_str = this.dm.pipeDateObjToDateString(d.date);
    if(d.StringencyIndexForDisplay){ // country event
      return  "<small>Strigency Level: "+d.StringencyIndexForDisplay+"<br>"+  
      "Events: "+this.dm.separateEventNotes(d).length+"<br>"+
      date_str+"</small>";  
    }          
    else if(d.type=="global"){
      return "<small>Global Event:<br>"+d.title+"<br>"+date_str+"</small>";  
    } 
    return "<small>Added Event:<br>"+d.title+"<br>"+date_str+"</small>";  
  }
  getTooltip(){
    return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                        .style("left",(d3.event.pageX+10)+"px")                                     
                        .style("background-color","rgba(255,255,255,.8)");
  }

  drawDateSelector() {
    let date = this.dm.getSelectedDate();
    this.gCanvas.append("rect").attr("class", "selector")
                                .attr("height", ()=>{ 
                                  let size = this.height - this.scale_y(100)
                                  return size;
                                })
                                .attr("width", this.bar_width)
                                .style("fill", "none")
                                .style("stroke", "black")
                                .attr("x", () => { return this.scale_x(date); })
                                .attr("y", ()=>{ 
                                  let y = this.scale_y(100)
                                  return y;
                                });
    let data_event = this.getDataEventByDate(date);
    this.emitDaySelectionOutput(data_event);
  }

  getDataEventByDate(date: any) {
    let result = this.events_data.filter(d => d.date == date);
    return result[0]
  }


  updateTypeSelection(type){
    if(this.type_selection.includes(type)){
      this.type_selection = this.type_selection.filter(d=> d != type)
    }
    else{
      this.type_selection.push(type);
    }
    this.refreshChart();
    return this.eventTypesDate;
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
    this.scale_y = d3.scaleLinear().range([(this.height), 0]);
  }
  scaleXYDomains() {
    this.setXDomain_asDate();
    this.setYDomain_asCountries();
  }
  setYDomain_asCountries() {
    this.scale_y.domain([0,140]);
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
  drawData(){
    this.drawGlobalEventsSquares();
    this.drawAddedEventsSquares();
    this.drawCountryEventBars();
    this.drawLinechart();
  }

  drawAddedEventsSquares() {
    this.added_event_elements = this.gCanvas.selectAll("rect.added-events")
                                        .data(this.added_events)
                                        .enter()
                                          .append("rect")
                                          .attr("class", "global-events")
                                          .attr("height", this.bar_width)
                                          .attr("width", this.bar_width)
                                          .style("fill", "#C7C6C1")
                                          .attr("x", (d) => { return this.scale_x(d.date); })
                                          .attr("y", ()=>{ 
                                            let y = this.scale_y(130)+this.bar_width
                                            return y;
                                          })
                                          .on("click", (d) => {
                                            console.log(d.title)
                                          });
    this.addTooltipToAddedEvents();
  }
  addTooltipToAddedEvents() {
    this.added_event_elements.on("mouseover", (d)=>{
                            return this.tooltip.style("visibility", "visible");
                        })
                        .on("mousemove", (d)=>{                          
                            this.tooltip.html(this.getTooltipText(d))
                            return this.getTooltip();
                        })
                        .on("mouseout", (d)=>{       
                            return this.tooltip.style("visibility", "hidden");       
                        });
  }
  drawGlobalEventsSquares() {
    this.global_event_elements = this.gCanvas.selectAll("rect.global-events")
                                    .data(this.global_events)
                                    .enter()
                                      .append("rect")
                                      .attr("class", "global-events")
                                      .attr("height", this.bar_width)
                                      .attr("width", this.bar_width)
                                      .style("fill", "black")
                                      .attr("x", (d) => { return this.scale_x(d.date); })
                                      .attr("y", ()=>{ 
                                        let y = this.scale_y(120)+this.bar_width
                                        return y;
                                      })
                                      .on("click", (d) => {
                                        console.log(d.title)
                                      });
    this.addTooltipToGlobalEvents();
  }
  addTooltipToGlobalEvents() {
    this.global_event_elements.on("mouseover", (d)=>{ 
                            return this.tooltip.style("visibility", "visible");
                        })
                        .on("mousemove", (d)=>{                          
                            this.tooltip.html(this.getTooltipText(d))
                            return this.getTooltip();
                        })
                        .on("mouseout", (d)=>{       
                            return this.tooltip.style("visibility", "hidden");       
                        });
  }

  drawLinechart() {
    this.createLinesRules();
    this.drawLines();
  }
  createLinesRules() {
    this.lineRule = d3.line()
                      .x((d) => { return this.scale_x(d.date); })
                      .y((d)=>{ return this.scale_y(d.LegacyStringencyIndexForDisplay); });
  }
  drawLines() {
    let color = this.dm.getColorByCountry(this.dm.getSelectedCountry());
                    
    this.gCanvas.selectAll(".line-current2")
                .data([this.events_data])
                .enter()
                  .append("path")
                  .attr("d", this.lineRule)
                  .attr("fill", "none")
                  .attr("stroke", color)
                  .attr("stroke-width", 2);
  }
  drawCountryEventBars() {
    this.eventTypesDate = [];
    this.country_event_elements = this.gCanvas.selectAll("rect.country-events")
                          .data(this.events_data)
                          .enter()
                            .append("rect")
                            .attr("class", "country-events")
                            .attr("height", (d)=>{ 
                              let size = this.height - this.scale_y(d.LegacyStringencyIndexForDisplay)
                              return size;
                            })
                            .attr("width", this.bar_width)
                            .style("fill", (d) => { 
                              let color = this.dm.getColorByCountry(d.country);
                              if(this.dm.isEventEmpty(d)){ color = "white" }
                              return color;
                            })
                            .attr("opacity", (d) => { 
                              let value = this.checkEventTypes(d);
                              return value;
                            })
                            .attr("x", (d) => { return this.scale_x(d.date); })
                            .attr("y", (d)=>{ 
                              let y = this.scale_y(d.LegacyStringencyIndexForDisplay)
                              return y;
                            })
                            .on("click", (d) => {
                              this.updateSelectedDateBehavior(d.date);
                            });
      this.addTooltipToCountryEvents();
  }

  updateSelectedDateBehavior(date){
    this.updateSelectedDate(date);
    this.addSelectedDayShadow(date);
  }

  checkEventTypes(d: any) {
    let date_events = this.dm.separateEventNotes(d);
    if(this.type_selection.length == 0) return 1;
    
    let result = date_events.filter(d => this.type_selection.includes(d.type) )
    if(result.length>0) {
      this.eventTypesDate.push(d.date)
      return 1;
    }
    return 0.2;
  }
  resetShadow(){
    if(this.day_shadow) this.day_shadow.remove();
  }
  addSelectedDayShadow(date){
    this.resetShadow();
    this.day_shadow = this.gCanvas.append("rect")
                                  .attr("class","event-shadow")
                                  .attr("height",this.height)
                                  .attr("opacity",.1)
                                  .attr("x",-1000)
                                  .attr("width", ()=>{
                                    return this.scale_x(date)+1000;
                                  })
                                  .on("click",()=>{
                                    this.emitDaySelectionOutput(null)
                                  })

  }
  calculateRectSize(value){
    let size = (value/100)*(this.height-this.margin.bottom-1);
    return size
  }
  addAxisLabels() {    
    let color = this.dm.getColorByCountry(this.dm.getSelectedCountry());
    this.svg.append("text")
                .attr("y", -2)
                .attr("x", -this.height / 1.75)
                .attr("transform", "rotate(-90)")
                .attr("dy", "1em")
                .attr("font-size", "11px")
                .style('fill', color)
                .style("text-anchor", "middle")
                .text("stringency")
                .attr("font-weight", 500);  
    this.svg.append("text")
                .attr("y", this.height / 8)
                .attr("x", 5)
                .attr("dy", "1em")
                .attr("font-size", "10px")
                .style('fill', 'black')
                .style("text-anchor", "middle")
                .text("G")
                .attr("font-weight", 500);  
    this.svg.append("text")
                .attr("y", this.height / 18)
                .attr("x", 5)
                .attr("dy", "1em")
                .attr("font-size", "10px")
                .style('fill', "#C7C6C1")
                .style("text-anchor", "middle")
                .text("A")
                .attr("font-weight", 500);  
  }
  drawAxis() {    
    this.drawAxisX();
    // this.drawAxisY(); 
    this.addAxisLabels();
  }
  drawAxisX(){
    this.axis_x = d3.axisTop(this.scale_x)
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height - this.margin.bottom - 7) + ")")
                              .call(this.axis_x);        
  }
  drawAxisY(){
    this.axis_y = d3.axisLeft()
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
      transform.k = 0.84;
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
    this.type_selection = [];
    this.refreshChart();
  }
  updateSelectedDate(date){
    this.dm.setSelectedDate(date);
    this.refreshChart();
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////
  addEvent(content){   
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, 
    (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  submitEvent() { 
    let value = this.form.value;
    var date = new Date(value.date); 
    var milliseconds = date.getTime(); 
    
    this.added_events.push({title: value.title, date: milliseconds})

    this.refreshChart();
    this.modalService.dismissAll();
  }
  createForm(){
    this.form = this.formBuilder.group({
      title: "",
      date: ""
    });
  }
}
