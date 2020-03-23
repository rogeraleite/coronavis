import { Component } from '@angular/core';
import { DataManagerComponent } from './_datamanager/datamanager.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'coronavis';
  public _dm: DataManagerComponent;

  constructor() { 
    this._dm = new DataManagerComponent(); 
  }
}
