import { Component, ViewChild } from '@angular/core';
import { CountrylistComponent } from './countrylist/countrylist.component';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartLognComponent } from './linechart-logn/linechart-logn.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { DataManagerComponent } from './_datamanager/datamanager.component'
import { LegendComponent } from './legend/legend.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;

  @ViewChild(CountrylistComponent) countryListComponent_child;
  @ViewChild(LegendComponent) legend_child;
  @ViewChild(LinechartNComponent) lineChartNComponent_child;
  @ViewChild(LinechartLognComponent) lineChartLognComponent_child;
  @ViewChild(LinechartNewcasesComponent) lineChartNewCases_child;  
  @ViewChild(CardsPanelComponent) cardsPanelComponent_child;

  constructor() { 
    this._dm = new DataManagerComponent(); 
  }

  async receiveCountriesSelection($event){
    let countries = $event;
    this.lineChartNComponent_child.loadCountriesByArray(countries);
    this.lineChartLognComponent_child.loadCountriesByArray(countries);
    this.lineChartNewCases_child.loadCountriesByArray(countries);
    this.legend_child.loadCountriesGroupsByArray(countries);
    this.cardsPanelComponent_child.loadCountriesGroupsByArray(countries);
  }
}
