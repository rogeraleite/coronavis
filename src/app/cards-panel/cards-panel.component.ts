import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as d3 from "d3";
import * as $ from 'jquery';


@Component({
  selector: 'app-cards-panel',
  templateUrl: './cards-panel.component.html',
  styleUrls: ['./cards-panel.component.css']
})
export class CardsPanelComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  protected divKey;
  protected svg: any;
  protected gCanvas: any;
  protected gCards: any;
  protected color_scale: any;

  protected margin = 5;  
  protected width;
  protected cards_width;
  protected height;
  protected cards_height;  

  protected data;
  protected lastweek_data;
  protected grouped_data;

  constructor() { }

  ngOnInit() {
    this.divKey = ".cards-panel"; 
    this.calculateOverallDimensions();
    this.getData();
    this.createChart()
  }
  calculateOverallDimensions() {
    this.width = $(this.divKey).width();
    this.height = $(document).height()*1/4;
  }
  createChart(){
    /////////////////////// Part1
    this.setSVG();
    this.setCanvas();
    this.getColorScale();    
    /////////////////////// Part2
    this.drawCardsStructure();
    this.drawCardsBackground();
    this.writeCardsTitle();
  }

  loadCountriesGroupsByArray(countries){
    console.log(countries)
    this.getDataByCountries(countries);
    this.cleanCanvas();
    this.createChart();
  }
  //////////////////////////////////////////////// Part1  
  cleanCanvas(){
    if(this.svg) this.svg.remove();
  }
  setSVG(){
    this.svg = d3.select(this.divKey)
                  .append("svg")
                  .attr("width", this.width)
                  .attr("height", this.height)
                  .attr("transform", "translate(0," + this.margin + ")");
  }  
  setCanvas(){
    this.gCanvas = this.svg.append("g")
                            .attr("class", "canvas");
    // if (this.curTransform) this.gCanvas.attr('transform', this.curTransform);
  }
  getData() {
    this.getDataByCountries(null);
  }
  getDataByCountries(countries) {
    this.data = this.dm.getDataByCountryList(countries);
    this.lastweek_data = this.dm.getLastWeekDataByCountryList(countries);
    this.grouped_data = d3.nest() // nest function allows to group the calculation per level of a factor
                          .key((d) => { return d.country;})
                          .entries(this.data);   
    this.calculateCardsDimensions();
  }
  calculateCardsDimensions() {
    this.cards_height = this.height;
    this.cards_width = this.width/this.grouped_data.length;
  }
  getColorScale() {
    let map_result = this.grouped_data.map(function(d){ return d.key }) // list of group names
    this.color_scale = d3.scaleOrdinal()
                            .domain(map_result)
                            .range(this.dm.getColorsArray())
  }
  //////////////////////////////////////////////// Part2
  drawCardsStructure() {
    this.gCards = this.gCanvas.selectAll(".cards")
                                .data(this.grouped_data)
                                .enter()
                                  .append("g")
                                  .attr("class","cards")
                                  .attr("transform", (d,i) => {
                                          return "translate(" + ((i*this.cards_width)+this.margin) + ","
                                                              + this.margin +")";
                                        });
  }
  drawCardsBackground() {
    this.gCards.append("rect")
                .attr("fill", (d) => { return this.color_scale(d.key); })
                .attr("width", this.cards_width - this.margin)
                .attr("height", this.cards_height - this.margin)
                .attr("rx", 8)
                .attr("ry", 8);
  }
  writeCardsTitle() {
    let top_margin = 15;
    let left_margin = 10;
    this.gCards.append("text")
                .text((d) => { return d.key; })
                .attr("transform", "translate("+left_margin+","+top_margin*1.5+")"); 
    this.gCards.append("text")
                .attr("dy", "0em")
                .text("to add information")
                .attr("transform", "translate("+left_margin+","+top_margin*5+")"); 
  }

}
