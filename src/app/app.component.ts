import { Component, ViewChild } from '@angular/core';
import { CountrylistComponent } from './countrylist/countrylist.component';
import { MainLinechartComponent } from './main-linechart/main-linechart.component';
import { TimechartComponent } from './timechart/timechart.component';
import { DataManagerComponent } from './_datamanager/datamanager.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;

  @ViewChild(CountrylistComponent) countryListComponent_child;
  @ViewChild(MainLinechartComponent) mainlineChartComponent_child;
  @ViewChild(TimechartComponent) timeChartComponent_child;
  // @ViewChild(CountrylistComponent, {static: true}) countryListComponent_child;
  // @ViewChild(MainLinechartComponent, {static: true}) mainlineChartComponent_child;
  // @ViewChild(TimechartComponent, {static: true}) timeChartComponent_child;

  constructor() { 
    this._dm = new DataManagerComponent(); 
  }

  async receiveCountriesSelection($event){
    let countries = $event;
    this.mainlineChartComponent_child.loadCountriesByArray(countries)
  }
}
