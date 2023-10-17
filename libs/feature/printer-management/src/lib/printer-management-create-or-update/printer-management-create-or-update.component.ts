import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrinterInsert, PrinterManagementService, AuthService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-printer-management-create-or-update',
  templateUrl: './printer-management-create-or-update.component.html',
  styleUrls: ['./printer-management-create-or-update.component.scss']
})
export class PrinterManagementCreateOrUpdateComponent implements OnInit {
  inputData:any;
  dataList:any[]= [];
  updatePrinterForm = this.fb.group({
    servicecentre: [null,[Validators.required]],
    printer: [null,[Validators.required]],
    pType:["1",[Validators.required]],
    macaddress:[null,[Validators.required, Validators.minLength(12), Validators.maxLength(12)]]
  });
  printerData:any;
  printerList =[];
  servicecentreList = [];
  show_confirmation_modal = false;
  show_cancel_modal = false;
  createMode = true;
  title ='Create';
  submitName ='Submit';
  terminalList: any[] = [];
  printerDropdownLabel = '';
  printerOrPrinterPoolList:any[]=[];
  insertSuccessBoolean = false;
  insertFailedBoolean = false;
  updateSuccessBoolean = false;
  updateFailedBoolean = false;
  failedMessage = '';
  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pms:PrinterManagementService) { }

  ngOnInit(): void {
    this.terminalLoad();
    this.inputData = parseInt(this.route.snapshot.queryParamMap.get('id') as string);
    console.log(this.route.snapshot.queryParamMap.get('id'))
    if(this.route.snapshot.queryParamMap.get('id') !== null) {
      this.createMode = false;
      this.title = 'Update';
      this.pms.getConfigurationData(this.inputData).subscribe(data=>{
        this.printerData = data?.data ?? {};
        this.updatePrinterForm.patchValue({
          servicecentre: this.printerData.refSerivceCenter_Code,
          macaddress: this.printerData.macAddress,
          printer: +(this.printerData.printerId ?? this.printerData.printerPoolId),
          pType: this.printerData.printerType ? '2' : '1'
        })
        this.printerTypeSelection(+this.updatePrinterForm.controls.pType.value, false);
      })
    } else {
      this.getPrinterListPoolList();
    }
  }
  showConfirmModal(){
    this.show_confirmation_modal = true;
  }
  cancel(check = true){
    this.show_cancel_modal = true;
  }
  
  terminalLoad(){
      const payload = {};
      this.authService.getTerminalList(payload).subscribe((response) => {
        if (response.resultCode === 1) {
          this.terminalList = response.dataList.filter(
            (x) => x.isEnabled === true
          );
        } else {
          this.terminalList = [];
        }
      });
  }

  printerTypeSelection(value:number, reset = true){
    this.printerDropdownLabel = value===1?'':'Pool';
    reset && this.updatePrinterForm.get('printer')?.reset();
    this.getPrinterListPoolList(value);
  }

  getPrinterListPoolList(value=1){
    this.printerOrPrinterPoolList = [];
    if(value === 1){
      this.pms.getPrinterList().subscribe(list=>{
        this.printerOrPrinterPoolList = list?.dataList ?? [];
      },
      err=>{
        console.log(err)
      })
    }
    else{
      this.pms.getPrinterPoolList().subscribe(list=>{
        this.printerOrPrinterPoolList = list?.dataList ?? []
      },err=>{
        console.log(err)
      })
    }
  }

  ConfirmProceed(){
    this.show_confirmation_modal = false;
    this.createMode? this.Insert() : this.Update()
  }
  Insert(){
    
    const body:PrinterInsert ={
      macAddress: this.updatePrinterForm.controls.macaddress.value,
      refSerivceCenter_Code:this.updatePrinterForm.controls.servicecentre.value
    }
    if(this.updatePrinterForm.controls.pType?.value === "1"){
      body.printerType = 0
      body.printerId = this.updatePrinterForm.controls.printer.value
    }
    else{
      body.printerType = 1
      body.printerPoolId = this.updatePrinterForm.controls.printer.value
    }
    console.log(body)
    this.pms.insertConfiguration(body).subscribe(response=>{
      this.insertSuccessBoolean = true;
    },
    err=>{
      this.failedMessage = err?.error?.message || 'Something went wrong!'
      this.insertFailedBoolean = true;
    })
  }
  Update(){
    const body:PrinterInsert ={
      macAddress: this.updatePrinterForm.controls.macaddress.value,
      refSerivceCenter_Code:this.updatePrinterForm.controls.servicecentre.value,
      id:this.printerData.id,
      system_RowVersion:this.printerData.system_RowVersion
    }
    if(this.updatePrinterForm.controls.pType?.value === "1"){
      body.printerType = 0
      body.printerId = this.updatePrinterForm.controls.printer.value
    }
    else{
      body.printerType = 1
      body.printerPoolId = this.updatePrinterForm.controls.printer.value
    }
    console.log(body)
    this.pms.updateConfiguration(body).subscribe(response=>{
      this.updateSuccessBoolean = true;
    },
    err=>{
      this.failedMessage = err?.error?.message || 'Something went wrong!'
      this.updateFailedBoolean = true;
    })
  }

  closeInsertOrUpdate(){
    this.updateSuccessBoolean =  false;
    this.insertSuccessBoolean = false;
    this.router.navigate(['/main/printer-management/list']);
  }
  closeFailed(){
    this.updateFailedBoolean = false;
    this.insertFailedBoolean = false;
    this.failedMessage = '';
    this.router.navigate(['/main/printer-management/list']);
  }
  cancelProceed(){
    this.router.navigate(['/main/printer-management/list']);
  }

}
