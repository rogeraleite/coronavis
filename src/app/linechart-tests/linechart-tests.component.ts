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
    this.initialTransform = this.dm.getInitialTransform();
    this.width = $(this.divKey).width()//*1.05;
    this.margin.right = 0;//- $(this.divKey).width()*0.05;
    this.height = ($(document).height()*this.dm.getGraphHeightProportion());
    this.scaleYType = "linear";
    this.yDimension = "tests";  
    this.axis_y_label = "confirmed "+this.yDimension;
    this.axis_x_label = "date";
    this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
    this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
  }

}
