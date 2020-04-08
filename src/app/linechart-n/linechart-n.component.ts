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
    this.initialTransform = d3.zoomIdentity.translate(25, 10).scale(0.88);
    this.width = $(this.divKey).width()
    this.height = ($(document).height()*3/5) + this.margin.top/2;    
    this.axis_y_label = "confirmed cases";
    this.axis_x_label = "date";
    this.scaleYType = "linear";
    this.data = this.dm.getDataByCountryList(null);
  }


  
}
