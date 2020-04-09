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
  protected prediction_datamap;

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
    this.writeCardsInfo();
    this.writeCardsFootnote();
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
    this.prediction_datamap = this.dm.getPredictionDataMap();
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
  }
  writeCardsFootnote() {
    let bottom_margin = -8;
    let right_margin = -65;
    let font_size = 11;

    this.gCards.append("text")
                .text("based on")
                .style("font-size", font_size+"px")
                .attr("transform", "translate("+
                        (this.cards_width+right_margin)+","+ //x
                        (this.cards_height+(bottom_margin*1.5)-font_size)+")");//y
    this.gCards.append("text")
                .text((d) => { 
                  let amount_samples = this.prediction_datamap[d.key].amount_samples;
                  return amount_samples + " samples"; 
                })
                .style("font-size", font_size+"px")
                .attr("transform", "translate("+
                        (this.cards_width+right_margin)+","+ //x
                        (this.cards_height+bottom_margin*1.5)+")");//y
  }
  writeCardsInfo() {
    //TODO
    let top_margin = 35;
    let left_margin = 10;
    let font_size = 15;

    let info = ["infection_speed","current_infections","exp_infected_number","end_day_date"];
    info.forEach((e,i)=>{
      let top_info_margin = top_margin + i*font_size*2
      //HEADER
      this.gCards.append("text")
                .text(this.getInfoHeaderByInfoId(e))
                .style("font-size", font_size*2/3+"px")
                .attr("transform", "translate("+
                        (left_margin)+","+      //x
                        (top_info_margin)+")"); //y
      //INFO
      this.gCards.append("text")
                .text((d) => { 
                  let country = d.key;
                  let info = this.getInfoByInfoId(e,country);
                  return info; 
                })
                .style("font-size", font_size+"px")
                .attr("transform", "translate("+
                        (left_margin*2)+","+                //x
                        (top_info_margin + font_size)+")"); //y      
    })

    
  }
  getInfoHeaderByInfoId(infoId){
    let result = "Error:";
    if(infoId=="infection_speed"){ result = "Speed:" }
    else if(infoId=="current_infections"){ result = "Cur. infections (people):" }
    else if(infoId=="exp_infected_number"){ result = "Exp. infections (people):" }
    else if(infoId=="end_day_date"){ result = "Exp. end date:" }
    return result;
  }
  getInfoByInfoId(infoId, country){
    let info = this.prediction_datamap[country];
    let result = "error";
    if(infoId=="infection_speed"){
      result = info.infection_speed.toFixed(2)
    }
    else if(infoId=="current_infections"){
      result = this.dm.pipeNumberToString(this.dm.getCurrentInfections(country));
    }
    else if(infoId=="exp_infected_number"){
      let cur_infections = this.dm.getCurrentInfections(country);
      let exp_infections = info.infected_number.toFixed(0);
      if(cur_infections>exp_infections){//"fix" concluded cases prediction issue
        exp_infections = cur_infections;
      }
      let number = this.dm.pipeNumberToString(exp_infections);
      result = number
    }
    else if(infoId=="infected_number_error"){
      result = info.infected_number_error.toFixed(2)      
    }
    else if(infoId=="end_day_date"){
      result = this.dm.parseDateObjToDateString(info.end_day_date);
    }
    return result;
  }

}
