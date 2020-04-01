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
  
  ngOnInit() {   
    this.divKey = ".linechart-n";
    this.initialTransform = d3.zoomIdentity.translate(25, 10).scale(0.88);
    this.width = $(this.divKey).width()
    this.height = ($(document).height()*2/3) + this.margin.top/2;
    this.data = this.dm.getDataByCountryList(null);
    this.createChart()
  }
  
}
