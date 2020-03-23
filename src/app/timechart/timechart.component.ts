import { Component, OnInit, Input } from '@angular/core';

import * as d3 from "d3";
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-timechart',
  templateUrl: './timechart.component.html',
  styleUrls: ['./timechart.component.css']
})
export class TimechartComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  constructor() { }

  ngOnInit() {
  }

}
