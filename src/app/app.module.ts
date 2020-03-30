import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartLognComponent } from './linechart-logn/linechart-logn.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { CountrylistComponent } from './countrylist/countrylist.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataManagerComponent } from './_datamanager/datamanager.component';


@NgModule({
  declarations: [
    AppComponent,
    CountrylistComponent,
    DataManagerComponent,
    LinechartNComponent,
    LinechartLognComponent,
    LinechartNewcasesComponent,
    CardsPanelComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
