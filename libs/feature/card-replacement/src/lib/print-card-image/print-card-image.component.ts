import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CardPickupService, CardReplacementService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-print-card-image',
  templateUrl: './print-card-image.component.html',
  styleUrls: ['./print-card-image.component.scss']
})
export class PrintCardImageComponent implements OnInit {

  @Output() closeThis = new EventEmitter();
  @Output() showIssue = new EventEmitter();
  @Output() Print = new EventEmitter();

  // @Input() cardsToPrint = [];
  @Input() userData?:any;
  cardPrintDetail: any ={};
  cardPrintDatailsArray:any = []
  userIds:any =[];
  index:number =0;
  applicationId:any;
  printSuccessArray=[];
  error_message = '';
  error_dialog_open = false;
  event:string='';
  showCommonDialogue:boolean = false;
  common: {
    header: string;
    body: string;
    fanId:string;
  };
  constructor(private cardPickupService: CardPickupService,
    private cardReplacementService:CardReplacementService) {}


  ngOnInit(): void {
    this.common = {
      header: '',
      body: '',
      fanId:''
    };
    this.event=localStorage.getItem('eventCode');

    this.printIds()

  }
  printIds(){
    this.userIds.push(this.userData.fanIdNo)//dummy
    this.cardPickupService.getCardDetailsByFanId(this.userIds).subscribe(response=>{
      for(const fanId of response.dataList){
        const printObj:any = new Object()
        if(fanId.profilePic == null || fanId.profilePic == ''){
          printObj.profileImg = 'https://previews.123rf.com/images/metelsky/metelsky1809/metelsky180900233/109815470-man-avatar-profile-male-face-icon-vector-illustration-.jpg'
        }
        else{
          printObj.profileImg = this.cardPickupService.composeUserImageUrl(fanId?.profilePic, false)
        }
        printObj.name = fanId?.firstName+ " " +fanId?.lastName;
        printObj.QID = fanId?.documentIdNo;
        printObj.valid = fanId?.validThru;
        printObj.barcode = fanId?.barCode;
        printObj.fanIdNo = fanId?.fanIdNo;
        printObj.gateNumber=fanId?.gateNumber;
        printObj.blockNumber=fanId?.blockNumber;
        printObj.rowNumber=fanId?.rowNumber;
        printObj.seatNumber=fanId?.seatNumber;
        printObj.firstName = fanId?.firstName;
        printObj.lastName = fanId?.lastName;
        printObj.nationalityCode=fanId?.nationalityCode;
        this.cardPrintDatailsArray.push(printObj);
      }
        this.cardPrintDetail = this.cardPrintDatailsArray[0];
    },err=>{
      console.log(err)
    })
  }

   nextItem() {
     if(this.index < this.cardPrintDatailsArray.length-1)
      this.index = this.index + 1;
    this.cardPrintDetail = this.cardPrintDatailsArray[this.index]
    return this.cardPrintDetail; // give us back the item of where we are now
}
 prevItem() {
    if (this.index > 0) { // i would become 0
      // this.index = this.cardPrintDatailsArray.length; // so put it at the other end of the array
      this.index = this.index - 1; // decrease by one
    }
    this.cardPrintDetail = this.cardPrintDatailsArray[this.index]
    return this.cardPrintDetail; // give us back the item of where we are now
}
printCardFunction(fanId){
  for(let item of this.userData)
  {
    if(item.id === fanId){
      this.applicationId = item
    }
  }
  let submitData = {
    ApplicationId:this.applicationId.applicationId,
    Reason: 'No Reason',
    description: 'Print Card',
    reasonType:1
  };
    this.cardReplacementService.CustomerCardPrinting(submitData).subscribe(response=>{
      if(response.printingStatus === 200){
        this.common.header = 'CardPickup.PrintCardHeader';
        this.common.body = 'CardPickup.PrintCardBody';
        this.common.fanId =this.applicationId.id;
        this.showCommonDialogue = true;
        this.printSuccessArray.push(this.applicationId.id)
      }
      else {
        this.error_message = response.message || "Something went wrong!";
        this.error_dialog_open = true
      }
  },
  err=>{
      this.error_message = err?.error?.message || "Something went wrong!";
      this.error_dialog_open = true
  })

}

closeErrorModel(event){
  this.error_dialog_open = false;
}
closefunction(){
  this.closeThis.emit()
}
closeCommonDialogue() {
  this.showCommonDialogue = false;
}

}
