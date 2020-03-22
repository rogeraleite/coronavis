import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-countrylist',
  templateUrl: './countrylist.component.html',
  styleUrls: ['./countrylist.component.css']
})
export class CountrylistComponent implements OnInit {

  form: FormGroup;
  
  private ordersData = [
    { id: 1, name: 'order 1' },
    { id: 2, name: 'order 2' },
    { id: 3, name: 'order 3' },
    { id: 4, name: 'order 4' }
  ];

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      orders: new FormArray([])
    });
    this.addCheckboxes();
  }
  
  private addCheckboxes() {
    this.ordersData.forEach((o, i) => {
      const control = new FormControl(i === 0); // if first item set to true, else false
      (this.form.controls.orders as FormArray).push(control);
    });
  }

  submit() { 
    const selectedOrderIds = this.form.value.orders
      .map((v, i) => (v ? this.ordersData[i].id : null))
      .filter(v => v !== null);
    console.log(selectedOrderIds);
    console.log("submit clicked")
  }

  ngOnInit() {
  }

}
