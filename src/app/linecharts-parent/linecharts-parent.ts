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
    protected axis_x_legend: any;
    protected axis_y_legend: any;
    
    // protected curTransform: any;
    protected zoom: any;
    protected dots: any;
    protected tooltip: any;
    protected initialTransform: any;
  
    protected valueLine;
    protected grouped_data;
  
    protected margin = {top: 5, right: 0, bottom: 0, left: 0};
    protected width;// = 800 - this.margin.left - this.margin.right;
    protected height;// = 600 - this.margin.top - this.margin.bottom;
    protected data;
   
    constructor() { }
  
    ngOnInit() {   
      this.setup();
      this.createChart();
    }
    setup(){
      //to complete inside every child class
    }

    getInitialSelection(){
        this.data = this.dm.getDataByCountryList(null);
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
      this.drawCreatedLines();
      this.drawDots();
      this.drawAxis();  
      this.applyZoomFeature(); 
      // this.addResetFeatureToButton();
    }
  
    loadCountriesByArray(countries:Array<string>){
      this.data = this.dm.getDataByCountryList(countries);
      this.cleanCanvas();
      this.createChart();
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
      this.grouped_data = d3.nest() // nest function allows to group the calculation per level of a factor
                      .key((d) => { return d.country;})
                      .entries(this.data);
    }
    //////////////////////////////////////////////// Part2
    setXYScales(){    
      this.scale_x = d3.scaleTime().range([0, this.width]);
      this.scale_y = d3.scaleLinear().range([this.height, 0]);
    }
    createLines(){
        this.valueLine = d3.line()
                           .x((d) => { return this.scale_x(d.date); })
                           .y((d) => { return this.scale_y(+d.confirmed); });
    }
    scaleXYDomains() {
      this.scale_x.domain(d3.extent(this.data, function(d) { 
        return d.date; 
      }));
      this.scale_y.domain([d3.min(this.data, function(d) { return +d.confirmed; }),
                     d3.max(this.data, function(d) { return +d.confirmed; })]);
    }
    //////////////////////////////////////////////// Part3
    drawToolTip() {
      this.tooltip = d3.select("body")
                      .append("div")
                      .style("position", "absolute")
                      .style("z-index", "10")
                      .style("visibility", "hidden");
    }
    drawCreatedLines() {
      let map_result = this.grouped_data.map(function(d){ return d.key }) // list of group names
      this.color_scale = d3.scaleOrdinal()
                            .domain(map_result)
                            .range(this.dm.getColorsArray())
  
      this.gCanvas.selectAll(".line")
                  .data(this.grouped_data)
                  .enter()
                    .append("path")
                    .attr("fill", "none")
                    .attr("stroke", (d)=>{ 
                      return this.color_scale(d.key) 
                    })
                    .attr("stroke-width", 2)
                    .attr("d", (d)=>{
                      return this.valueLine(d.values)
                    })
    }
    drawDots() {
      this.dots = this.gCanvas.selectAll("circle")
                      .data(this.data)
                      .enter()
                        .append("circle")
                        .attr("r", 2.5)
                        .attr("stroke", "gray")
                        .style("fill", (d) => { return this.color_scale(d.country) })
                        .attr("cx", (d) => { return this.scale_x(d.date); })
                        .attr("cy", (d) => { return this.scale_y(d.confirmed); });
      this.addTooltipBehaviorToDots();
    }
    getTooltipText(d){
      return "growth: "+Number(d.confirmed_gfactor).toFixed(2)+
              "<br> +"+Number(d.percentage_growth).toFixed(2)+"%";
    }
    addTooltipBehaviorToDots(){
      this.dots.on("mouseover", ()=>{
                  return this.tooltip.style("visibility", "visible");
                })
                .on("mousemove", (d)=>{
                  this.tooltip.html(this.getTooltipText(d))
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
        this.addAxisLegends();
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
    addAxisLegends() {
      this.svg.append("text")
                  .attr("y", this.margin.top*2.5)
                  .attr("x", -this.height / 2)
                  .attr("transform", "rotate(-90)")
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_y_legend);  
      this.svg.append("text")
                  .attr("y", this.height - 48)
                  .attr("x", this.width / 2)
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text(this.axis_x_legend); 
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
    

}
