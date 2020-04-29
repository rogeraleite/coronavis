import { Component, OnInit, Input} from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

import * as $ from 'jquery';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-total-overview',
  templateUrl: './total-overview.component.html',
  styleUrls: ['./total-overview.component.css']
})
export class TotalOverviewComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  
  protected divKey;
  protected svg: any;
  protected gCanvas: any;
  protected gCards: any;

  protected margin = 15;  
  protected width;
  protected cards_width;
  protected height;
  protected cards_height;  
  
  protected total_data;

  //displayed
  public date;
  public total;
  public deaths;
  public recovered;
  public tests;

  constructor() { }

  ngOnInit() {
    this.divKey = ".total-overview"; 
    this.calculateOverallDimensions();
    this.getData();
    this.calculateDisplayedVariables();
  }
  
  
  
  calculateOverallDimensions() {
    this.width = $(this.divKey).width();
    this.height = $(document).height()*1/4;
  }
  getData() {
    this.total_data = this.dm.getCurrentDataByCountryList(["Total"])[0];
  }
  
  calculateDisplayedVariables() {
    this.date = this.dm.pipeDateObjToDateString(this.dm.getLastDate("US"));
    this.total = this.dm.pipeNumberToString(this.total_data.confirmed);
    this.deaths = this.dm.pipeNumberToString(this.total_data.deaths);
    this.recovered = this.dm.pipeNumberToString(this.total_data.recovered);
    this.tests = this.dm.pipeNumberToString(this.total_data.tests);
  }


  

  

  
  

}
