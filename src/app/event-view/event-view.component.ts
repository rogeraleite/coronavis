import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import * as $ from 'jquery';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {

  @Input() dm: DataManagerComponent;
  @Output() timelineTypeSelectionOutput = new EventEmitter<any>();

  public event_notes: any;
  public selected_date: any;
  public selected_country: any;
  protected closeResult = '';
  
  constructor(private modalService: NgbModal) { }

  ngOnInit() { }

  updateEvent(){
    this.event_notes = this.dm.getSelectedEventNotes();
    this.selected_date = this.dm.pipeDateObjToDateString(this.dm.getSelectedDate());
    this.selected_country = this.dm.getSelectedCountry();
  }

   submit(content){    
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  selectCheckBox(type){
    this.timelineTypeSelectionOutput.emit(type);
  }

  reset(){
    this.event_notes = null
    this.selected_date = null
    this.selected_country = null
  }

}
