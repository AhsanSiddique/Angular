import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicantDetailResolved, ApplicantService, CardReplacementService } from '@fan-id/api/server';
import { DateFormatPipe, Environment, FanIDConfig, ScrollService } from '@fan-id/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-bulk-group-application-details',
  templateUrl: './bulk-group-application-details.component.html',
  styleUrls: ['./bulk-group-application-details.component.scss'],
  providers: [DateFormatPipe],
})
export class BulkGroupApplicationDetailsComponent implements OnInit {

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicantService: ApplicantService,
    private dateFormatPipe: DateFormatPipe,
    private cardReplacementService: CardReplacementService,
    private scrollService: ScrollService,
    private spinner: NgxSpinnerService
  ) {}

  isServiceCenter = false;
  applicant_data: any;
  applicant_error: string;

  card_details_open = false;
  card_details_error: string | null;

  confirm_submit_open = false;
  show_cancel_modal = false;
  submitData ={};
  actionForm: FormGroup;
  REASONS = [
    'Update Info'
  ];
  REASONSARRAY = [
    {reasonId:6,label: 'Update Info'}
  ];

  raplaceId = 0;
  fanId: string;
  applicationID: string;
  cardDetails: any;
  loading = false;
  error_message = '';
  error_dialog_open = false;
  from:string;
  id:string;

  ngOnInit(): void {
    this.actionForm = this.fb.group({
      reason: [null, Validators.required],
    });

    const reason = this.route.snapshot.queryParamMap.get('action');
    this.id = this.route.snapshot.queryParamMap.get('id');
    this.from = this.route.snapshot.queryParamMap.get('from');
    const reason_index = this.REASONS.indexOf(reason);
    if (reason_index >= 0) {
      this.actionForm.controls.reason.patchValue(reason_index);
    }
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.scrollService.scrollToTop();
  }

  redirectToList() {
    // if(this.from != null){
      this.router.navigate(['/main/bulk-groups/step-2'], {
        relativeTo: this.route,
        queryParams: {
          bulkGroupName: this.from
        }
      });
    // }
    // else{
    //   this.router.navigate(['main/all-applications/list']);
    // }
  }

  redirectToListFromModal(event) {
    console.log({ event });
    this.confirm_submit_open = false;

    if (event === 'true') {
      this.redirectToListContinue();
    }
  }

  redirectToListContinue(){
    this.cardReplacementService.CustomerCardPrinting(this.submitData).subscribe(response=>{
      this.router.navigate(['main/all-applications/list']);
    },
    err=>{
        this.error_message = err?.error?.message || "Something went wrong!";
        this.error_dialog_open = true
    })
  }

  submitForm() {
    this.router.navigate([
      'main/bulk-groups/edit',
    ],{
      queryParams: { id:this.id,feature:'BulkGroupstep2' }
    });

  }

  openCardDetails() {
    this.cardDetails = null;
    this.applicantService
      .getCustomerCardList(this.applicationID)
      .pipe(take(1))
      .subscribe(
        (response) => {
          const cardList = response?.dataList ?? [];

          if(!cardList?.length) {
            this.card_details_error = 'Records not Found'
            return;
          }

          cardList.sort((cardA, cardB) => cardB?.customerCardId - cardA?.customerCardId)

          this.cardDetails = cardList.map((card) => {
            const {
              id,
              isCardActive: status,
              refApplication_Id,
              cardStatus_Name,
              cardSerialNo,
              ...rest
            } = card;
            const _status = status;
            return {
              id,
              isCardActive: _status,
              status: _status,
              refApplication_Id,
              cardStatus_Name,
              cardSerialNo,
              ...rest
            };
          })
          this.card_details_open = true;
        },
        (err) => {
          console.log({ err });
          // this.loading = false;
          this.card_details_error = err?.error?.message || 'Something went wrong!'
        }
      );
  }

  closeCardError() {
    this.card_details_error = null;
  }
}
