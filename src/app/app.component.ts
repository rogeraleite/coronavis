import { Component, ViewChild } from '@angular/core';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { DataManagerComponent } from './_datamanager/datamanager.component'
import { TotalOverviewComponent } from './total-overview/total-overview.component'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

import { TimelineComponent } from './timeline/timeline.component';
import { LinechartTestsComponent } from './linechart-tests/linechart-tests.component';
import { LinechartPredictionComponent } from './linechart-prediction/linechart-prediction.component';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { EventViewComponent } from './event-view/event-view.component';

import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;
  
  @ViewChild(TotalOverviewComponent) totalOverviewComponent_child;  
  
  @ViewChild(LinechartNComponent) lineChartNComponent_child;
  @ViewChild(LinechartTestsComponent) lineChartTestsComponent_child;
  @ViewChild(LinechartPredictionComponent) lineChartPredictionComponent_child;
  @ViewChild(LinechartNewcasesComponent) lineChartNewCases_child;  

  @ViewChild(TimelineComponent) timelineComponent_child;
  @ViewChild(CardsPanelComponent) cardsPanelComponent_child;
  @ViewChild(EventViewComponent) eventViewComponent_child;
  
  protected closeResult = '';
  protected country_list_data;
  protected selectedCountries;
  public form: FormGroup;
  
  constructor(private modalService: NgbModal,
              private formBuilder: FormBuilder) { 
    this._dm = new DataManagerComponent(); 
  }

  ngOnInit(){    
    this.createForm();
    this.getCountries();
    this.addCheckboxes();  
  }

  changeScale(scale){//linear/log
    this.lineChartNComponent_child.changeScale(scale);
    this.lineChartTestsComponent_child.changeScale(scale);
  }
  changeFeature(feature){//cases/deaths/tests/pCases/pDeaths
    this.lineChartNComponent_child.changeFeature(feature);    
    this.lineChartPredictionComponent_child.changeFeature(feature);
    this.lineChartNewCases_child.changeFeature(feature);
  }
  changeUnit(unit){//absolute/populationRatio    
    this.lineChartNComponent_child.changeUnit(unit);
    this.lineChartTestsComponent_child.changeUnit(unit);
  }

  async updateViewsFocus($event){
    let view_id = $event;
    this.maximazeViewById(view_id)
  }

  maximazeViewById(id){
    let NAME = document.getElementById(id);
    let currentClass = NAME.className.split(" ");
    if (currentClass[0] == "col-sm-6") { // Check the current class name
        NAME.className = "col-sm-12"+" "+currentClass[1];   // Set other class name
        this.hideAllLinecharts();
        this.showLinechartsById(id);
    } 
    else {
        NAME.className = "col-sm-6"+" "+currentClass[1];  // Otherwise, use `second_name`
        this.showAllLinecharts();
    }
    this.refreshChartById(id);
  }  
  refreshChartById(id){
    switch(id){
      case "linechart-n": this.lineChartNComponent_child.refreshChart();
      break;
      case "linechart-tests": this.lineChartTestsComponent_child.refreshChart();
      break;
      case "linechart-newcases": this.lineChartNewCases_child.refreshChart();
      break;
      case "linechart-prediction": this.lineChartPredictionComponent_child.refreshChart();
      break;
    }
  }
  showLinechartsById(id){    
    document.getElementById(id).style.display='block';
  }
  hideAllLinecharts(){    
    document.getElementById("linechart-n").style.display='none';
    document.getElementById("linechart-tests").style.display='none';
    document.getElementById("linechart-newcases").style.display='none';
    document.getElementById("linechart-prediction").style.display='none';
  }
  showAllLinecharts(){    
    document.getElementById("linechart-n").style.display='block';
    document.getElementById("linechart-tests").style.display='block';
    document.getElementById("linechart-newcases").style.display='block';
    document.getElementById("linechart-prediction").style.display='block';
  }

  async updateSelectedDay_FromTimeline($event){    
    let event = $event;
    if(!event){ this.resetShadowInViews(); }
    else{
      this._dm.separateEventNotes(event);
      this.eventViewComponent_child.updateEvent();

      this.lineChartNComponent_child.updateSelectedDay();
      this.lineChartTestsComponent_child.updateSelectedDay();
      this.lineChartPredictionComponent_child.updateSelectedDay();
      this.lineChartNewCases_child.updateSelectedDay();
    }
  }

  async updateSelectedDay_FromLinecharts($event){    
    let date = $event;    
    if(!date){ this.resetShadowInViews(); }
    else{
      let date_minus_incubation_phase = this._dm.addDaysToMillisecondDate(date,-5);
      this.timelineComponent_child.updateSelectedDateBehavior(date_minus_incubation_phase);

      let event = this.timelineComponent_child.getDataEventByDate(date_minus_incubation_phase);
      this.updateSelectedDay_FromTimeline(event);
    }
  }
  resetShadowInViews() {
    this.timelineComponent_child.resetShadow();

    this.lineChartNComponent_child.resetShadow();
    this.lineChartTestsComponent_child.resetShadow();
    this.lineChartPredictionComponent_child.resetShadow();
    this.lineChartNewCases_child.resetShadow();
  }

  async applySelectCountry($event){
    this.lineChartNComponent_child.updateSelectedCountry();
    this.lineChartTestsComponent_child.updateSelectedCountry();
    this.lineChartPredictionComponent_child.updateSelectedCountry();
    this.lineChartNewCases_child.updateSelectedCountry();

    this.timelineComponent_child.updateSelectedCountry();
    this.eventViewComponent_child.reset();
  }

  async updateTimelineTypeSelection($event){
    this.timelineComponent_child.updateTypeSelection($event);
  }

  async applyZoomToTimeline($event){
    // let zoom_transform = $event;
    // this.timelineComponent_child.receiveZoom(zoom_transform);
  }
  async applyZoomToLineChart($event){
    let zoom_transform = $event;
    this.lineChartNComponent_child.receiveZoom(zoom_transform)
  }

  async updateCountriesSelection($event){
    let countries = $event;
    countries = this._dm.loadCountriesByArray(countries);

    this.lineChartNComponent_child.loadCountriesByArray(countries);
    this.lineChartNewCases_child.loadCountriesByArray(countries);
    this.lineChartTestsComponent_child.loadCountriesByArray(countries);
    this.lineChartPredictionComponent_child.loadCountriesByArray(countries);

    this.timelineComponent_child.loadCountriesByArray(countries);
    this.cardsPanelComponent_child.loadCountriesGroupsByArray(countries);
  }

  addCountry(content){    
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
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
  getCountries() {
    this.country_list_data = this._dm.getDataCountriesIds();
  }
  submit() { 
    this.selectedCountries = this.form.value.countries
                                  .map((v, i) => (v ? this.country_list_data[i] : null))
                                  .filter(v => v !== null);
    this.updateCountriesSelection(this.selectedCountries);
    this.modalService.dismissAll();
  }
  addCheckboxes() {
    let initial_selection = this._dm.getCountriesSelection();
    this.country_list_data.forEach((country, i) => {
      let control = new FormControl() // if first item set to true, else false
      if(initial_selection.includes(country)){
        control.setValue(true)
      }
      (this.form.controls.countries as FormArray).push(control);
    });
  }
  createForm(){
    this.form = this.formBuilder.group({
      countries: new FormArray([])
    });
  }
  getControls() {
    return (this.form.get('countries') as FormArray).controls;
  }
  
}
