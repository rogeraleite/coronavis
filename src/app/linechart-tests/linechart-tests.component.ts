import { Component, OnInit } from '@angular/core';
import { LinechartsParent } from '../linecharts-parent/linecharts-parent';

import * as $ from 'jquery';

@Component({
  selector: 'app-linechart-tests',
  templateUrl: './linechart-tests.component.html',
  styleUrls: ['./linechart-tests.component.css']
})
export class LinechartTestsComponent extends LinechartsParent {

  constructor() { 
    super();
  }

  setup(){
    this.divKey = ".linechart-tests";
    this.scaleYType = "linear";
    this.yDimension = "tests";  
    this.axis_y_label = "confirmed "+this.yDimension;
    this.axis_x_label = "date";
    this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
    this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
    this.initialTransform = this.dm.getInitialTransform();
  }

}
