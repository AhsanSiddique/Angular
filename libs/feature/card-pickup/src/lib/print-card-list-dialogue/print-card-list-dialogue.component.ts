import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { CardPickupService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-print-card-list-dialogue',
  templateUrl: './print-card-list-dialogue.component.html',
  styleUrls: ['./print-card-list-dialogue.component.scss'],
})
export class PrintCardListDialogueComponent implements OnInit {
  @ViewChildren("checkboxes")
  checkboxes!: QueryList<ElementRef>;
  @Output() closeThis = new EventEmitter();
  @Output() showPrint = new EventEmitter();
  @Output() showIssue = new EventEmitter();
  @Input() Id = 0;
  cardPrintList: any =[];
  addtoPrintList: Array<any> = [];
  showPrintCardDialog: boolean;
  showPrintCard: any[];
  printIdFanId =[];
  showCommonDialog: boolean;
  common: {
    header: string;
    body: string;
  };
  usersDataArray:Array<any> = [];
  REASONS = [
    { reasonId: 2, label: 'Lost/Stolen' },
    { reasonId: 3, label: 'Card Malfunctioning' },
    // { reasonId: 6, label: 'Update Info' },
  ];
  constructor(private cardPickupService: CardPickupService) {}

  ngOnInit(): void {
    this.common = {
      header: '',
      body: '',
    };
    const filterData = {fanIdNo: this.Id}
    let filter: any = {};
    filter.filter = filterData
    this.cardPickupService.getCardPrintList(filter).subscribe((response) => {
      for(let dependent of response?.dataList){
        if(dependent?.applicationStatus === 2 && dependent.cardStatus === 1){
          const dependentObj:any = new Object();
          dependentObj.id = dependent?.fanIdNo;
          dependentObj.applicationId = dependent?.id;
          dependentObj.firstName =  dependent?.firstName;
          dependentObj.lastName =  dependent?.lastName;
          dependentObj.QID =  dependent?.documentIdNo;
          if(dependent?.isChildApplication === false){
            dependentObj.CardHolderType =  'Primary';
          }
          else {
            dependentObj.CardHolderType =  'Dependent';
          }
          dependentObj.applicationStatus_Name = dependent?.applicationStatus_Name; 
          dependentObj.applicationStatus = dependent?.applicationStatus; 
          dependentObj.cardStatus = dependent?.cardStatus;//added 05/08/2022
          dependentObj.selectedReprintReason = 0;
          this.cardPrintList.push(dependentObj)
        }
      }
    },
    err=>{
      console.log(err)
    });
  }

  addtoPrint(values: any, data: any) {
    if (values.currentTarget.checked) {
      // if(this.cardPrintList[])
        this.addtoPrintList.push(data.id);
        this.usersDataArray.push(data)
    } else {
      this.addtoPrintList = this.addtoPrintList.filter((item) => item != data.id);
      this.usersDataArray = this.usersDataArray.filter((item) => item.id != data.id);

    }
  }

  checkAll(args: any) {

    const checked = args.target.checked;
    this.checkboxes.forEach((element, i) => {
      console.log("i> ",i)
      element.nativeElement.checked = checked;
      checked && this.usersDataArray.push(this.cardPrintList[i]);
      checked && this.addtoPrintList.push(this.cardPrintList[i].id);
    console.log("this.usersDataArray",this.usersDataArray)

    })


    if(!checked){
      this.usersDataArray=[] ;
      this.addtoPrintList =[];
    }
  }


  showPrintDialogue() {
    this.showPrintCard = this.cardPrintList.filter(
      (obj) => this.addtoPrintList.indexOf(obj.id) >= 0
    );
    this.showPrintCardDialog = true;
  }

  closePrintCardDialogue() {
    this.showPrintCardDialog = false;
  
  }

  showPrintedInitiateDialog(event) {
    this.closePrintCardDialogue();
    event === true? this.closeThis.emit() : this.showPrint.emit(event);
  }

  showIssueInitiateDialog(event) {
    this.closePrintCardDialogue();
    this.showIssue.emit(event);
  }
  closeCommonDialog() {
    this.showCommonDialog = false;
  }

  disableProceed(){
    let disableProceed = false;
    if(this.usersDataArray.length <= 0){
      disableProceed = true;
    }
    else{
      this.usersDataArray.forEach(item=>{
        if(item.cardStatus ===2 && item.selectedReprintReason === 0){
          disableProceed = true;
        }
      })
    }
    return disableProceed;
  }

  ReasonSelection(event,index,id){
    let cardPrintListindex = this.cardPrintList.findIndex(x => x.id ===id);
    let userDataIndex = this.usersDataArray.findIndex(x => x.id === id)

    console.log(event, index, cardPrintListindex);


    if(index === cardPrintListindex){
      this.cardPrintList[cardPrintListindex].selectedReprintReason = event;
      this.usersDataArray[userDataIndex].selectedReprintReason = event;
    }
  }
}
