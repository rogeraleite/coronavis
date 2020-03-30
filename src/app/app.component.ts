import { Component, ViewChild } from '@angular/core';
import { CountrylistComponent } from './countrylist/countrylist.component';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartLognComponent } from './linechart-logn/linechart-logn.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
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
  @ViewChild(CardsPanelComponent) cardsPanelComponent_child;
  @ViewChild(LinechartNComponent) lineChartNComponent_child;
  @ViewChild(LinechartLognComponent) lineChartLognComponent_child;
  @ViewChild(LinechartNewcasesComponent) lineChartNewCases_child;

  constructor() { 
    this._dm = new DataManagerComponent(); 
  }

  async receiveCountriesSelection($event){
    let countries = $event;
    this.lineChartNComponent_child.loadCountriesByArray(countries)
  }
}
