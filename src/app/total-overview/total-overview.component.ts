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

  //displayed
  public date;
  public total;
  public deaths;
  public recovered;

  public form: FormGroup;

  constructor(private modalService: NgbModal,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.divKey = ".total-overview"; 
    this.calculateOverallDimensions();
    this.getData();
    this.createForm();
    this.addCheckboxes();  
    this.calculateDisplayedVariables();
  }
  createForm(){
    this.form = this.formBuilder.group({
      countries: new FormArray([])
    });
  }
  addCheckboxes() {
    let initial_selection = this.dm.getCountriesSelection();
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
    this.total_data = this.dm.getCurrentDataByCountryList(["Total"])[0];
    this.country_list_data = this.dm.getDataCountriesIds();
  }
  
  calculateDisplayedVariables() {
    this.date = this.dm.pipeDateObjToDateString(this.dm.getLastDate("US"));
    this.total = this.dm.pipeNumberToString(this.total_data.confirmed);
    this.deaths = this.dm.pipeNumberToString(this.total_data.deaths);
    this.recovered = this.dm.pipeNumberToString(this.total_data.recovered);
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
