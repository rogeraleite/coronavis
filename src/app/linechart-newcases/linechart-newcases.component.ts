import { Component } from '@angular/core';
import { LinechartsParent } from '../linecharts-parent/linecharts-parent';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-linechart-newcases',
  templateUrl: './linechart-newcases.component.html',
  styleUrls: ['./linechart-newcases.component.css']
})
export class LinechartNewcasesComponent extends LinechartsParent {

  constructor() {
    super();
  }

  setup(){
    this.divKey = ".linechart-newcases";    
    this.initialTransform = d3.zoomIdentity.translate(-120, 23).scale(1.13);
    this.width = $(this.divKey).width();
    this.height = ($(document).height()*this.dm.getGraphHeightProportion());
    this.current_curve_data = this.dm.getLastWeekDataByCountryList(null);
    this.axis_y_label = "log(cases last week)";
    this.axis_x_label = "log(total cases)";
    this.scaleYType = "log";
  }
  
  loadCountriesByArray(countries:Array<string>){
    this.current_curve_data = this.dm.getLastWeekDataByCountryList(countries);
    this.cleanCanvas();
    this.createChart();
  }
  //////////////////////////////////////////////// Part 2
  setXYScales(){    
    this.scale_x = d3.scaleSymlog().range([0, this.width]);
    this.scale_y = d3.scaleSymlog().range([this.height, 0]);
  }
  createLinesRules(){
    if(this.isDeathsDimension()){ 
      this.lineRules = d3.line()
                          .x((d) => { return this.scale_x(d.total_deaths); })
                          .y((d) => { return this.scale_y(d.deaths_last_week); });
    }
    else{
      this.lineRules = d3.line()
                          .x((d) => { return this.scale_x(d.total_confirmed); })
                          .y((d) => { return this.scale_y(d.confirmed_last_week); });
    }
    
  }
  scaleXYDomains() {    
    if(this.isDeathsDimension()){ 
      this.setXDomain_asDeaths();
      this.setYDomain_asDeaths(); 
    }
    else{ 
      this.setXDomain_asCases();
      this.setYDomain_asCases(); 
    }      
  }
  setXDomain_asDeaths(){
    this.scale_x.domain(d3.extent(this.current_curve_data, (d) => { return +d.total_deaths; }));
  }
  setYDomain_asDeaths(){
    this.scale_y.domain([d3.min(this.current_curve_data, (d) => { return +d.deaths_last_week; }),
                         d3.max(this.current_curve_data, (d) => { return +d.deaths_last_week; })]);
  }
  setXDomain_asCases(){
    this.scale_x.domain(d3.extent(this.current_curve_data, (d) => { return +d.total_confirmed; }));
  }
  setYDomain_asCases(){
    this.scale_y.domain([d3.min(this.current_curve_data, (d) => { return +d.confirmed_last_week; }),
                         d3.max(this.current_curve_data, (d) => { return +d.confirmed_last_week; })]);
  }

  //////////////////////////////////////////////// Part 3
  drawAxisY(){
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
  drawAxisX(){
    this.axis_x = d3.axisTop(this.scale_x)
                    .tickFormat((d)=>{ 
                      if(d>=0) return d/1000 + "k";                       
                    })
                    .ticks((this.width + 2) / (this.height + 2) * 10)
                    .ticks(4)
                    .tickSize(this.height)
                    .tickPadding(8 - this.height);
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height-1) + ")")
                              .call(this.axis_x);        
  }
  drawCurrentLineDots() {
    this.dots = this.gCanvas.selectAll("circle")
                    .data(this.current_curve_data)
                    .enter()
                      .append("circle")
                      .attr("r", 2.5)
                      .attr("opacity", (d)=>{
                        return this.getColorOpacityByCountry(d.country);
                      })                      
                      .style("visibility",(d)=>{
                        let lastDate = this.dm.getLastDateByCountry(d.country);
                        return (d.date === lastDate) ? "visible" : "hidden";
                      })
                      .style("fill", (d) => { return this.color_scale(d.country); })                      
                      .attr("stroke", "gray")
                      .attr("cx", (d) => {                        
                        if(this.isDeathsDimension()){
                          return this.scale_x(d.total_deaths); 
                        }
                        return this.scale_x(d.total_confirmed); 
                      })
                      .attr("cy", (d) => {              
                        if(this.isDeathsDimension()){
                          return this.scale_y(d.deaths_last_week); 
                        }                            
                        return this.scale_y(d.confirmed_last_week); 
                      });
    this.addTooltipBehaviorToDots();
  }
  getCurrentDotsTooltipText(d){

    let last_week = d.confirmed_last_week;
    let total = d.total_confirmed;
    let percentage_growth = last_week*100/total;
    let date_str = this.dm.pipeDateObjToDateString(d.date);

    return "Last week growth:"+
           "<br> +"+Number(percentage_growth).toFixed(2)+"%"+
           "<br> <small> date: "+date_str+" </small>";
  }
  addTooltipBehaviorToDots(){
    this.dots.on("mouseover", (d)=>{
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
  defineZoomFeature() {          
    let zoomed = () => {
      let curTransform = d3.event.transform;    
      this.gCanvas.attr("transform", curTransform);
      this.zoomAxisX(curTransform);
      this.zoomAxisY(curTransform);        
      this.paintAxis();
    } 
    this.zoom = d3.zoom()
                  .scaleExtent([0.7, 5])
                  .translateExtent([[-150, -150], [this.width + 200, this.height + 200]])
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
  drawPrediction() {
    //leave empty
  }



}
