import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css']
})
export class LegendComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  protected svg: any;
  protected gCanvas: any;
  protected divKey;
  protected width;
  protected height;
  protected color_scale;  
  protected space_each_item;
  protected margin;

  protected data;  
  protected groups;

  constructor() { }

  ngOnInit() {
    this.divKey = ".legend";
    this.space_each_item = 15;
    this.margin = 10;
    this.loadData();
    this.calculateWidthHeight();
    this.createLegend();
  }  
  loadData(){
    this.data = this.dm.getDataByCountryList(null);
    this.groupData();
  }
  calculateWidthHeight() {    
    this.width = $(document).width()*1/6;
    this.height = (this.groups.length * this.space_each_item)+this.margin;
  }  
  createLegend(){
    this.setSVG();
    this.setCanvas();
    this.getColorScale();
    this.addLegend(); 
  }
  groupData() {
    this.groups = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key((d) => { return d.country;})
                    .entries(this.data);
  }
  loadCountriesGroupsByArray(countries){
    this.loadDataByCountries(countries);
    this.calculateWidthHeight();
    this.cleanCanvas();
    this.createLegend();
  }
  loadDataByCountries(countries){
    if(countries){
      this.data = this.dm.getDataByCountryList(countries);
      this.groups = d3.nest() // nest function allows to group the calculation per level of a factor
                        .key((d) => { return d.country;})
                        .entries(this.data);
    }
  }
  setSVG(){
    this.svg = d3.select(this.divKey)
                  .append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height)
                  .attr("transform", "translate(0,"+this.margin+")");
  }  
  setCanvas(){
    this.gCanvas = this.svg.append("g")
                           .attr("class", "canvas");  }
  getColorScale() {
    let map_result = this.groups.map(function(d){ return d.key }) // list of group names
    this.color_scale = d3.scaleOrdinal()
                            .domain(map_result)
                            .range(this.dm.getColorsArray())
  }
  addLegend(){
    let rect_size = 10;
    this.gCanvas.append("rect")
              .attr("width", this.width*2/3)
              .attr("height",(d) => {
                  return this.height;
              })
              .attr("x", 0)
              .attr("y", -this.margin)
              // .attr("fill","#E8E8E8")              
              .attr("fill","white")
              .attr("opacity","1");

    let gLegend = this.gCanvas.selectAll(".lineLegend")
                                .data(this.groups)
                                .enter()
                                  .append("g")
                                  .attr("class","lineLegend")
                                  .attr("transform", (d,i) => {
                                          return "translate(" + this.width/30 + "," + (this.margin/4+(i*this.space_each_item))+")";
                                      });
    gLegend.append("text")
              .text((d) => { return d.key; })
              .attr("transform", "translate("+this.space_each_item+",9)"); //align texts with boxes

    gLegend.append("rect")
              .attr("fill", (d, i) => {return this.color_scale(d.key); })
              .attr("width", rect_size)
              .attr("height", rect_size);
  }
  cleanCanvas(){
    if(this.svg) this.svg.remove();
  }

}
