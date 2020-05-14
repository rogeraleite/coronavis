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
    this.scaleYType = "linear";
    this.yDimension = "pCases";  
    this.axis_y_label = "confirmed "+this.yDimension;
    this.axis_x_label = "date";
    this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
    this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
    this.initialTransform = this.dm.getInitialTransform();
  }
  
  changeFeature(feature){    
    if(feature == "deaths")  feature = "pDeaths"
    else if(feature == "cases")  feature = "pCases"
    this.yDimension = feature;
    this.updateAxisYLabels();
    this.refreshChart();
  }
  
}
