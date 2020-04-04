import { Component, ViewChild } from '@angular/core';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { DataManagerComponent } from './_datamanager/datamanager.component'
import { TotalOverviewComponent } from './total-overview/total-overview.component'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;

  @ViewChild(LinechartNComponent) lineChartNComponent_child;
  @ViewChild(LinechartNewcasesComponent) lineChartNewCases_child;  
  @ViewChild(CardsPanelComponent) cardsPanelComponent_child;
  @ViewChild(TotalOverviewComponent) totalOverviewComponent_child;

  constructor() { 
    this._dm = new DataManagerComponent(); 
  }

  async receiveCountriesSelection($event){
    let countries = $event;
    console.log(countries)
    this.lineChartNComponent_child.loadCountriesByArray(countries);
    this.lineChartNewCases_child.loadCountriesByArray(countries);
    this.cardsPanelComponent_child.loadCountriesGroupsByArray(countries);
  }
}
