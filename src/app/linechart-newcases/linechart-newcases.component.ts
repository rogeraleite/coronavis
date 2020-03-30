import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-linechart-newcases',
  templateUrl: './linechart-newcases.component.html',
  styleUrls: ['./linechart-newcases.component.css']
})
export class LinechartNewcasesComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  
  constructor() { }

  ngOnInit() {
  }

}
