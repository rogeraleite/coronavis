import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';

export class LinechartsParent implements OnInit {

    @Input() dm: DataManagerComponent;  
    @Output() zoomOutput = new EventEmitter<any>();
    
    protected divKey;
    protected svg: any;
    protected gCanvas: any;
    protected color_scale: any;
    protected scale_x: any;
    protected scale_y: any;
    protected axis_x: any;
    protected axis_y: any;
    protected gAxis_x: any;
    protected gAxis_y: any;
    protected axis_x_label: any;
    protected axis_y_label: any;

    protected scaleYType: string;
    protected yDimension: string;    
    protected yUnit: string;

    // protected curTransform: any;
    protected zoom: any;
    protected zoom_y: any;
    protected received_zoom_flag: boolean = true;
    protected initialTransform: any;

    protected dots: any;
    protected predictionDot: any;
    protected tooltip: any;
  
    protected lineRules;
    protected predictionLine;
    protected grouped_current_data;
    protected grouped_prediction_data;
  
    protected margin = {top: 1, right: 0, bottom: 0, left: 0};
    protected width;
    protected height;
    
    protected current_curve_data;
    protected prediction_curve_data;
   
    constructor() { }
  
    ngOnInit() {   
      this.setup();
      this.createChart();
    }
    setup(){
      //to complete inside every child class
    }

    getInitialSelection(){
        this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
        this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
    }
    
    createChart(){
      /////////////////////// Part1
      this.setSVG();
      this.setCanvas();
      this.getGroupedData()
      /////////////////////// Part2
      this.setXYScales();
      this.scaleXYDomains();
      this.createLinesRules();
      this.calculateColors();
      /////////////////////// Part3
      this.drawToolTip();
      this.drawPrediction();
      this.drawCurrentData();
      this.drawAxis();  
      this.defineZoomFeature(); 
      // this.addResetFeatureToButton();
    }

    drawCurrentData() {
      this.drawCurrentLines();
      this.drawCurrentLineDots();
    }

    drawPrediction() {
      if(!this.isTestsDimension() &&
         !this.isPredictionCasesDaysDimension( )&&
         !this.isPredictionDeathsDaysDimension()){
        this.drawPredictionLines();    
        this.drawPredictionDot();  
      }
    }

    refreshChart(){
      this.cleanCanvas();
      this.createChart();
    }
  
    loadCountriesByArray(countries:Array<string>){
      this.current_curve_data = this.dm.getCurrentDataByCountryList(countries);
      this.prediction_curve_data = this.dm.getPredictionDataByCountryList(countries);
      this.refreshChart();
    }
  
    ngAfterContentInit(){  }
    cleanCanvas(){
      if(this.svg) this.svg.remove();
    }
  
    //////////////////////////////////////////////// Part1
    setSVG(){
      this.svg = d3.select(this.divKey)
                    .append("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                    .attr("transform", "translate("+this.margin.right+"," + this.margin.top + ")");
    }  
    setCanvas(){
      this.gCanvas = this.svg.append("g")
                             .attr("class", "canvas-linechart");
    }
    getGroupedData() {
      this.getCurrentDataGroup();
      this.getPredictionDataGroup();      
    }
    getCurrentDataGroup(){
      this.current_curve_data = this.cleanDataAccordingToDimension();
      this.grouped_current_data = d3.nest() // nest function allows to group the calculation per level of a factor
                                    .key((d) => { return d.country;})
                                    .entries(this.current_curve_data);
    }
    cleanDataAccordingToDimension() {      
      let clean_data = [];
      if(this.isPredictionCasesDaysDimension()) { 
        this.current_curve_data.forEach(e => {
          let days = e.prediction_cases_length;
          if(days>0 && days<1000){ clean_data.push(e); }
        });
        return clean_data;
      }
      else if(this.isPredictionDeathsDaysDimension()) { 
        this.current_curve_data.forEach(e => {
          let days = e.prediction_deaths_length;
          if(days>0 && days<1000){ clean_data.push(e); }
        });
        return clean_data;
      }
      return this.current_curve_data
    }
    getPredictionDataGroup(){
      if(this.prediction_curve_data){
        this.grouped_prediction_data = d3.nest() // nest function allows to group the calculation per level of a factor
                                      .key((d) => { return d.country; })
                                      .entries(this.prediction_curve_data);
      }
    }

    //////////////////////////////////////////////// Part2
    setXYScales(){    
      if(this.isLogScaled()) { this.setYScale_asLog(); }
      else this.setYScale_asLinear();     
      
      this.setXScale();   
    }
    setXScale(){      
      this.scale_x = d3.scaleTime().range([0, this.width]);
    }
    setYScale_asLinear(){      
      this.scale_y = d3.scaleLinear().range([this.height, 0]);
    }
    setYScale_asLog(){      
      this.scale_y = d3.scaleSymlog().range([this.height, 0]);
    }
    createLinesRules(){
      if(this.isDeathsDimension()) { this.setY_asDeaths(); }
      else if(this.isTestsDimension()) { this.setY_asTests();}
      else if(this.isPredictionCasesDaysDimension()) { this.setY_asPredictionCasesDays();}
      else if(this.isPredictionDeathsDaysDimension()) { this.setY_asPredictionDeathsDays();}
      else this.setY_asCases();         
    }
    setY_asCases(){
      this.lineRules = d3.line()
                          .x((d) => { return this.scale_x(d.date); })
                          .y((d) => { 
                            let value = +d.confirmed;
                            value = this.applyUnitInValue(d.country, value);
                            return this.scale_y(value);
                          });
    }
    setY_asDeaths(){
      let last_x = 0;
      let last_y = 0;
      this.lineRules = d3.line()
                          .x((d) => { 
                            last_x = this.dealWithUnexistedDataXPoints(last_x,d.deaths,d.date)
                            return this.scale_x(last_x); 
                          })
                          .y((d) => { 
                            last_y = this.dealWithUnexistedDataYPoints(last_y, d.deaths)
                            let value = last_y; 
                            value = this.applyUnitInValue(d.country, value);
                            return this.scale_y(value);
                          });
    }
    setY_asTests(){
      this.lineRules = d3.line()
                          .x((d) => { return this.scale_x(d.date); })
                          .y((d) => { 
                            let value = d.tests; 
                            value = this.applyUnitInValue(d.country, value);
                            return this.scale_y(value);
                          });
    }
    setY_asPredictionCasesDays(){
      this.lineRules = d3.line()
                        .x((d) => { return this.scale_x(d.date); })
                        .y((d) => { 
                          let value = d.prediction_cases_length; 
                          return this.scale_y(value);
                        });
    }
    setY_asPredictionDeathsDays(){
      this.lineRules = d3.line()
                        .x((d) => { return this.scale_x(d.date); })
                        .y((d) => { 
                          let value = d.prediction_deaths_length; 
                          return this.scale_y(value);
                        });
    }
    applyUnitInValue(country, value){
      if(this.isPerMillionUnit()){
        value = this.dm.applyPerMillion(country, value);
      }
      return value; 
    }
    dealWithUnexistedDataXPoints(last_x, value, date){
      if(value==-1){ return last_x; } //d.deaths==-1 idicates the end of the deaths prediction path
      return date;
    }
    dealWithUnexistedDataYPoints(last_y, value){
      if (+value == -1) {//==-1 idicates the end of the deaths prediction path
        return last_y;
      }
      return +value;
    }
    calculateColors(){
      let map_result = this.grouped_current_data.map(function(d){ return d.key }) // list of group names      
      this.color_scale = d3.scaleOrdinal()
                            .domain(map_result)
                            .range(this.dm.getColorsArray())
    }
    scaleXYDomains() {   
      //X Domain
      this.setXDomain_asDate();        
      
      //Y Domain
      if(this.isDeathsDimension()){ this.setYDomain_asDeaths(); }
      else if(this.isTestsDimension()) { this.setYDomain_asTests(); }
      else if(this.isPredictionCasesDaysDimension()) { this.setYDomain_asPredictionCasesDays(); }
      else if(this.isPredictionDeathsDaysDimension()) { this.setYDomain_asPredictionDeathsDays(); }
      else{ this.setYDomain_asCases(); }         
    }
    getLastDateAccordingToDimension(){
      if(this.isDeathsDimension() || this.isCasesDimension()) return new Date(this.dm.getLatestPredictedDate());
      return this.dm.getLastDate();
    }
    setXDomain_asDate() {
      let latest_predicted_date = this.getLastDateAccordingToDimension();
      let first_date = this.dm.getFirstDate();
      this.scale_x.domain([first_date, latest_predicted_date]);
    }

    setYDomain_asCases(){   
      let perMiFlag = this.isPerMillionUnit();   
      let max_sample = this.dm.getMaxCases(perMiFlag);
      this.scale_y.domain([0, max_sample.max_cases]);
    }
    setYDomain_asDeaths(){   
      let perMiFlag = this.isPerMillionUnit();   
      let max_sample = this.dm.getMaxDeaths(perMiFlag);    
      this.scale_y.domain([0, max_sample.max_deaths]);
    }
    setYDomain_asTests(){
      let perMiFlag = this.isPerMillionUnit();
      let max_sample = this.dm.getMaxTests(perMiFlag);
      this.scale_y.domain([0, max_sample.max_tests]);
    }
    setYDomain_asPredictionCasesDays(){      
      let max_value = d3.max(this.current_curve_data, function(d) { return +d.prediction_cases_length; });
      this.scale_y.domain([0, max_value]);
    }
    setYDomain_asPredictionDeathsDays(){    
      let max_value = d3.max(this.current_curve_data, function(d) { return +d.prediction_deaths_length; });
      this.scale_y.domain([0, max_value]);
    }
    //////////////////////////////////////////////// Part3
    drawToolTip() {
      this.tooltip = d3.select("body")
                      .append("div")
                      .style("position", "absolute")
                      .style("z-index", "10")
                      .style("visibility", "hidden");
    }
    drawCurrentLines() {
      this.gCanvas.selectAll(".line-current")
                  .data(this.grouped_current_data)
                  .enter()
                    .append("path")
                    .attr("fill", "none")
                    .attr("opacity",(d)=>{ 
                      return this.getColorOpacityByCountry(d.key);
                    })
                    .attr("stroke", (d)=>{ 
                      return this.color_scale(d.key);
                    })
                    .attr("stroke-width", 2)
                    .attr("d", (d)=>{
                      return this.lineRules(d.values)
                    })
    }
    
    drawPredictionLines() {
      if(this.grouped_prediction_data){            
        this.gCanvas.selectAll(".line-prediction")
                    .data(this.grouped_prediction_data)
                    .enter()
                      .append("path")
                      .attr("fill", "none")
                      .attr("stroke", "gray")
                      .attr("stroke-width", 2)                            
                      .attr("opacity",(d)=>{ 
                        return this.getColorOpacityByCountry(d.key);
                      })
                      .attr("d", (d)=>{                  
                          return this.lineRules(d.values)
                      })
      }      
    }

    drawCurrentLineDots() {
      this.dots = this.gCanvas.selectAll("circle")
                      .data(this.current_curve_data)
                      .enter()
                        .append("circle")
                        .attr("r", 2.5)
                        .attr("opacity",(d)=>{ 
                          return this.getColorOpacityByCountry(d.key);
                        })
                        .style("fill", (d) => { return this.color_scale(d.country) })
                        .attr("cx", (d) => { return this.scale_x(d.date); })
                        .attr("cy", (d) => { 
                          let value = this.applyUnitInValue(d.country, d.confirmed);
                          if(this.isDeathsDimension()){
                            value = this.applyUnitInValue(d.country, d.deaths); 
                          }
                          else if(this.isTestsDimension()){
                            value = this.applyUnitInValue(d.country, d.tests); 
                          }
                          else if(this.isPredictionCasesDaysDimension()){
                            value = d.prediction_cases_length; 
                          }
                          else if(this.isPredictionDeathsDaysDimension()){
                            value = d.prediction_deaths_length; 
                          }
                          return this.scale_y(value); 
                        });
      this.addTooltipBehaviorToDots();
    }
    getCurrentDotsTooltipText(d){
      let date_str = this.dm.pipeDateObjToDateString(d.date);

      let text_value = this.dm.pipeNumberToString(d.confirmed);
      let aux_text = "<small> "+this.yDimension+" (+"+Number(d.confirmed_percentage_growth).toFixed(2)+"%)</small></div>"

      if(this.isDeathsDimension()){ 
        text_value = this.dm.pipeNumberToString(d.deaths);
        aux_text = "<small> "+this.yDimension+" (+"+Number(d.deaths_percentage_growth).toFixed(2)+"%)</small></div>"
      }
      else if(this.isTestsDimension()){ 
        text_value = d.tests;
        if(text_value=="0") text_value = "N/A";
        aux_text = " <small> "+this.yDimension+"</small>";
      }
      else if(this.isPredictionCasesDaysDimension()){ 
        text_value = d.prediction_cases_length;
        aux_text = " days";
      }
      else if(this.isPredictionDeathsDaysDimension()){ 
        text_value = d.prediction_deaths_length;
        aux_text = " days";
      }

      return  d.country+" <small>"+this.yDimension+"</small>"+
              "<br>"+text_value+aux_text+              
              "<br><small>"+date_str+"</br>";
              
    }
    addTooltipBehaviorToDots(){
      this.dots.on("mouseover", ()=>{
                  return this.tooltip.style("visibility", "visible");
                })
                .on("mousemove", (d)=>{
                  this.tooltip.html(this.getCurrentDotsTooltipText(d))
                  return this.getTooltip();
                })
                .on("mouseout", ()=>{
                  return this.tooltip.style("visibility", "hidden");                
                });
    }
    getTooltip(){
      return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                          .style("left",(d3.event.pageX+10)+"px")                                     
                          .style("background-color","rgba(255,255,255,.8)");
    }
    
    drawPredictionDot() {
      this.predictionDot = this.gCanvas.selectAll(".predictor")
                                      .data(this.grouped_current_data)
                                      .enter()
                                        .append("g")
                                        .attr("class","predictor")
                                        .attr("transform", (d)=>{
                                          let country = d.key;
                                          let prediction = this.getPredictionInfoBasedOnDimensionByCountry(country);
                                          let p_end_date = prediction.end_date;
                                          let p_cases = prediction.p_amount;
                                          let x_value = p_end_date;
                                          let y_value = this.applyUnitInValue(country, p_cases);
                                          let in_scaleX = this.scale_x(x_value);
                                          let in_scaleY = this.scale_y(y_value);
                                          return "translate("+in_scaleX+","+in_scaleY+")";
                                        });
      this.predictionDot.append("circle")
                          .attr("r", (d) => { 
                            // let country = d.key;
                            // let prediction = this.getPredictionInfoBasedOnDimensionByCountry(country);
                            // let error = prediction.p_amount_error;
                            let size = 10;
                            // let size = this.height - this.scale_y(error);                            
                            // if(size<3) size=3;
                            // if(this.isLogScaled()) size = Math.log(size)
                            return size;
                          })                                 
                          .attr("opacity",(d)=>{ 
                            return this.getColorOpacityByCountry(d.key);
                          })
                          .attr("stroke", "black")
                          .attr("fill", (d) => { 
                            return this.color_scale(d.key); 
                          })
                          .style("stroke-dasharray", ("10,5")) // make the stroke dashed
      this.addTooltipBehaviorToPrediction();
    }
    getPredictionInfoBasedOnDimensionByCountry(country){
      let prediction_data = this.dm.getPredictionDataMap();  
      let prediction = prediction_data[country];
      
      let result = {
        end_date: this.dm.getExpectedEndCasesDate(country),
        end_date_str: this.dm.getExpectedEndCasesDateString(country),
        p_amount: +this.dm.getExpectedCasesByComparingWithCurrent(country),
        p_amount_error: prediction.cases_number_error
      }
      if(this.isDeathsDimension()){
        result.end_date =  this.dm.getExpectedEndDeathsDate(country);
        result.end_date_str =  this.dm.getExpectedEndDeathsDateString(country);
        result.p_amount = +this.dm.getExpectedDeathsByComparingWithCurrent(country);
        result.p_amount_error = prediction.deaths_number_error;
      }

      return result;
    }
    getPredictionTooltipText(d){      
      let country = d.key;
      let info = this.getPredictionInfoBasedOnDimensionByCountry(country);
      let error = this.dm.pipeNumberToString(info.p_amount_error.toFixed(0));

      let exp_end_date = info.end_date_str;
      let exp_amount = info.p_amount;

      return country+" <small>prediction</small>"+
              "<br>"+this.dm.pipeNumberToString(exp_amount)+" <small>(+-"+error+") "+this.yDimension+"</small>"+
              "<br> <small>end at "+exp_end_date+"</small>";
    }
    addTooltipBehaviorToPrediction() {
      this.predictionDot.on("mouseover", ()=>{
                            return this.tooltip.style("visibility", "visible");
                          })
                          .on("mousemove", (d)=>{
                            this.tooltip.html(this.getPredictionTooltipText(d))
                            return this.getTooltip();
                          })
                          .on("mouseout", ()=>{
                            return this.tooltip.style("visibility", "hidden");                
                          });
    }
    
    drawAxis() {
        this.drawAxisX();
        this.drawAxisY();      
        this.paintAxis();
        this.addAxisLabels();
    }
    drawAxisX(){
        this.axis_x = d3.axisTop(this.scale_x)
                        .tickFormat(d3.timeFormat("%d\/%m"))
                        .ticks((this.width + 2) / (this.height + 2) * 5)
                        .tickSize(this.height)
                        .tickPadding(8 - this.height);
        this.gAxis_x = this.svg.append("g")
                                  .attr("class", "axis axis-x")
                                  .attr("transform", "translate(-1," + (this.height-1) + ")")
                                  .call(this.axis_x);        
    }
    drawAxisY(){
        if(this.isLogScaled()) this.drawAxisY_asLog();
        else this.drawAxisY_asLinear();        
    }
    drawAxisY_asLog(){
      this.axis_y = d3.axisRight(this.scale_y)
                      .ticks(4,'.02f')
                      .tickFormat((d)=>{                         
                        if(d>=0 && !this.isPerMillionUnit()) {
                          return d/1000 + "k";   
                        }
                        return d;
                      })
                      .tickSize(this.width)
                      .tickPadding(8 - this.width)
      this.gAxis_y = this.svg.append("g")
                                .attr("class", "axis axis-y")                              
                                .call(this.axis_y);
    }
    drawAxisY_asLinear(){
      this.axis_y = d3.axisRight(this.scale_y)
                        .ticks(10)
                        .tickFormat((d)=>{ 
                          if(d>=0 && !this.isPerMillionUnit()) {
                            return d/1000 + "k"
                          }; 
                          return d;
                        })
                        .tickSize(this.width)
                        .tickPadding(8 - this.width)
      this.gAxis_y = this.svg.append("g")
                        .attr("class", "axis axis-y")                              
                        .call(this.axis_y);         
    }
    paintAxis(){        
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
    addAxisLabels() {
      this.svg.append("text")
                  .attr("y", 35)
                  .attr("x", -this.height / 2)
                  .attr("transform", "rotate(-90)")
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_y_label);  
      this.svg.append("text")
                  .attr("y", this.height - 50)
                  .attr("x", this.width / 2)
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_x_label); 
    }
    defineZoomFeature() { 
      let zoomed = () => {
          let newTransform = d3.event.transform;  
          this.applyZoom(newTransform);
          this.emitZoomOutput(newTransform);        
      } 
      this.zoom = d3.zoom()
                    .scaleExtent([0.7, 5])
                    .translateExtent([[-500, -250], [this.width + 350, this.height + 350]])
                    .on('zoom', zoomed);
      this.zoom(this.svg);
                    
      this.svg.call(this.zoom)    
              .call(this.zoom.transform, this.initialTransform)    
      this.zoom_y = this.initialTransform.y;
    }
    
    emitZoomOutput(transform){
      if(!this.hasJustReceivedZoom()){
        this.zoomOutput.emit(transform);
      }
      this.deactivateReceivedZoomFlag();          
    }
    receiveZoom(transform){
      if(this.svg){
        let y = d3.zoomTransform(this.svg).y;
        let t = d3.zoomIdentity
                  .translate(transform.x, this.zoom_y)                  
                  .scale(transform.k);
        this.activeReceivedZoomFlag();
        this.svg.call(this.zoom.transform, t);
      }      
    }

    applyZoom(transform){
      if(transform){         
        this.zoomAxisX(transform);   
        this.zoomAxisY(transform); 
        this.transformCanvas(transform);
        this.paintAxis();
        this.zoom_y = transform.y;
      }      
    }

    getTransformFromCanvas(){
      if(this.svg.attr("transform")){
        let split = this.svg.attr("transform").split(",");
        let x = +~~split[0].split("(")[1];
        let y = +~~split[1].split(")")[0];
        let k = +split[1].split("(")[1].split(")")[0];
        // return d3.zoomIdentity.translate(x, y).scale(k);
        return {x: x, y: y, k: k};
      }
      return null;
    } 
    zoomAxisX(transform){        
        if(transform){
            this.gAxis_x.call(this.axis_x.scale(transform.rescaleX(this.scale_x)));
        }
    }
    zoomAxisY(transform){     
        if(transform){
            this.gAxis_y.call(this.axis_y.scale(transform.rescaleY(this.scale_y)));
        }
    }
    transformCanvas(transform){
      if(this.gCanvas){
        let change_transform = d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k);
        //this.gCanvas.call(this.zoom.transform, change_transform)
        this.gCanvas.attr("transform", change_transform);
      }    
    }

    changeScale(scale){
      this.scaleYType = scale;
      this.updateAxisYLabels();
      this.refreshChart();
    }
    changeFeature(feature){      
      this.yDimension = feature;
      this.updateAxisYLabels();
      this.refreshChart();
    }
    changeUnit(unit){          
      this.yUnit = unit;
      this.updateAxisYLabels();
      this.refreshChart();
    }
    isDeathsDimension(){
      return this.yDimension == "deaths"
    }
    isCasesDimension(){
      return this.yDimension == "cases"
    }
    isTestsDimension(){
      return this.yDimension == "tests"
    }    
    isPredictionCasesDaysDimension(){
      return this.yDimension == "pCases"
    }
    isPredictionDeathsDaysDimension(){
      return this.yDimension == "pDeaths"
    }
    isPredictionDimension(){
      return this.isPredictionCasesDaysDimension() || this.isPredictionDeathsDaysDimension()
    }
    updateAxisYLabels(){
      let dimension_text = this.pipeYDimensionText();
      if(this.isLogScaled()) this.axis_y_label = "log("+dimension_text+")";
      else this.axis_y_label = dimension_text;    
    }
    pipeYDimensionText() {
      if(this.yDimension == "pDeaths") return "Predicted Deaths Days"
      else if(this.yDimension == "pCases") return "Predicted Cases Days"
      return this.yDimension;
    }
    isLogScaled(){
      return this.scaleYType == "log"
    }
    isLinearScaled(){
      return this.scaleYType == "linear"
    }
    isPerMillionUnit(){
      return this.yUnit == "perMillion"
    }
    getOpositeDimension(){
      if(this.isDeathsDimension()) return "cases";
      return "deaths"
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

    getColorOpacityByCountry(country){
      if(this.dm.isSelectedCountry(country)){
        return 1;
      }
      return 0.2      
    }

    updateSelectedCountry(){
      this.refreshChart();
    }

    


}
