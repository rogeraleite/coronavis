import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LinechartNComponent } from './linechart-n/linechart-n.component';
import { LinechartLognComponent } from './linechart-logn/linechart-logn.component';
import { LinechartNewcasesComponent } from './linechart-newcases/linechart-newcases.component';
import { CardsPanelComponent } from './cards-panel/cards-panel.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DataManagerComponent } from './_datamanager/datamanager.component';
import { TotalOverviewComponent } from './total-overview/total-overview.component'

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InformationButtonComponent } from './information-button/information-button.component';
import { TimelineComponent } from './timeline/timeline.component';
import { LinechartTestsComponent } from './linechart-tests/linechart-tests.component';
import { LinechartPredictionComponent } from './linechart-prediction/linechart-prediction.component';
import { EventViewComponent } from './event-view/event-view.component';
import { AddEventComponent } from './add-event/add-event.component';

@NgModule({
  declarations: [
    AppComponent,
    DataManagerComponent,
    LinechartNComponent,
    LinechartLognComponent,
    LinechartNewcasesComponent,
    CardsPanelComponent,
    TotalOverviewComponent,
    InformationButtonComponent,
    TimelineComponent,
    LinechartTestsComponent,
    LinechartPredictionComponent,
    EventViewComponent,
    AddEventComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
