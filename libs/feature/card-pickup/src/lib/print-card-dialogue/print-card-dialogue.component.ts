import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CardPickupService, CardReplacementService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-print-card-dialogue',
  templateUrl: './print-card-dialogue.component.html',
  styleUrls: ['./print-card-dialogue.component.scss'],
})
export class PrintCardDialogueComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Output() showIssue = new EventEmitter();
  @Output() showPrint = new EventEmitter();

  @Input() cardsToPrint = [];
  @Input() userData?:any;
  @Input() direct:boolean=false;
  @Input()  reprintBool:boolean = false;
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
  REASONS = [
    { reasonId: 2, label: 'Card Lost' },
    { reasonId: 3, label: 'Card Malfunction' },
    { reasonId: 4, label: 'Faulty Card' },
    { reasonId: 5, label: 'Card Stolen' },
    { reasonId: 6, label: 'Wrong Information' },
  ];
  reprintForm = new FormGroup({
    reprintReason: new FormControl(null, Validators.required),
    description: new FormControl(null),
    
  });
  proxyForm = new FormGroup({
    proxyEnabled: new FormControl(false, Validators.required),
    proxyDescription: new FormControl(null),
    
  });
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
    console.log("userData>",this.userData)

  }
  printIds(){
    /*uncomment after api dev */
    this.cardsToPrint.forEach(user=>{
      this.userIds.push(user.id);
    })
    // this.userIds.push("107")//dummy
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
        printObj.nationality=fanId?.nationality;
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
  const printerData = JSON.parse(localStorage.getItem('Printer'));
  
  let submitDataArray =[];
  for(let cardPrintData of this.cardPrintDatailsArray){
    for(let item of this.userData){
      if(item?.id === cardPrintData?.fanIdNo){
        let submitData:any = {
          // Reason: 'No Reason',
          // description: 'Print Card',
          // reasonType:1,
          isPrintFromServiceCentre:true,
          refSerivceCenter_Code:JSON.parse(localStorage.getItem('Terminal')).code,
          isBulkPrint: false
        };
        printerData.printerType === 0 ? 
        submitData.printerId = printerData.printerId : 
        submitData.printerPoolId = printerData.printerId

        this.applicationId = item.applicationId
        submitData.ApplicationId = this.applicationId
        submitData.isReprint = this.reprintBool;
        submitData.isProxyCollection= this.proxyForm.get('proxyEnabled').value;
        submitData.proxyDetails= this.proxyForm.get('proxyDescription').value;
        if(!this.reprintBool) {
          submitData.Reason = 'No Reason'
          submitData.ReasonType = 1
          submitData.description= 'Initial Print'
        }
        else{
          this.REASONS.forEach(reason=>{
            if(this.reprintForm.get('reprintReason').value === reason.reasonId){
              submitData.Reason = reason.label
              submitData.ReasonType = reason.reasonId
              submitData.description= this.reprintForm.get('description').value
            }
          })
        } 
        submitDataArray.push(submitData)
      }
    }
  }
   let data: any = new Object();
   data.data = submitDataArray;
    this.cardReplacementService.CustomerCardPrinting(data).subscribe(response=>{
      if(response.status === 200){
        if(response.totalCount === 1 && this.direct){
          if(response.successList.length){
            this.showPrint.emit()
          }
          else{
            let reason = response.failedList[0].reason.message?
              response.failedList[0].reason?.message:
                response.failedList[0].reason
            this.showIssue.emit(reason || 'Something went wrong!');
          }
        }
        else{
          // if(response.successList.length){
            this.showPrint.emit(response)
          // }
          // else{
          //   this.showIssue.emit(response?.failedList[0]?.reason?.message || 'Something went wrong!');
          // }
        }
      }
      else {
        this.error_message = response.message || "Something went wrong!";
        this.showIssue.emit(this.error_message)
      }
  },
  err=>{
      this.error_message = err?.error?.message || "Something went wrong!";
      this.showIssue.emit(this.error_message)

  })

}

closeErrorModel(event){
  this.error_dialog_open = false;
}
closefunction(){
  !this.direct? this.showPrint.emit(true) : this.closeThis.emit('close')
}
closeCommonDialogue() {
  this.showCommonDialogue = false;
}

selectProxy(isChecked)
{
  console.log(isChecked.target.checked)
  if (isChecked.target.checked) {
    this.proxyForm.controls.proxyDescription?.setValidators([Validators.required]);
    this.proxyForm.controls.proxyDescription?.updateValueAndValidity(); 
   } else {
    this.proxyForm.controls.proxyDescription?.clearValidators();
    this.proxyForm.controls.proxyDescription?.updateValueAndValidity(); 
  }
}
}
