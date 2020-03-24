import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-countrylist',
  templateUrl: './countrylist.component.html',
  styleUrls: ['./countrylist.component.css']
})
export class CountrylistComponent implements OnInit {
  
  @Input() dm: DataManagerComponent;
  form: FormGroup;
  
  private country_list;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      orders: new FormArray([])
    });
  }
  
  private addCheckboxes() {
    this.country_list.forEach((o, i) => {
      const control = new FormControl(i === 0); // if first item set to true, else false
      (this.form.controls.orders as FormArray).push(control);
    });
  }

  submit() { 
    const selectedOrderIds = this.form.value.orders
      .map((v, i) => (v ? this.country_list[i] : null))
      .filter(v => v !== null);
    console.log(selectedOrderIds);
  }

  ngOnInit() {
    this.country_list = this.dm.getDataIds();
    this.addCheckboxes();  
  }

}
