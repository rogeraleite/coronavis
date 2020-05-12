import { Component, OnInit } from '@angular/core';
import { LinechartsParent } from '../linecharts-parent/linecharts-parent';

import * as $ from 'jquery';

@Component({
  selector: 'app-linechart-prediction',
  templateUrl: './linechart-prediction.component.html',
  styleUrls: ['./linechart-prediction.component.css']
})
export class LinechartPredictionComponent extends LinechartsParent {

  constructor() { 
    super();
  }

  setup(){
    this.divKey = ".linechart-prediction";
    this.initialTransform = this.dm.getInitialTransform();
    this.width = $(this.divKey).width()//*1.05;
    this.margin.right = 0;//- $(this.divKey).width()*0.05;
    this.height = ($(document).height()*this.dm.getGraphHeightProportion());
    console.log(this.height)
    this.scaleYType = "linear";
    this.yDimension = "pCases";  
    this.axis_y_label = "confirmed "+this.yDimension;
    this.axis_x_label = "date";
    this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
    this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
  }
}
