import { Component, OnInit, Input } from '@angular/core';

import * as d3 from "d3";
import * as $ from 'jquery';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-linechart-n',
  templateUrl: './linechart-n.component.html',
  styleUrls: ['./linechart-n.component.css']
})
export class LinechartNComponent implements OnInit {
  
  @Input() dm: DataManagerComponent;
  
  private divKey = "div.linechart";
  private svg: any;
  // private svg_width: any;
  // private svg_height: any;
  private gCanvas: any;
  private color_scale: any;
  private scale_x: any;
  private scale_y: any;
  private axis_x: any;
  private axis_y: any;
  private gAxis_x: any;
  private gAxis_y: any;
  private curTransform: any = null;
  private zoom: any;
  private dots: any;
  private tooltip: any;

  private valueLine;
  private groups;

  private margin = {top: 15, right: 0, bottom: 0, left: 0};
  private width;// = 800 - this.margin.left - this.margin.right;
  private height;// = 600 - this.margin.top - this.margin.bottom;
  private data;
 
  constructor() { }

  ngOnInit() {        
    this.width = $(".linechart-n").width()
    this.height = $(document).height()*2/3;
    this.data = this.dm.getDataByCountryList(null);
    this.createChart()
  }
  
  createChart(){
    /////////////////////// Part1
    this.setSVG();
    this.setCanvas();
    this.groupData()
    /////////////////////// Part2
    this.formatData();
    this.setValueLine();
    this.scaleXYDomains();
    /////////////////////// Part3
    this.drawToolTip();
    this.drawLines();
    this.drawDots()
    this.addLegend();
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
    // this.svg_width = this.width + this.margin.left + this.margin.right;
    // this.svg_height = this.height + this.margin.top + this.margin.bottom;
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
  groupData() {
    this.groups = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key((d) => { return d.country;})
                    .entries(this.data);
  }
  //////////////////////////////////////////////// Part2
  formatData() {
    this.data.forEach(function(d) {
        d.confirmed = +d.confirmed;
    });
  }
  setValueLine(){    
    this.scale_x = d3.scaleTime().range([0, this.width]);
    this.scale_y = d3.scaleLinear().range([this.height, 0]);
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
  drawLines() {
    let res = this.groups.map(function(d){ return d.key }) // list of group names
    this.color_scale = d3.scaleOrdinal()
                          .domain(res)
                          .range(this.dm.getColorsArray())

    this.gCanvas.selectAll(".line")
                .data(this.groups)
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
                      .attr("r", 3.5)
                      .attr("stroke", "gray")
                      .style("fill", (d) => { return this.color_scale(d.country) })
                      .attr("cx", (d) => { return this.scale_x(d.date); })
                      .attr("cy", (d) => { return this.scale_y(d.confirmed); });
    this.addTooltipBehaviorToDots();
  }
  addTooltipBehaviorToDots(){
    this.dots.on("mouseover", ()=>{
                return this.tooltip.style("visibility", "visible");
              })
              .on("mousemove", (d)=>{
                this.tooltip.html("growth: "+Number(d.confirmed_gfactor).toFixed(2))
                return this.tooltip.style("top", (d3.event.pageY-10)+"px")
                                   .style("left",(d3.event.pageX+10)+"px");
              })
              .on("mouseout", ()=>{
                return this.tooltip.style("visibility", "hidden");                
              });
    // .on("mouseover", (d) =>{		      
    //   let currentMousePos = { x: -1, y: -1 };
    //   $(document).mousemove((event) => {
    //       currentMousePos.x = d3.event.pageX;
    //       currentMousePos.y = d3.event.pageY;
    //   });
    //   // console.log(d3.mouse(this))
    //   this.tooltip.transition()		
    //               .duration(200)		
    //               .style("opacity", .9);		
    //   this.tooltip.html("growth: "+Number(d.confirmed_gfactor).toFixed(2))	
    //               .style("left", d3.mouse(this)[0]+"px")		 
    //               .style("top", d3.mouse(this)[1]+"px")           
    //               // .style("left", (d3.mouse()[0]) + "px")		
    //               // .style("left", pos_x)		
    //               // .style("top", (d3.mouse()[1]) + "px");
    //               // .style("top", pos_y);	
    // })					
    // .on("mouseout", (d) => {		
    //   this.tooltip.transition()		
                  // .duration(500)		
                  // .style("opacity", 0);	
    // });
  }
  addLegend(){
    let lineLegend = this.gCanvas.selectAll(".lineLegend")
                                .data(this.groups)
                                .enter()
                                  .append("g")
                                  .attr("class","lineLegend")
                                  .attr("transform", (d,i) => {
                                          return "translate(" + 25 + "," + (i*20)+")";
                                      });

    lineLegend.append("text")
              .text((d) => { return d.key; })
              .attr("transform", "translate(15,9)"); //align texts with boxes

    lineLegend.append("rect")
              .attr("fill", (d, i) => {return this.color_scale(d.key); })
              .attr("width", 10).attr("height", 10);
  }
  drawAxis() {
    // Add the X Axis
    this.axis_x = d3.axisTop(this.scale_x)
                    .tickFormat(d3.timeFormat("%d\/%m"))
                    .ticks((this.width + 2) / (this.height + 2) * 10)
                    .tickSize(this.height)
                    .tickPadding(8 - this.height);
    this.gAxis_x = this.svg.append("g")
                              .attr("class", "axis axis-x")
                              .attr("transform", "translate(-1," + (this.height-1) + ")")
                              .call(this.axis_x);

    // Add the Y Axis
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
    
    this.paintAxis();
  }
  paintAxis(){        
    let axis_color = "gray";
    let axis_opacity = .5;  
    this.gAxis_x.selectAll(".tick line")
                .attr("stroke",axis_color)
                .attr("opacity",axis_opacity);
    this.gAxis_x.selectAll(".tick text")
                .attr("transform", "translate(-8,-15) rotate(90)");
    this.gAxis_y.selectAll(".tick line")
                .attr("stroke",axis_color)
                .attr("opacity",axis_opacity);
  }
  applyZoomFeature() {          
    let zoomed = () => {
      this.curTransform = d3.event.transform;    
      this.gCanvas.attr("transform", this.curTransform);
      this.gAxis_x.call(this.axis_x.scale(this.curTransform.rescaleX(this.scale_x)));
      this.gAxis_y.call(this.axis_y.scale(this.curTransform.rescaleY(this.scale_y)));
      this.paintAxis();
    } 
    this.zoom = d3.zoom()
                  .scaleExtent([0.7, 5])
                  // .translateExtent([[-100, -100], [width + 90, height + 100]])
                  .on('zoom', zoomed);
    this.zoom(this.svg);
                  
    let initialTransform = d3.zoomIdentity.translate(25, 10).scale(0.9);
    this.svg.call(this.zoom)    
            .call(this.zoom.transform, initialTransform)    
  }



  

}
