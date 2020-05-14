import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'information-button',
  templateUrl: './information-button.component.html',
  styleUrls: ['./information-button.component.css']
})
export class InformationButtonComponent implements OnInit {

  @Input() key: string;
  @Output() viewFocusOutput = new EventEmitter<any>();

  protected closeResult = '';
  protected title:string;
  public text = "+"

  constructor(private modalService: NgbModal) { }

  ngOnInit() {
    this.updateContentByKey()
  }

  updateContentByKey() {
    this.title = this.getTitleByKey();
  }

  getTitleByKey() {
    let result = "error"
    switch(this.key){
      case "linechart-n":{
        result = "Cases/Deaths Linechart";
        break;
      }
      case "linechart-newcases":{
        result = "Last Week Linechart";
        break;
      }
    }
    return result;
  }

  submit(content){   
    this.switchText();
    this.viewFocusOutput.emit(this.key);
  }
  switchText(){
    if(this.text=="+") this.text = "-"
    else this.text = "+"
  }

  // submit(content){    
  //   console.log(this.key)
  //   this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;
  //   }, (reason) => {
  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }

  // getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }

}
