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

  ngOnInit() {    
    this.setup();
    this.createChart()
  }
  setup(){
    this.divKey = ".linechart-logn";    
    this.initialTransform = d3.zoomIdentity.translate(80, 10).scale(0.8);
    this.width = $(this.divKey).width()
    this.height = $(document).height()*1/3;
    this.axis_y_legend = "Log(Confirmed Cases)";
    this.axis_x_legend = "Date";
    this.getInitialSelection();
  }

  setXYScales(){    
    this.scale_x = d3.scaleTime().range([0, this.width]);
    this.scale_y = d3.scaleLog().range([this.height, 0]);
  }

  drawAxisY(){
      this.axis_y = d3.axisRight(this.scale_y)
                      .ticks(4,'.02f')
                      .tickFormat((d)=>{                         
                        if(d>=0) return d/1000 + "k";   
                      })
                      .tickSize(this.width)
                      .tickPadding(8 - this.width)
      this.gAxis_y = this.svg.append("g")
                                .attr("class", "axis axis-y")                              
                                .call(this.axis_y);         
  }
}
