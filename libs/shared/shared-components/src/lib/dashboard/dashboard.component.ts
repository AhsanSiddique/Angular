import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DashboardService,
  DashboardEvents,
  DashboardStatistics,
} from '@fan-id/api/server';
import { CoreService, Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { getFromLocalStorage } from '@fan-id/shared/utils/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IPrinter, PRINTER_STORAGE_KEY } from '../printer-setup/printer-setup.component';

@Component({
  selector: 'shared-fan-id-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class SharedDashboardComponent implements OnInit {
  @ViewChild(NgSelectComponent) ngSelectComponentOption: NgSelectComponent;
  @ViewChild(NgSelectComponent) ngSelectComponentValues: NgSelectComponent;
  @ViewChild(NgSelectComponent) ngSelectComponentValues1: NgSelectComponent;
  disableAdditionalDropDown: boolean;
  constructor(
    private dashboardService: DashboardService,
    private menuService: MenuService,
    private translateService: TranslateService,
    private coreService: CoreService,
    @Inject(FanIDConfig) private config: Environment
  ) {}
  filterStatisticForm = new FormGroup({
    columnName: new FormControl(),
    filterType: new FormControl(),
  });
  columns=[
    {
      id:1,
      name:this.translate('ApplicantDetails.ApplicationType')
    },
    {
      id:2,
      name:this.translate('ApplicantDetails.DocumentType')
    }
  ]
  appType=[
    {
      id:'QRC',
      name:this.translate('NewCustomer.QatarCitizens&Residents')
    },
    // {
    //   id:'GCC',
    //   name:this.translate('NewCustomer.GCCResidents')
    //  }
    //,
     {
       id:'Other',
       name:this.translate('NewCustomer.OtherInternationalResidents')
     }
  ]
  docType=[
    {
      id:1,
      name:this.translate('EditApplication.QID')
    },
    {
      id:3,
      name:this.translate('EditApplication.Passport')
    }
  ]
  public selectedItems:any;
  selectedValues: any;
  events: DashboardEvents[];
  statistics = {
    totalApplication: 0,
    totalNoOfApplications: 0,
    totalcardsIssues: 0,
    todaysCardPrinted:0,
    todaysCardCollected:0,
    total_Application_Printed:0,
    total_Collected_by_Fan:0,
    total_Home_Delivery:0,
    today_Home_Delivery:0,
    total_Ready_for_Collection:0,
    today_Ready_for_Collection:0

  } as DashboardStatistics;
  generalStatistics={
    totalApplication: 0,
    totalNoOfApplications: 0,
    totalcardsIssues: 0,
    todaysCardPrinted:0,
    todaysCardCollected:0,
    total_Application_Printed:0,
    total_Collected_by_Fan:0,
    total_Home_Delivery:0,
    today_Home_Delivery:0,
    total_Ready_for_Collection:0,
    today_Ready_for_Collection:0
  } as DashboardStatistics;
  userName = localStorage.getItem('userName');
  firstName =localStorage.getItem('firstName');
  organizationName = localStorage.getItem('organizationCode');
  accessGroup = localStorage.getItem('accessGroupName');
  accessName:string="";
  selectedEvent: DashboardEvents;
  isServiceCenter:boolean;
  printer: IPrinter;
  searchBoolean:boolean = false;
  docBoolean:boolean = false;
  appTypeBoolean:boolean = false;
  eventList = [];
  count={
    maxVoucher:0,
    usedVoucher:0,
    maxApp:0,
    usedApp:0,
    draftApp:0
  };
  terminal: any;
  fabState$: Observable<'open' | 'closed'>;
  
  ngOnInit(): void {
    this.eventList=[];
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    if(this.isServiceCenter){
     this.terminal = getFromLocalStorage({key: 'Terminal', parse: true}); 
     if(!this.terminal.isPrintingEnabled)
     {
      const localPrinter ={
        printerId: '',
        printerName: '',
        printerType: '',
        printerTypeName: ''
      }
      localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(localPrinter));

     }
    }
    else{
      if(this.accessGroup =="B2B_Super_User"){
        this.accessName = "Super Admin";
      }
      else if(this.accessGroup ==="B2B_Org_Admin")
      {
        this.accessName = "Organization Admin";
      }
      else if(this.accessGroup ==="B2B_Company_Rep"){
        this.accessName = "Organization Representative";
      }
      else if(this.accessGroup === "B2B_Super_User_Read_Only")
      {
        this.accessName = "Super Admin (Read Only Access)"
      }
      else if(this.accessGroup === "B2B_Org_Admin_Read_Only")
      {
        this.accessName = "Organization Admin (Read Only Access)"
      }
      else if(this.accessGroup === "B2B_Company_Rep_Read_Only")
      {
        this.accessName = "Organization Representative (Read Only Access)"
      }
      else{
        this.accessName = this.accessGroup;
      }

      this.fabState$ = this.getFabState();
    }
    this.menuService.removeEvent();
    this.dashboardService.getDashboardEvents().subscribe((response: any) => {
      if (response.status === 200) {
        this.events = response.dataList.sort((a,b) => (a.sortorder > b.sortorder) ? 1 : ((b.sortorder > a.sortorder) ? -1 : 0))
        this.events.forEach(element => {
          this.eventList.push(element.code);
        });
        // if(this.events.length ==1)
        // {

        //   this.readAllStatistics(this.events[0].code);
        //   this.setStatisticsCounter(this.events[0].code);
        // }else{
        //   this.readAllStatistics(null);
        //   this.setStatisticsCounter(null);
        // }

      }
      else this.events = [];
      if (this.events.length > 0) {
        this.events.forEach((obj) => {
          obj.imageUrl = this.dashboardService.getImage(obj.image);
        });
      }
    });
  }

  getFabState(): Observable<'open' | 'closed'> {
    const keyName = 'B2bShowWhatsNew';
    return this.dashboardService.getConfigurationType(keyName).pipe(
      catchError((err) => {
        console.log(err);
        return EMPTY;
      }),
      map((response) => {
        if (response?.value === 'true') {
          return 'open';
        }
        return 'closed';
      })
      
    );
  }

  onPrinterSelected(event: IPrinter) {
    this.printer = event;
    localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(this.printer));
  }
  readAllStatistics(event){
    // this.setStatisticsCounter(null)
    // const refOrganization_Id = localStorage.getItem('organizationId');
    if (
      this.filterStatisticForm.value.columnName != null &&
      this.filterStatisticForm.value.filterType != null
    ) {
      if(this.filterStatisticForm.get('columnName').value ===2){
        this.docBoolean = true
      }
      else if(this.filterStatisticForm.get('columnName').value ===1){
        this.appTypeBoolean = true;
      }
    }

    const statisticsFilter = {
    //  refOrganization_Id ,
      ...(event!==null?{refEvent_Code:event}:null),
      ...(this.docBoolean === true?{inAnyDocType:this.filterStatisticForm.get('filterType').value}:null),
      ...(this.appTypeBoolean === true?{inAnyApplicationType:this.filterStatisticForm.get('filterType').value}:null),
      ...(event===null?{inAnyEventList:this.eventList}:null)

    };
    console.log("statisticsFilter> ",statisticsFilter)
    const body = {
      filter: statisticsFilter,
      pageSize: 0,
      pageIndex: 0,
      countRequired: true,
    };
    this.docBoolean = false;
    this.appTypeBoolean = false;
    this.dashboardService.getDashboardStatistics(body,this.isServiceCenter).subscribe(
      (response: any) => {
        this.generalStatistics.totalApplication =
          response?.data?.todayApplicationCount;
        this.generalStatistics.totalNoOfApplications =
          response?.data?.totalApplicationCount;
        this.generalStatistics.totalcardsIssues = response?.data?.cardIssedCount;
        this.generalStatistics.todaysCardPrinted = response?.data?.today_Application_Printed;
        this.generalStatistics.todaysCardCollected =  response?.data?.today_Collected_by_Fan;
        this.generalStatistics.total_Application_Printed =  response?.data?.total_Application_Printed;
        this.generalStatistics.total_Collected_by_Fan =  response?.data?.total_Collected_by_Fan;
        this.generalStatistics.today_Home_Delivery =  response?.data?.today_Home_Delivery;
        this.generalStatistics.total_Home_Delivery =  response?.data?.total_Home_Delivery;
        this.generalStatistics.total_Ready_for_Collection= response?.data?.total_Ready_for_Collection;
        this.generalStatistics.today_Ready_for_Collection=response?.data?.today_Ready_for_Collection;
        if(!this.isServiceCenter)
        {
          this.count={
              maxVoucher:response?.data?.total_Vouchers_Allotted,
              usedVoucher:response?.data?.total_Vouchers_Generated,
              maxApp:response?.data?.maxApplicationCount,
              usedApp:response?.data?.submittedApplicationCount,
              draftApp:response?.data?.draftApplicationCount
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );

  }

  setStatisticsCounter(event) {
    const isServiceCenter = this.config.application === 'ServiceCenter';
    const refOrganization_Id = localStorage.getItem('organizationId');
    const refSerivceCenter_Code = this.menuService.getTerminalCode();
    if (
      this.filterStatisticForm.value.columnName != null &&
      this.filterStatisticForm.value.filterType != null
    ) {
      if(this.filterStatisticForm.get('columnName').value ===2){
        this.docBoolean = true
      }
      else if(this.filterStatisticForm.get('columnName').value ===1){
        this.appTypeBoolean = true;
      }
    }

    const statisticsFilter = {
      ...(isServiceCenter ? { refSerivceCenter_Code } :  (this.accessGroup.indexOf("B2B_Super_User"))?{ refOrganization_Id }:""),
      ...(event!==null?{refEvent_Code:event}:null),
      ...(this.docBoolean === true?{inAnyDocType:this.filterStatisticForm.get('filterType').value}:null),
      ...(this.appTypeBoolean === true?{inAnyApplicationType:this.filterStatisticForm.get('filterType').value}:null),
      ...(event===null?{inAnyEventList:this.eventList}:null)
    };
    const body = {
      filter: statisticsFilter,
      pageSize: 0,
      pageIndex: 0,
      countRequired: true,
    };
    this.docBoolean = false;
    this.appTypeBoolean = false;
    this.dashboardService.getDashboardStatistics(body,this.isServiceCenter).subscribe(
      (response: any) => {
        this.statistics.totalApplication =
          response?.data?.todayApplicationCount;
        this.statistics.totalNoOfApplications =
          response?.data?.totalApplicationCount;
        this.statistics.totalcardsIssues = response?.data?.cardIssedCount;
        this.statistics.todaysCardPrinted = response?.data?.today_Application_Printed;
        this.statistics.todaysCardCollected =  response?.data?.today_Collected_by_Fan;
        this.statistics.total_Application_Printed =  response?.data?.total_Application_Printed;
        this.statistics.total_Collected_by_Fan =  response?.data?.total_Collected_by_Fan;
        this.statistics.today_Home_Delivery =  response?.data?.today_Home_Delivery;
        this.statistics.total_Home_Delivery =  response?.data?.total_Home_Delivery;
        this.statistics.total_Ready_for_Collection= response?.data?.total_Ready_for_Collection;
        this.statistics.today_Ready_for_Collection=response?.data?.today_Ready_for_Collection;
        if(!this.isServiceCenter)
        {
          this.count={
              maxVoucher:response?.data?.total_Vouchers_Allotted,
              usedVoucher:response?.data?.total_Vouchers_Generated,
              maxApp:response?.data?.maxApplicationCount,
              usedApp:response?.data?.submittedApplicationCount,
              draftApp:response?.data?.draftApplicationCount
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  setEvent(obj) {
    this.selectedEvent = obj;
    this.menuService.setEvent(obj);
    if(this.isServiceCenter){
      this.menuService.setDisplayEvent(obj.name);
    }
    else{
      this.menuService.setDisplayEvent('Hayya');
    }
    this.searchBoolean = false;
    this.filterStatisticForm.reset();
    // this.setStatisticsCounter(this.selectedEvent?.code)
    if(!this.isServiceCenter)
      this.setStatisticsCounter(this.selectedEvent?.code)
    else{
      this.readAllStatistics(this.selectedEvent?.code);
      this.setStatisticsCounter(this.selectedEvent?.code);
    }

  }
  filterColumn(){

  }
  clearButton() {
    let result = false;
    if (
      this.filterStatisticForm.value.columnName != null ||
      this.filterStatisticForm.value.filterType != null
    ) {
      result = true;
    }
    return result;
  }
  clearFilter(){
    this.filterStatisticForm.reset();
    if(this.selectedEvent?.code != undefined && this.selectedEvent?.code !=null){
      if(!this.isServiceCenter)
        this.setStatisticsCounter(this.selectedEvent?.code)
      else{
        this.readAllStatistics(this.selectedEvent?.code);
        this.setStatisticsCounter(this.selectedEvent?.code);
      }
    }
    else{
      if(!this.isServiceCenter)
        this.setStatisticsCounter(null)
      else{
        this.readAllStatistics(null);
        this.setStatisticsCounter(null);
      }
    }
    // this.filterStatisticForm.controls.filterType.setValue(null);

  }
  searchdisable(){
    let result = true;
    if (
      this.filterStatisticForm.value.columnName != null &&
      this.filterStatisticForm.value.filterType != null
    ) {
      result = false;
    }
    return result;
  }

  SearchStatistics(){
    // alert("hi"+ this.selectedEvent?.code)
    // if(this.filterStatisticForm.controls.columnName.value === 1){

    // }
    this.searchBoolean = true;
    if(this.selectedEvent?.code != undefined && this.selectedEvent?.code !=null){
      if(!this.isServiceCenter)
        this.setStatisticsCounter(this.selectedEvent?.code)
      else{
        this.readAllStatistics(this.selectedEvent?.code);
        this.setStatisticsCounter(this.selectedEvent?.code);
      }
    }
    else{
      if(!this.isServiceCenter)
        this.setStatisticsCounter(null)
      else{
        this.readAllStatistics(null);
        this.setStatisticsCounter(null);
      }
    }
  }
  optionChange(event){
    console.log("optionChange event> ",event, this.filterStatisticForm.controls.filterType.value)
    // this.ngSelectComponentOption.handleClearClick();

  }
  columnChange(event){
    console.log("columnChange event> ",event);
    this.filterStatisticForm.controls.filterType.setValue(null)
    this.disableAdditionalDropDown=false;

    // this.ngSelectComponentValues.handleClearClick();
    // this.ngSelectComponentValues1.handleClearClick();


  }
  toggleCheckAll(event){
    console.log(">>>>>>>hdhdh>>>>>> ",event)
    if (event === true) {
      this.selectAllItems();
    }
    else if(event === 1) {

    }
    else {
      this.unselectAllItems();
    }
  }
  private selectAllItems() {
    if(this.filterStatisticForm.get('columnName').value ===2){
        this.filterStatisticForm.controls.filterType.setValue([1,3]);
    }
    else if(this.filterStatisticForm.get('columnName').value ===1){
      this.filterStatisticForm.controls.filterType.setValue(['QRC','GCC','Other']);
    }
  }

  private unselectAllItems() {
    this.filterStatisticForm.controls.filterType.setValue(null);
  }
  translate(key: string) {
    return this.translateService.instant(key);
  }

  public onChange(event: any): void {
    console.log("hi>> ",event)
  }
}
