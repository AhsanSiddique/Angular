import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { ApplicantService, TournamentType } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-application-details',
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent
  extends ApplicantDataInput
  implements OnInit {
showRefreshEntryVisaStatus: any;
  entryVisaStatus: any;
  entryFlag: any;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private applicantService: ApplicantService
  ) {
    super();
  }
  @Output() openCard = new EventEmitter();

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  isServiceCenter = false;
  eventTournamentType: TournamentType = 2;
  entryPermitStatus$ = of('Pending');
  SACSstatus$: Observable<string>;
  showRefreshBorderStatusModal = false;
  emigration_Status: string;

  ngOnInit() {
    this.dtOptions = {
      paging:false,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,
      //************** */
      serverSide: false,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
    };
    this.entryVisaStatus = this.applicant_data?.visaStatus_Name;
    this.entryFlag = this.applicant_data?.visaUsageFlag;
    this.eventTournamentType = parseInt(localStorage.getItem('eventType')) as TournamentType;
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.entryPermitStatus$ = 
    this.applicant_data?.document_type === 'QID' ? of('N/A') : this.getEntryPermitStatus();
    this.emigration_Status = this.applicant_data?.emigration_Status;
    if (this.isServiceCenter) {
      this.SACSstatus$ =
        this.applicant_data.fanid_category_code !== 'NMTH'
          ? this.getSACSStatus()
          : of('Not Applicable');
    }
  }

  isCardPrinted(cardStatus: number) {
    const card_printed_status = [2,3,4,5,10];
    return card_printed_status.includes(cardStatus);
  }

  getEntryPermitStatus() {
    const body = {
      fanIdNo: this.applicant_data?.fanid_number
    }
    return this.applicantService.getEntryPermitStatus(body).pipe(
      catchError(error => {
        console.log(error);
        return EMPTY;
      }),
      map(response => {
        if (!response) return 'N/A';
        return response.data ? 'Sent' : 'Pending';
      })
    )
  }

  getSACSStatus(): Observable<string> {
    const body = {
      fanIdNo: this.applicant_data?.fanid_number
    }
    return this.applicantService.getSACSStatus(body).pipe(
      catchError(error => {
        console.log(error);
        return EMPTY;
      }),
      map(response => {
        return response?.data?.system_CreatedOn;
      })
    )
  }

  closeRefreshBorderStatusModal(event: 'yes' | 'no') {
    this.showRefreshBorderStatusModal = false;
    if (event === 'yes') {
      this.refreshBorderStatus();
    }
  }

  refreshBorderStatus() {
    this.applicantService.getCustomerBorderEntryStatus(this.applicant_data?.fanid_number)
      .subscribe({
        next: response => {
          this.emigration_Status = response?.data?.emigration_Status;
        },
        error: error => {
          console.log(error);
          alert('Sync failed. Please try again later.');
        }
      })
  }

  closeRefreshEntryStatusModal(event: 'yes' | 'no') {
    this.showRefreshEntryVisaStatus = false;
    if (event === 'yes') {
      this.refreshEntryFlagStatus();
    }
  }
  
  refreshEntryFlagStatus() {
    const payload = {
      "fanIdNo": this.applicant_data?.fanid_number
    }
    this.applicantService.getEntryFlagStatus(payload)
      .subscribe({
        next: response => {
          this.entryVisaStatus = response?.data?.visaStatus_Name;
          this.entryFlag = response?.data?.visaUsageFlag;
        },
        error: error => {
          console.log(error);
          alert('Sync failed. Please try again later.');
        }
      })
  }
  getVisaFlag(obj:string)
  {
    if(obj!="" && obj!= null)
    {
      const visaNum = Number(obj);
      if(visaNum == 1 || visaNum ==2)
      return 'Valid';
      else
      return 'Invalid'
    }
    return ' ';
  }
}