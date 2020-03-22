import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainLinechartComponent } from './main-linechart/main-linechart.component';
import { TimechartComponent } from './timechart/timechart.component';
import { CountrylistComponent } from './countrylist/countrylist.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MainLinechartComponent,
    TimechartComponent,
    CountrylistComponent
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
