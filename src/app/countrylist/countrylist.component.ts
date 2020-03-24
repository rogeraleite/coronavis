import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-countrylist',
  templateUrl: './countrylist.component.html',
  styleUrls: ['./countrylist.component.css']
})
export class CountrylistComponent implements OnInit {
  
  @Input() dm: DataManagerComponent;  
  @Output() countriesOutput = new EventEmitter<Array<string>>();
  form: FormGroup;
  private selectedCountries: any
  
  private country_list;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      countries: new FormArray([])
    });
  }
  
  private addCheckboxes() {
    let initial_selection = this.dm.getInitialSelection();
    this.country_list.forEach((country, i) => {
      let control = new FormControl() // if first item set to true, else false
      if(initial_selection.includes(country)){
        control.setValue(true)
      }
      (this.form.controls.countries as FormArray).push(control);
    });
  }

  submit() { 
    this.selectedCountries = this.form.value.countries
                                  .map((v, i) => (v ? this.country_list[i] : null))
                                  .filter(v => v !== null);
    this.emitCountriesOutput();
  }
  emitCountriesOutput(){
    this.countriesOutput.emit(this.selectedCountries);
  }

  ngOnInit() {
    this.country_list = this.dm.getDataIds();
    this.addCheckboxes();  
  }

}
