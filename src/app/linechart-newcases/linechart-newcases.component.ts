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

  ngOnInit() {    
    this.setup();
    this.createChart();
  }
  setup(){
    this.divKey = ".linechart-newcases";    
    this.initialTransform = d3.zoomIdentity.translate(80, 10).scale(0.8);
    this.width = $(this.divKey).width()
    this.height = $(document).height()*1/3;
    this.data = this.dm.getLastWeekDataByCountryList(null);
    this.axis_y_legend = "Log(Cases Last Week)";
    this.axis_x_legend = "Total Cases";
  }
  
  loadCountriesByArray(countries:Array<string>){
    this.data = this.dm.getLastWeekDataByCountryList(countries);
    this.cleanCanvas();
    this.createChart();
  }
  //////////////////////////////////////////////// Part 2
  setXYScales(){    
    this.scale_x = d3.scaleLinear().range([0, this.width]);
    this.scale_y = d3.scaleLog().range([this.height, 0]);
  }
  createLines(){
    this.valueLine = d3.line()
                       .x((d) => { return this.scale_x(d.total_confirmed); })
                       .y((d) => { return this.scale_y(d.confirmed_last_week); });
  }
  scaleXYDomains() {
    this.scale_x.domain(d3.extent(this.data, (d) => { 
      return d.total_confirmed; 
    }));
    this.scale_y.domain([d3.min(this.data, (d) => { return +d.confirmed_last_week; }),
                         d3.max(this.data, (d) => { return +d.confirmed_last_week; })]);
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
                    .tickSize(this.height)
                    .tickPadding(8 - this.height);
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height-1) + ")")
                              .call(this.axis_x);        
  }
  drawDots() {
    this.dots = this.gCanvas.selectAll("circle")
                    .data(this.data)
                    .enter()
                      .append("circle")
                      .attr("r", 2.5)
                      .style("visibility",(d)=>{
                        let lastDate = this.dm.getLastDate(d.country);
                        return (d.date == lastDate) ? "visible" : "hidden";
                      })
                      .style("fill", (d) => { return this.color_scale(d.country); })                      
                      .attr("stroke", "gray")
                      .attr("cx", (d) => { return this.scale_x(d.total_confirmed); })
                      .attr("cy", (d) => { return this.scale_y(d.confirmed_last_week); });
    this.addTooltipBehaviorToDots();
  }
  addTooltipBehaviorToDots(){
    this.dots.on("mouseover", ()=>{
                return this.tooltip.style("visibility", "visible");
              })
              .on("mousemove", (d)=>{
                this.tooltip.html("growth: "+Number(d.confirmed_last_week).toFixed(2))
                return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                                   .style("left",(d3.event.pageX+10)+"px");
              })
              .on("mouseout", ()=>{
                return this.tooltip.style("visibility", "hidden");                
              });
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
