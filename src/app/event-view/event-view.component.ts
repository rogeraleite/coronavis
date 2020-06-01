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
  public possible_event_notes: any;
  public selected_date: any;
  public selected_country: any;
  protected closeResult = '';
  public note = ""
  
  constructor(private modalService: NgbModal) { }

  ngOnInit() { 
    this.possible_event_notes = this.dm.getAllAvailableEventNoteTypeMeans();
  }

  updateEvent(){
    this.event_notes = this.getSelectedEventNotes();
    this.selected_date = this.dm.pipeDateObjToDateString(this.dm.getSelectedDate());
    this.selected_country = this.dm.getSelectedCountry();
  }

  updateCheckbox() {
    let checked:any = document.querySelector(".checkbox-checked");
    let unchecked:any = document.querySelector(".checkbox-unchecked");
    if(checked){
      checked.style.visibility = 'hidden';
      unchecked.style.visibility = 'visible';
      console.log("-------reset")
    }
  }

   submit(content, note){
     this.note = note;

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

  getSelectedEventNotes(){
    let selected = this.dm.getSelectedEventNotes();
    
    let result = [];
    
    //categorize existing events in selection
    this.possible_event_notes.forEach(element => {
      let filtered = selected.filter(d => element.mean == d.mean)
      if(filtered.length>0){
        result.push(filtered[0]);
      }
      else{
        result.push(element)
      }
    });
    return result
  }

  alternateCheckboxCheck(type){
    // let unchecked:any = document.querySelector(".checkbox-unchecked");
    // debugger;
    // if(unchecked.hasAttribute("checked")){
    //   unchecked.removeAttribute("checked");
    //   unchecked.setAttribute("unchecked","");  
    // }
    // else{
    //   unchecked.removeAttribute("unchecked");
    //   unchecked.setAttribute("checked","");  
    // }
    // debugger;

    let checked:any = document.querySelector("#"+type+".checkbox-checked");
    let unchecked:any = document.querySelector("#"+type+".checkbox-unchecked");
    
    console.log("--------------------")
    // console.log(checked)
    // console.log(unchecked)
    
    if(checked.style.visibility == ""){    
      console.log("checked.style.visibility == ''")
      checked.style.visibility = "hidden";
      unchecked.style.visibility = "visible";
    }

    if(checked.style.visibility == "hidden"){      
      console.log("checked.style.visibility == 'hidden'")
      checked.style.visibility = "visible"
      unchecked.style.visibility = "hidden"
    }
    else{   
      console.log("else")
      checked.style.visibility = "hidden"
      unchecked.style.visibility = "visible"
    }
    debugger;
    // console.log(checked)
    // console.log(unchecked)
  }

  selectCheckBox(type){
    this.timelineTypeSelectionOutput.emit(type);
    // this.alternateCheckboxCheck(type);
  }

  reset(){
    this.event_notes = null
    this.selected_date = null
    this.selected_country = null
  }

}
