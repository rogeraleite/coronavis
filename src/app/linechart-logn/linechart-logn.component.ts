import { Component} from '@angular/core';
import { LinechartsParent } from '../linecharts-parent/linecharts-parent';

import * as d3 from "d3";
import * as $ from 'jquery';

@Component({
  selector: 'app-linechart-logn',
  templateUrl: './linechart-logn.component.html',
  styleUrls: ['./linechart-logn.component.css']
})
export class LinechartLognComponent extends LinechartsParent {
  
  constructor() { 
    super();
  }

  setup(){
    this.divKey = ".linechart-logn";    
    this.currentTransform = d3.zoomIdentity.translate(80, 10).scale(0.8);
    this.width = $(this.divKey).width()
    this.height = $(document).height()*1.5/5;
    this.axis_y_label = "log(confirmed cases)";
    this.axis_x_label = "Date";
    this.scaleYType = "log";
    this.getInitialSelection();
  }


}
