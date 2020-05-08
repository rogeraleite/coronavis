import { Component, ViewChild } from '@angular/core';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { DataManagerComponent } from './_datamanager/datamanager.component'
import { TotalOverviewComponent } from './total-overview/total-overview.component'
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';


import * as $ from 'jquery';
import { TimelineComponent } from './timeline/timeline.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;

  @ViewChild(LinechartNComponent) lineChartNComponent_child;
  @ViewChild(TimelineComponent) timelineComponent_child;

  @ViewChild(LinechartNewcasesComponent) lineChartNewCases_child;  
  @ViewChild(CardsPanelComponent) cardsPanelComponent_child;
  @ViewChild(TotalOverviewComponent) totalOverviewComponent_child;
  
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
  }
  changeFeature(feature){//cases/deaths/tests/pCases/pDeaths
    this.lineChartNComponent_child.changeFeature(feature);
    this.timelineComponent_child.changeFeature(feature);
  }
  changeUnit(unit){//absolute/populationRatio    
    this.lineChartNComponent_child.changeUnit(unit);
  }

  async applyZoomToTimeline($event){
    let zoom_transform = $event;
    this.timelineComponent_child.receiveZoom(zoom_transform);
  }
  async applyZoomToLineChart($event){
    let zoom_transform = $event;
    this.lineChartNComponent_child.receiveZoom(zoom_transform)
  }

  async updateCountriesSelection($event){
    let countries = $event;
    countries = this._dm.updateSelectedCountries(countries);
    this.lineChartNComponent_child.loadCountriesByArray(countries);
    // this.lineChartNewCases_child.loadCountriesByArray(countries);
    this.cardsPanelComponent_child.loadCountriesGroupsByArray(countries);
    this.timelineComponent_child.loadCountriesByArray(countries);
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
