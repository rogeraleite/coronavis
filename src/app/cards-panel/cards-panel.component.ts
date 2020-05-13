import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() selectCountryOutput = new EventEmitter<any>();

  protected divKey;
  protected svg: any;
  protected gCanvas: any;
  protected gCards: any;
  protected color_scale: any;

  protected margin = 2;  
  protected width;
  protected cards_width;
  protected height;
  protected cards_height;  

  protected data;
  protected lastweek_data;
  protected grouped_data;
  protected prediction_datamap;

  private left_margin = 6;
  private body_top_margin = 40;

  constructor() { }

  ngOnInit() {
    this.divKey = ".cards-panel"; 
    this.calculateOverallDimensions();
    this.getData();
    this.createChart()
  }
  calculateOverallDimensions() {
    this.width = $(this.divKey).width();
    this.height = $(document).height()*0.22;
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
    this.writeCardsBody();
    this.writeCardsFootnote();
  }



  loadCountriesGroupsByArray(countries){
    this.getDataByCountries(countries);
    this.updateChart();
  }
  updateChart(){
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
    this.data = this.dm.getCurrentDataByCountryList(countries);
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
                                  .on("click", (d) => {
                                    this.dm.setSelectedCountry(d.key);
                                    this.emitCountrySelection(d.key);
                                    this.updateChart();
                                  })
                                  .attr("transform", (d,i) => {
                                          return "translate(" + ((i*this.cards_width)+this.margin) + ","
                                                              + this.margin +")";
                                        });
  }
  emitCountrySelection(country){
      this.selectCountryOutput.emit(country);
  }
  drawCardsBackground() {
    this.gCards.append("rect")
                .attr("id", (d) => { return "card-"+d.key })
                .attr("fill", (d) => { return this.color_scale(d.key); })
                .attr("width", this.cards_width - this.margin)
                .attr("height", this.cards_height - this.margin)
                .attr("stroke-width", 2)
                .attr("stroke", (d)=>{
                  if(this.dm.isSelectedCountry(d.key)){ return "black" }
                  return "none"
                })                
                .attr("rx", 3)
                .attr("ry", 3);
  }
  writeCardsTitle() {
    let top_margin = 15;
    this.gCards.append("text")
                .text((d) => { return d.key; })
                .attr("transform", "translate("+this.left_margin+","+top_margin*1.5+")")                
                .attr("font-weight", 500); 
  }
  writeCardsFootnote() {    
    this.writeCardsExpectedEndDay();
    this.writeAmountSamples();    
  }
  writeAmountSamples(){
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
                .attr("font-weight", 500)
                .attr("transform", "translate("+
                        (this.cards_width+right_margin)+","+ //x
                        (this.cards_height+bottom_margin*1.5)+")");//y
  }
  writeCardsBody() {
    this.writeCardsTable();
  }
  writeCardsTable(){
    let header = ["cases", "deaths", "tests"]
    let rows = ["total", "today", "today %", "expected"]
    
    let labels_font_size = 10;

    let cell_width = this.cards_width/(header.length+1);
    let cell_height = this.cards_height/8;

    //HEADER
    header.forEach((element,i)=>{
        this.gCards.append("text").text(element)
                    .style("font-size", labels_font_size+"px")
                    .attr("transform", "translate("+
                                                  ((this.left_margin+cell_width)+i*cell_width)+","+ //x
                                                  (this.body_top_margin)+")"); //y
    });
    //ROWS
    rows.forEach((element,i)=>{
      this.gCards.append("text").text(element)
                  .style("font-size", labels_font_size+"px")
                  .attr("transform", "translate("+
                                                (this.left_margin)+","+ //x
                                                ((this.body_top_margin+cell_height)+i*cell_height)+")"); //y
    });

    this.writeCardsTableInfo(header,rows,cell_width,cell_height);

  }

  writeCardsTableInfo(header: string[], rows: string[], cell_width, cell_height) {    
    let info_font_size = 11;
    let pos0_x = this.left_margin+cell_width;
    let pos0_y = this.body_top_margin+cell_height;

    header.forEach((header_element,i)=>{
      rows.forEach((row_element,j)=>{
        let infoId = header_element+"_"+row_element;
        this.gCards.append("text").text((d)=>{
                      let text = this.getInfoByInfoId(infoId, d.key);
                      return text;
                    })
                    .style("font-size", info_font_size+"px")
                    .attr("font-weight", 500)
                    .attr("transform", "translate("+
                                                  ((pos0_x)+i*cell_width)+","+ //x
                                                  ((pos0_y)+j*cell_height)+")"); //y
      })
    });

  }

  writeCardsExpectedEndDay(){
    let bottom_margin = -8;
    let font_size = 11;

    this.gCards.append("text")
                .text("expected end:")
                .style("font-size", font_size+"px")
                .attr("transform", "translate("+
                        (this.left_margin)+","+ //x
                        (this.cards_height+(bottom_margin*1.5)-font_size)+")");//y
    this.gCards.append("text")
                .text((d) => { return this.getInfoByInfoId("end_day_date", d.key); })
                .style("font-size", font_size+"px")
                .attr("font-weight", 500)
                .attr("transform", "translate("+
                        (this.left_margin)+","+ //x
                        (this.cards_height+bottom_margin*1.5)+")");//y
  }
  getInfoByInfoId(infoId, country){
    let info = this.prediction_datamap[country];
    let result = "error";
    switch(infoId){
      case "cases_speed": {
        result = info.cases_speed.toFixed(2)
        break;
      }
      case "end_day_date":{
        result = this.dm.getExpectedEndCasesDateString(country);
        break;
      }
      case "cases_total":{        
        result = this.dm.pipeNumberToString(this.dm.getTotalCases(country));
        break;
      }
      case "cases_expected":{        
        let exp_cases_number = this.dm.getExpectedCasesByComparingWithCurrent(country);
        result = this.dm.pipeNumberToString(exp_cases_number) // + "(+-"+this.dm.pipeNumberToString((info.cases_number_error.toFixed(0))/1000)+"k)";
        break;
      }
      case "cases_today":{
        let yesterday = this.dm.getTodayCases(country);
        result = this.dm.pipeNumberToString(yesterday);
        break;
      }
      case "cases_today %":{
        let yesterday = this.dm.getTodayCases(country);
        let total = this.dm.getTotalCases(country);
        let percentage = (yesterday*100/total).toFixed(1);
        result = "+"+percentage+"%";
        break;
      }
      case "deaths_total":{
        result = this.dm.pipeNumberToString(this.dm.getTotalDeaths(country))
        break;
      }
      case "deaths_expected":{
        let exp_deaths_number = this.dm.getExpectedDeathsByComparingWithCurrent(country);
        result = this.dm.pipeNumberToString(exp_deaths_number);
        break;
      }
      case "deaths_today":{
        let yesterday = this.dm.getTodayDeaths(country);
        result = this.dm.pipeNumberToString(yesterday);        
        break;
      }
      case "deaths_today %":{
        let yesterday = this.dm.getTodayDeaths(country);
        let total = this.dm.getTotalDeaths(country);
        let percentage = (yesterday*100/total).toFixed(1);
        result = "+"+percentage+"%";        
        break;
      }
      case "tests_total":{
        result = this.dm.pipeNumberToAbbreviationStr(this.dm.getTotalTests(country));   
        if(+result < 1 ) result = "N/A";
        break;
      }
      case "tests_today":{
        result = this.dm.pipeNumberToAbbreviationStr(this.dm.getTodayTests(country));        
        if(+result < 1 ) result = "N/A";
        break;
      }
      case "tests_today %":{        
        let yesterday = this.dm.getTodayTests(country);
        let total = this.dm.getTotalTests(country);
        let percentage = (yesterday*100/total).toFixed(1);
        result = "+"+percentage+"%";        
        if(+total < 1 ) result = "N/A";
        break;
      }
      case "tests_expected":{
        result = "";        
        break;
      }
    }    
    return result;
  }
  

}
