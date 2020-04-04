import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-total-overview',
  templateUrl: './total-overview.component.html',
  styleUrls: ['./total-overview.component.css']
})
export class TotalOverviewComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  
  protected divKey;
  protected svg: any;
  protected gCanvas: any;
  protected gCards: any;

  protected margin = 15;  
  protected width;
  protected cards_width;
  protected height;
  protected cards_height;  
  
  protected data;

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.divKey = ".total-overview"; 
    this.calculateOverallDimensions();
    this.getData();
    this.createChart()
  }
  calculateOverallDimensions() {
    this.width = $(this.divKey).width();
    this.height = $(document).height()*1/4;
    this.cards_height = this.height;
    this.cards_width = this.width;
  }
  getData() {
    this.data = this.dm.getDataByCountryList(["Total"])[0];
  }
  createChart(){
    this.setSVG();
    this.setCanvas(); 
    this.drawCardsBackground();
    this.writeInCard();
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
                            .attr("class", "canvas")
                            .attr("transform", () => {
                              return "translate(" + 1 + ","
                                                  + (this.margin-1) +")";
                            });
    // if (this.curTransform) this.gCanvas.attr('transform', this.curTransform);
  }
  drawCardsBackground() {
    this.gCanvas.append("rect")
                .attr("fill", "none")
                .style("stroke", "black")
                .style("stroke-width", 2)
                .attr("width", this.cards_width-2)
                .attr("height", this.cards_height - this.margin)
                .attr("rx", 8)
                .attr("ry", 8);
  }
  writeInCard() {
    let total = this.pipeNumberToString(this.data.confirmed);
    let deaths = this.pipeNumberToString(this.data.death);
    let recovered = this.pipeNumberToString(this.data.recovered);
    console.log(this.data.death)
    console.log(this.data.recovered)
    this.gCanvas.append("text")
                .text("World")
                .attr("transform", "translate("+this.margin/2+","+
                                                this.margin*1.5+")"); 
    this.gCanvas.append("text")
                .text("Total: "+total)
                .attr("transform", "translate("+this.margin/2+","+
                                                this.margin*4+")"); 
    this.gCanvas.append("text")
                .text("Recovered: "+recovered)
                .attr("transform", "translate("+this.margin/2+","+
                                                this.margin*5+")"); 
    this.gCanvas.append("text")
                .text("Deaths: "+deaths)
                .attr("transform", "translate("+this.margin/2+","+
                                                this.margin*6+")");
  }

  pipeNumberToString(number: number){
    let mil = Math.floor(number/1000000);
    let tho = Math.floor((number-mil*1000000)/1000);
    let un = Math.floor(number-mil*1000000-tho*1000);

    let tho_str = tho+"";
    let un_str = un+"";
    
    if(mil>0) tho_str =this.addZeroToStringNumberIfNeeded(tho);
    if(tho>0) un_str =this.addZeroToStringNumberIfNeeded(un);

    let result_str = un_str;
    if(tho>0) result_str = tho_str+"."+result_str;
    if(mil>0) result_str = mil+"."+result_str;

    return result_str;    
  }
  addZeroToStringNumberIfNeeded(number){
    if(number<10) return "00"+number;
    if(number<100) return "0"+number;
    return number;
  }

  addCountry(){    
    console.log("aaaaa")
  }

}
