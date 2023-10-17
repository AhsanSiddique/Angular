import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AllApplicationsService,
  ApplicantService,
  CancelApplication,
  CardReplacementService,
  CustomerCardApplicationActionGetListRequest,
  CustomerCardApplicationGetListByFanIdRequestPagingRequest,
  CustomerCardApplicationGetListResponse,
  EntryPermitHistoryRequest,
  TICAODocumentInformation,
  TournamentType,
} from '@fan-id/api/server';
import {
  DateFormatPipe,
  Environment,
  FanIDConfig,
  ScrollService,
} from '@fan-id/core';
import { B2BVisaType, TApplicationType, getApplicationType, getB2BVisaType, getICAOTableData } from '@fan-id/shared/utils/form';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { EDIT_ACTIONS } from '../all-application-actions';

@Component({
  selector: 'fan-id-applicant-details',
  templateUrl: './applicant-details.component.html',
  styleUrls: ['./applicant-details.component.scss'],
  providers: [DateFormatPipe],
})
export class ApplicantDetailsComponent implements OnInit {
  permission: any;
  viewDocumentsPermission:any;
  allPermission: any;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private applicantService: ApplicantService,
    private dateFormatPipe: DateFormatPipe,
    private cardReplacementService: CardReplacementService,
    private scrollService: ScrollService,
    private aps: AllApplicationsService
  ) {}

  isServiceCenter = false;
  applicant_data: any;
  applicant_error: string;

  card_details_open = false;
  card_details_error: string | null;

  confirm_submit_open = false;
  show_cancel_modal = false;
  submitData = {};
  actionForm: FormGroup;
  REASONS = [
    // 'Lost/Stolen',
    'Re-Submit',
    'Update Info',
    'Add Dependent',
    // 'Cancel',
    'Re-Apply',
    'Edit',
    'Delete',
    // 'Card Malfunctioning',
  ];
  REASONSARRAY = [
    // {reasonId:2,label:'Lost/Stolen'},
    { reasonId: 6, label: 'Re-Submit' },
    { reasonId: 6, label: 'Update Info' },
    // {reasonId:3,label: 'Card Malfunctioning'}
  ];

  raplaceId = 0;
  fanId: string;
  applicationID: string;
  cardDetails: any;
  loading = false;
  error_message = '';
  error_dialog_open = false;
  from: string;

  emergencyContactSubmissionTypes = [1, 2, 3, 4];

  dependentRequest: CustomerCardApplicationGetListByFanIdRequestPagingRequest = {
    filter: {
      includeParent: false,
      hayyaNo: null
    },
    pageSize: 99,
    pageIndex: 0,
    orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }],
    countRequired: true,
  };
  hayyaWithMeRequest: any = {
    filter: {
      hostRefApplication_Id:null
    },
    pageSize: 99,
    pageIndex: 0,
    orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }],
    countRequired: true,
  };
  dependentList: CustomerCardApplicationGetListResponse[] = [];
  hayyaWithMeList = [];
  hayyaWithMe2023List = [];
  dependentPage = 1;
  hayyaWithMePage = 1;
  hayyaWithMe2023Page = 1;
  active = 1;
  isChildApplication = false;
  eventTournamentType: TournamentType = 2;

  application_history_filter: CustomerCardApplicationActionGetListRequest;
  entrypermit_history_filter: EntryPermitHistoryRequest;

  documentNumber: string = null;
  show_cancel_app_modal = false;
  cancel_application_error = false;
  cancel_application_success = false;
  cancelErrorMessage: string = null;
  delete_draft_data: any;
  show_delete_draft_modal = false;
  delete_draft_success = false;
  delete_draft_error = false;
  delete_draft_error_message: string;
  show_action_alert = false;
  action_alert_message: string;
  icao_data!: TICAODocumentInformation;
  hayya_with_me_id:number;

  private _dependentList$ = new BehaviorSubject([]);
  dependentList$ = this._dependentList$.asObservable();
  private _hayyaWithMeList$ = new BehaviorSubject([]);
  hayyaWithMeList$ = this._hayyaWithMeList$.asObservable();
  private _hayyaWithMe2023List$ = new BehaviorSubject([]);
  hayyaWithMe2023List$ = this._hayyaWithMe2023List$.asObservable();

  applicationType$ = new BehaviorSubject<TApplicationType>('VISA');
  b2bVisaType$ = new BehaviorSubject<B2BVisaType>('TRANSIT');
  isAccreditation$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.getPermission();

    this.eventTournamentType = parseInt(
      localStorage.getItem('eventType')
    ) as TournamentType;

    this.actionForm = this.fb.group({
      reason: [null, Validators.required],
    });

    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
    this.from = this.route.snapshot.queryParamMap.get('from');

    this.entrypermit_history_filter = {
      fanIdNo: this.fanId,
    };

    this.getHayyaWithMeList();
    this.scrollService.scrollToTop();
  }

  getPermission() {
    if (this.isServiceCenter) {
      const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      this.permission = permissionList?.roles?.find(
        (element) => element?.key === 'Customer Application'
      );
      this.viewDocumentsPermission = this.permission = permissionList?.roles?.find(
        (element) => element?.key === 'View Customer Application Document'
      );
      this.allPermission = permissionList?.fullAccess;
      console.log('Permission List ', this.permission, this.allPermission);
    } else {
      this.allPermission = true;
    }
  }

  getDependentList() {
    if(this.isChildApplication){
      return;
    }
    this.applicantService
      .getDependentList(this.dependentRequest)
      .pipe(
        catchError((err) => {
          console.log(err);
          return EMPTY;
        })
      )
      .subscribe((response) => {
        const dependentList = response?.dataList ?? [];
        this.dependentList = dependentList.map((dependent) => {
          let { profilePic } = dependent;
          profilePic = this.applicantService.composeImageUrl(profilePic);
          return { ...dependent, profilePic };
        });
        this._dependentList$.next(this.dependentList);
      });
  }

  redirectToList() {
    if (this.from != null) {
      this.router.navigate(['/main/bulk-groups/step-2'], {
        relativeTo: this.route,
        queryParams: {
          bulkGroupName: this.from,
        },
      });
    } else {
      this.router.navigate(['main/all-applications/list']);
    }
  }

  redirectToListFromModal(event) {
    console.log({ event });
    this.confirm_submit_open = false;

    if (event === 'true') {
      this.redirectToListContinue();
    }
  }

  redirectToListContinue() {
    this.cardReplacementService.CustomerCardPrinting(this.submitData).subscribe(
      () => {
        this.router.navigate(['main/all-applications/list']);
      },
      (err) => {
        this.error_message = err?.error?.message || 'Something went wrong!';
        this.error_dialog_open = true;
      }
    );
  }

  submitForm() {
    const { value: form_value } = this.actionForm;
    console.log({ form_value });
    const fanid = this.fanId;
    const _reason = this.REASONS[form_value.reason];
    if (_reason === 'Cancel') {
      this.show_cancel_app_modal = true;
      return;
    }
    if (_reason === 'Delete') {
      this.show_delete_draft_modal = true;
      return;
    } else if (_reason === 'Add Dependent') {
      this.router.navigate(['main/new-customer'], {
        queryParams: { parentfanid: fanid },
      });
      return;
    }
    const submitReasonTypes = {
      'Update Info': 3,
      'Re-Submit': 2,
      'Re-Apply': 1,
      Edit: 3,
    };
    const submitReasonType = submitReasonTypes[_reason];
    if (Object.keys(submitReasonTypes).includes(_reason)) {
      const edit_action = EDIT_ACTIONS.find((a) => a.name === _reason);
      if (edit_action) {
        const { errorMessage } = edit_action.validate?.(this.applicant_data);
        if (errorMessage) {
          this.showActionValidationAlert(errorMessage);
          return;
        }
      }
      this.router.navigate(['edit'], {
        relativeTo: this.route,
        queryParams: { fanid, submitReasonType },
      });
    } else {
      this.submitData = {
        ApplicationId: this.raplaceId,
        Reason: this.REASONS[this.actionForm.controls.reason.value],
        description: this.REASONS[this.actionForm.controls.reason.value],
        reasonType: this.REASONSARRAY[
          this.REASONSARRAY.findIndex(
            (item) =>
              item.label === this.REASONS[this.actionForm.controls.reason.value]
          )
        ].reasonId,
      };
      this.confirm_submit_open = true;
    }
  }

  showActionValidationAlert(message: string) {
    this.show_action_alert = true;
    this.action_alert_message = message;
  }

  closeActionValidationAlert() {
    this.show_action_alert = false;
    this.action_alert_message = '';
  }

  openCardDetails() {
    this.cardDetails = null;
    this.applicantService
      .getCustomerCardList(this.applicationID)
      .pipe(take(1))
      .subscribe(
        (response) => {
          const cardList = response?.dataList ?? [];

          if (!cardList?.length) {
            this.card_details_error = 'Records not Found';
            return;
          }

          cardList.sort(
            (cardA, cardB) => cardB?.customerCardId - cardA?.customerCardId
          );

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
              ...rest,
            };
          });
          this.card_details_open = true;
        },
        (err) => {
          console.log({ err });
          this.card_details_error =
            err?.error?.message || 'Something went wrong!';
        }
      );
  }

  closeCardError() {
    this.card_details_error = null;
  }

  //#region cancel application

  CancelApplication() {
    this.show_cancel_app_modal = false;
    const body: CancelApplication = {
      fanIDNo: this.fanId,
      documentIdNo: this.documentNumber,
    };
    console.log(body);
    this.aps
      .cancelApplication(body)
      .pipe(take(1))
      .subscribe(
        () => {
          this.cancel_application_success = true;
        },
        (err) => {
          this.cancel_application_error = true;
          this.cancelErrorMessage = err?.error?.message ?? 'Error';
        }
      );
  }

  openDetails() {
    this.router.navigate(
      ['main/all-applications/list/applicant-details/application-history'],
      {
        queryParams: {
          id: this.application_history_filter.refApplication_Id,
          fanId: this.fanId,
        },
      }
    );
  }

  deleteDraft() {
    this.show_delete_draft_modal = false;
    const body: CancelApplication = {
      fanIDNo: this.fanId,
      documentIdNo: this.documentNumber,
    };
    console.log(body);
    this.aps
      .deleteDraftApps(body)
      .pipe(take(1))
      .subscribe(
        () => {
          this.delete_draft_success = true;
        },
        (err) => {
          this.delete_draft_error = true;
          this.cancelErrorMessage = err?.error?.message ?? 'Error';
        }
      );
  }

  getHayyaWithMeList() {
    if(this.isChildApplication || !this.isServiceCenter){
      return;
    }
    this.hayyaWithMeRequest.filter.hostRefApplication_Id = this.hayya_with_me_id;
    this.applicantService.getHayyaWithMeList(this.hayyaWithMeRequest).pipe(
      take(1),
      catchError((err) => {
        console.log(err);
        return EMPTY;
      })
    )
    .subscribe((response) => {
      let hayyaWithMeList = response?.dataList ?? [];
      hayyaWithMeList = hayyaWithMeList.map((hayyaWithMe) => {
        let { profilePic } = hayyaWithMe;
        profilePic = this.applicantService.composeImageUrl(profilePic);
        return { ...hayyaWithMe, profilePic };
      });
      this.hayyaWithMeList = hayyaWithMeList.filter((hayyaWithMe) => hayyaWithMe.refCustomerCategory_Code !== 'NHWM');
      this.hayyaWithMe2023List = hayyaWithMeList.filter((hayyaWithMe) => hayyaWithMe.refCustomerCategory_Code === 'NHWM');
      this._hayyaWithMeList$.next(this.hayyaWithMeList);
      this._hayyaWithMe2023List$.next(this.hayyaWithMe2023List);
    });
  }

  dependentView() {
    let result = false;
    if ((this.dependentList.length && !this.hayyaWithMeList.length)
      || (this.dependentList.length && this.hayyaWithMeList.length && this.active === 1)) {
      result = true;
    }
    return result;
  }

  hayyaWithMeView() {
    let result = false;
    if ((!this.dependentList.length && this.hayyaWithMeList.length)
      || (this.dependentList.length && this.hayyaWithMeList.length && this.active === 2)) {
      result = true;
    }
    return result;
  }
}
