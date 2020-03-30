import { Component, OnInit, Input } from '@angular/core';

import * as d3 from "d3";
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-cards-panel',
  templateUrl: './cards-panel.component.html',
  styleUrls: ['./cards-panel.component.css']
})
export class CardsPanelComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  constructor() { }

  ngOnInit() {
  }

}
