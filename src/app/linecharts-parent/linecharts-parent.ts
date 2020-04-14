import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';

export class LinechartsParent implements OnInit {

    @Input() dm: DataManagerComponent;
  
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
    
    // protected curTransform: any;
    protected zoom: any;
    protected dots: any;
    protected predictionRects: any;
    protected tooltip: any;
    protected initialTransform: any;
  
    protected lineRules;
    protected predictionLine;
    protected grouped_current_data;
    protected grouped_prediction_data;
  
    protected margin = {top: 5, right: 0, bottom: 0, left: 0};
    protected width;// = 800 - this.margin.left - this.margin.right;
    protected height;// = 600 - this.margin.top - this.margin.bottom;
    
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
        console.log(this.prediction_curve_data)
    }
    
    createChart(){
      /////////////////////// Part1
      this.setSVG();
      this.setCanvas();
      this.getGroupedData()
      /////////////////////// Part2
      this.setXYScales();
      this.createLines();
      this.scaleXYDomains();
      /////////////////////// Part3
      this.drawToolTip();
      this.drawCurrentLines();
      this.drawPredictionLines();
      this.drawDots();
      this.drawPrediction();
      this.drawAxis();  
      this.applyZoomFeature(); 
      // this.addResetFeatureToButton();
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
                    .attr("transform", "translate(0," + this.margin.top + ")");
    }  
    setCanvas(){
      this.gCanvas = this.svg.append("g")
                             .attr("class", "canvas");
      // if (this.curTransform) this.gCanvas.attr('transform', this.curTransform);
    }
    getGroupedData() {
      this.getCurrentDataGroup();
      this.getPredictionDataGroup();      
    }
    getCurrentDataGroup(){
      this.grouped_current_data = d3.nest() // nest function allows to group the calculation per level of a factor
                                    .key((d) => { return d.country;})
                                    .entries(this.current_curve_data);
    }
    getPredictionDataGroup(){
      if(this.prediction_curve_data){
        this.grouped_prediction_data = d3.nest() // nest function allows to group the calculation per level of a factor
                                      .key((d) => { return d.country;})
                                      .entries(this.prediction_curve_data);
      }
    }

    //////////////////////////////////////////////// Part2
    setXYScales(){    
      if(this.isLogScaled()) this.setYScale_asLog();
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
      this.scale_y = d3.scaleLog().range([this.height, 0]);
    }
    createLines(){
        this.lineRules = d3.line()
                           .x((d) => { return this.scale_x(d.date); })
                           .y((d) => { return this.scale_y(+d.confirmed); });
    }
    scaleXYDomains() {
      // this.scale_x.domain(d3.extent(this.data, function(d) { return d.date; }));
      // this.scale_y.domain([d3.min(this.data, function(d) { return +d.confirmed; }),
      //                     d3.max(this.data, function(d) { return +d.confirmed; })]);

      let latest_predicted_date = new Date(this.dm.getLatestPredictedDate());
      let biggest_predicted_infections = this.dm.getBiggestPredictedInfectedNumber();

      this.scale_x.domain([d3.min(this.current_curve_data, function(d) { return d.date; }),
                           latest_predicted_date]);
      
      this.scale_y.domain([d3.min(this.current_curve_data, function(d) { return +d.confirmed; }),
                           biggest_predicted_infections]);
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
      let map_result = this.grouped_current_data.map(function(d){ return d.key }) // list of group names
      this.color_scale = d3.scaleOrdinal()
                            .domain(map_result)
                            .range(this.dm.getColorsArray())
  
      this.gCanvas.selectAll(".line-current")
                  .data(this.grouped_current_data)
                  .enter()
                    .append("path")
                    .attr("fill", "none")
                    .attr("stroke", (d)=>{ 
                      return this.color_scale(d.key) 
                    })
                    .attr("stroke-width", 2)
                    .attr("d", (d)=>{
                      return this.lineRules(d.values)
                    })
    }
    
    drawPredictionLines() {
      if(this.grouped_prediction_data){
        let map_result = this.grouped_prediction_data.map((d)=>{ return d.key }) // list of group names
            
        this.gCanvas.selectAll(".line-prediction")
                    .data(this.grouped_prediction_data)
                    .enter()
                      .append("path")
                      .attr("fill", "none")
                      .attr("stroke", "gray")
                      .attr("stroke-width", 2)
                      .attr("d", (d)=>{
                        return this.lineRules(d.values)
                      })
      }      
    }

    drawDots() {
      this.dots = this.gCanvas.selectAll("circle")
                      .data(this.current_curve_data)
                      .enter()
                        .append("circle")
                        .attr("r", 2.5)
                        .style("fill", (d) => { return this.color_scale(d.country) })
                        .attr("cx", (d) => { return this.scale_x(d.date); })
                        .attr("cy", (d) => { return this.scale_y(d.confirmed); });
      this.addTooltipBehaviorToDots();
    }
    getDotsTooltipText(d){
      let confirmed = this.dm.pipeNumberToString(d.confirmed);
      return  d.country+
              "<br>"+confirmed+" cases"+
              "<br> +"+Number(d.percentage_growth).toFixed(2)+"%";
    }
    addTooltipBehaviorToDots(){
      this.dots.on("mouseover", ()=>{
                  return this.tooltip.style("visibility", "visible");
                })
                .on("mousemove", (d)=>{
                  this.tooltip.html(this.getDotsTooltipText(d))
                  return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                                     .style("left",(d3.event.pageX+10)+"px");
                })
                .on("mouseout", ()=>{
                  return this.tooltip.style("visibility", "hidden");                
                });
    }
    
    drawPrediction() {
      let prediction_data = this.dm.getPredictionDataMap();  
      this.predictionRects = this.gCanvas.selectAll(".predictor")
                                      .data(this.grouped_current_data)
                                      .enter()
                                        .append("g")
                                        .attr("class","predictor")
                                        .attr("transform", (d)=>{
                                          let country = d.key;
                                          let prediction = prediction_data[country];
                                          let end_date = new Date(prediction.end_day_date);
                                          let infected = prediction.infected_number;
                                          let in_scaleX = this.scale_x(end_date);
                                          let in_scaleY = this.scale_y(infected);
                                          return "translate("+in_scaleX+","+in_scaleY+")";
                                        });
      this.predictionRects.append("circle")
                          .attr("r", (d) => { 
                            let country = d.key;
                            let prediction = prediction_data[country];
                            let error = prediction.infected_number_error;
                            let size = this.height - this.scale_y(error);
                            
                            if(size<3) size=3;
                            if(this.isLogScaled()) size = Math.log(size)
                            return size;
                          })       
                          .attr("opacity",.7)
                          .attr("stroke", "black")
                          .attr("fill", (d) => { 
                            let country = d.key;
                            return this.color_scale(country); 
                          })
                          .style("stroke-dasharray", ("10,5")) // make the stroke dashed
      this.addTooltipBehaviorToPrediction();
    }
    getPredictionTooltipText(d){      
      let country = d.key;
      let prediction = this.dm.getPredictionDataMap();
      let info = prediction[country];
      let end_date = this.dm.parseDateObjToDateString(info.end_day_date);
      let infections = this.dm.pipeNumberToString(info.infected_number.toFixed(0));
      let infections_error = this.dm.pipeNumberToString(info.infected_number_error.toFixed(0));
      return  country+" <small>prediction</small>"+
              "<br>"+infections+" <small>(+-"+infections_error+") cases</small>"+
              "<br> <small>end at </small> "+end_date;
    }
    addTooltipBehaviorToPrediction() {
      this.predictionRects.on("mouseover", ()=>{
                            return this.tooltip.style("visibility", "visible");
                          })
                          .on("mousemove", (d)=>{
                            this.tooltip.html(this.getPredictionTooltipText(d))
                            return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                                              .style("left",(d3.event.pageX+10)+"px");
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
                        .ticks((this.width + 2) / (this.height + 2) * 10)
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
                        if(d>=0) return d/1000 + "k";   
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
                        .tickFormat((d)=>{ if(d>=0) {
                          return d/1000 + "k"
                        }; })
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
                  .attr("y", 28)
                  .attr("x", -this.height / 2)
                  .attr("transform", "rotate(-90)")
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_y_label);  
      this.svg.append("text")
                  .attr("y", this.height - 45)
                  .attr("x", this.width / 2)
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_x_label); 
    }
    applyZoomFeature() {          
      let zoomed = () => {
        let curTransform = d3.event.transform;    
        this.gCanvas.attr("transform", curTransform);
        this.zoomAxisX(curTransform);
        this.zoomAxisY(curTransform);        
        this.paintAxis();
      } 
      this.zoom = d3.zoom()
                    .scaleExtent([0.7, 5])
                    .translateExtent([[-100, -100], [this.width + 90, this.height + 100]])
                    .on('zoom', zoomed);
      this.zoom(this.svg);
                    
      this.svg.call(this.zoom)    
              .call(this.zoom.transform, this.initialTransform)    
    }
    zoomAxisX(curTransform){        
        if(curTransform){
            this.gAxis_x.call(this.axis_x.scale(curTransform.rescaleX(this.scale_x)));
        }
    }
    zoomAxisY(curTransform){     
        if(curTransform){
            this.gAxis_y.call(this.axis_y.scale(curTransform.rescaleY(this.scale_y)));
        }
    }

    switchYScale(){
      if(this.isLinearScaled()) this.scaleYType = "log";
      else this.scaleYType = "linear";
      this.updateAxisYLegend();

      this.refreshChart();
    }
    updateAxisYLegend(){
      if(this.isLogScaled()) this.axis_y_label = "log(confirmed cases)";
      else this.axis_y_label = "confirmed cases";    
    }
    isLogScaled(){
      return this.scaleYType=="log"
    }
    isLinearScaled(){
      return this.scaleYType=="linear"
    }
    

}
