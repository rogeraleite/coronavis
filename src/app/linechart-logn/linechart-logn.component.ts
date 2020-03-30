import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-linechart-logn',
  templateUrl: './linechart-logn.component.html',
  styleUrls: ['./linechart-logn.component.css']
})
export class LinechartLognComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  
  constructor() { }

  ngOnInit() {
  }

}
