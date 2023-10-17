import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccomadationService } from '@fan-id/api/server';
import { convertNgbDateToISO } from '@fan-id/shared/utils/date';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'fan-id-accomadation-dashboard',
  templateUrl: './accomadation-dashboard.component.html',
  styleUrls: ['./accomadation-dashboard.component.scss']
})
export class AccomadationDashboardComponent implements OnInit {
  @Input() event:any;
  eventCode:any;
  statisticsData:any ={};
  statBody:any;
  filterBoolean:boolean = false;
  show_export_modal:boolean = false;
  filteredStatsBoolean: boolean = false;
  dateToday!: NgbDateStruct;
  dashStatFilterForm = new FormGroup({
    dateBegin: new FormControl(null, Validators.required),
    dateEnd: new FormControl(null, Validators.required),
  })
  constructor(private accomadationService:AccomadationService) {
    const today = new Date();
      this.dateToday = {
        year: today.getFullYear(),
        month: today.getMonth()+1,
        day: today.getDate(),
      };
   }

  ngOnInit(): void {
    this.eventCode = localStorage.getItem('eventCode');
    this.getFilter();
  }

  getFilter(){
    this.dashStatFilterForm.reset();
    this.statBody={
      inAnyEventList:[
        this.eventCode
      ]
    }
    this.getStatistics(false);
  }

  getStatistics(key:boolean){
    this.accomadationService.accommodationStatistics(this.statBody).subscribe(response=>{
      this.statisticsData= response.data;
      this.filteredStatsBoolean = key;
    })
  }
  filterStat(){
    this.filterBoolean = true;
  }

  getDatedStat(){
    this.filterBoolean = false;
    const startDate = convertNgbDateToISO(this.dashStatFilterForm?.get("dateBegin")?.value as unknown as NgbDateStruct);
    const endDate = convertNgbDateToISO(this.dashStatFilterForm?.get("dateEnd")?.value as unknown as NgbDateStruct);
    this.statBody={
      inAnyEventList:[
        this.eventCode
      ],
      startDate,
      endDate
    }
    this.getStatistics(true)
  }

  showExportModal(){
    this.show_export_modal = true;
  }
  advancedFilterClick(){
    //tableComponent purpose
  }
  clearFilter(){
    //tableComponent purpose
  }
  clearButton() {
    let result = false;
    if (
      (this.dashStatFilterForm.value.dateBegin != null && this.dashStatFilterForm.value.dateBegin != '')
      || this.dashStatFilterForm.value.dateEnd != null && this.dashStatFilterForm.value.dateEnd != '') {
      result = true;
    }
    return result;
  }

}
