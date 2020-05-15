import { Component, OnInit, Input } from '@angular/core';
import { DataManagerComponent } from '../_datamanager/datamanager.component';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html',
  styleUrls: ['./event-view.component.css']
})
export class EventViewComponent implements OnInit {

  @Input() dm: DataManagerComponent;

  public event_notes: any;
  public selected_date: any;
  
  constructor() { }

  ngOnInit() {
  }

  updateEvent(){
    this.event_notes = this.dm.getSelectedEventNotes();
    this.selected_date = this.dm.pipeDateObjToDateString(this.dm.getSelectedDate());
    console.log(this.event_notes)
  }

}
