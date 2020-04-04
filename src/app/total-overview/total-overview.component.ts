import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';
import { NgbActiveModal, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import * as d3 from "d3";
import * as $ from 'jquery';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-total-overview',
  templateUrl: './total-overview.component.html',
  styleUrls: ['./total-overview.component.css']
})
export class TotalOverviewComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  @Output() countriesOutput = new EventEmitter<Array<string>>();
  
  protected divKey;
  protected svg: any;
  protected gCanvas: any;
  protected gCards: any;

  protected margin = 15;  
  protected width;
  protected cards_width;
  protected height;
  protected cards_height;  
  
  protected total_data;
  protected country_list_data;
  protected closeResult = '';
  protected selectedCountries;

  private total;
  private deaths;
  private recovered;

  public form: FormGroup;

  constructor(private modalService: NgbModal,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.divKey = ".total-overview"; 
    this.calculateOverallDimensions();
    this.getData();
    this.createForm();
    this.addCheckboxes();  
    this.createChart()
  }
  createForm(){
    this.form = this.formBuilder.group({
      countries: new FormArray([])
    });
  }
  addCheckboxes() {
    let initial_selection = this.dm.getInitialSelection();
    this.country_list_data.forEach((country, i) => {
      let control = new FormControl() // if first item set to true, else false
      if(initial_selection.includes(country)){
        control.setValue(true)
      }
      (this.form.controls.countries as FormArray).push(control);
    });
  }
  getControls() {
    return (this.form.get('countries') as FormArray).controls;
  }
  calculateOverallDimensions() {
    this.width = $(this.divKey).width();
    this.height = $(document).height()*1/4;
    this.cards_height = this.height;
    this.cards_width = this.width;
  }
  getData() {
    this.total_data = this.dm.getDataByCountryList(["Total"])[0];
    this.country_list_data = this.dm.getDataCountriesIds();
  }
  createChart(){
    this.setSVG();
    this.setCanvas(); 
    // this.drawCardsBackground();
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

  //DEPRECATED
  drawCardsBackground() {
    this.gCanvas.append("rect")
                .attr("fill", "none")
                .style("stroke", "black")
                .style("stroke-width", 2)
                .attr("width", this.cards_width/2-2)
                .attr("height", this.cards_height - this.margin)
                .attr("rx", 8)
                .attr("ry", 8);
  }
  writeInCard() {
    this.total = this.pipeNumberToString(this.total_data.confirmed);
    this.deaths = this.pipeNumberToString(this.total_data.death);
    this.recovered = this.pipeNumberToString(this.total_data.recovered);
    // let font_size = 20;
    // let space_division = 4;

    // this.gCanvas.append("text")
    //             .text("Total: "+total).style("font-size", font_size)
    //             .attr("transform", "translate("+this.width/space_division+","+
    //                                             this.margin/2+")"); 
    // this.gCanvas.append("text")
    //             .text("Recovered: "+recovered).style("font-size", font_size)
    //             .attr("transform", "translate("+this.width*2/space_division+","+
    //                                             this.margin/2+")"); 
    // this.gCanvas.append("text")
    //             .text("Deaths: "+deaths).style("font-size", font_size)
    //             .attr("transform", "translate("+this.width*3/space_division+","+
    //                                             this.margin/2+")");
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

  addCountry(content){    
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      console.log("aaaaa")
    }, 
    (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  submit() { 
    this.selectedCountries = this.form.value.countries
                                  .map((v, i) => (v ? this.country_list_data[i] : null))
                                  .filter(v => v !== null);
    this.emitCountriesOutput();
    this.modalService.dismissAll();
  }
  emitCountriesOutput(){
    this.countriesOutput.emit(this.selectedCountries);
  }

}
