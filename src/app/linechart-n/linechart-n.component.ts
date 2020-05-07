import { Component } from '@angular/core';
import { LinechartsParent } from '../linecharts-parent/linecharts-parent';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-linechart-n',
  templateUrl: './linechart-n.component.html',
  styleUrls: ['./linechart-n.component.css']
})
export class LinechartNComponent extends LinechartsParent {  
 
  constructor() { 
    super();
  }
  
  setup(){
    this.divKey = ".linechart-n";
    this.initialTransform = this.dm.getInitialTransform();
    this.width = $(this.divKey).width()*1.05;
    this.margin.right = - $(this.divKey).width()*0.05;
    this.height = ($(document).height()*8/15) + this.margin.top/2;  
    this.scaleYType = "linear";
    this.yDimension = "cases";  
    this.axis_y_label = "confirmed "+this.yDimension;
    this.axis_x_label = "date";
    this.current_curve_data = this.dm.getCurrentDataByCountryList(null);
    this.prediction_curve_data = this.dm.getPredictionDataByCountryList(null);
  }


  
}
