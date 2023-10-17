import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicantService, CardGetByApplicationId, CustomerCardApplicationGetListByFanIdRequestPagingRequest, CustomerCardApplicationGetListResponse, TournamentType } from '@fan-id/api/server';
import { DateFormatPipe, Environment, FanIDConfig, ScrollService } from '@fan-id/core';
import { EMPTY } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-view-card-details-replacement',
  templateUrl: './view-card-details.component.html',
  styleUrls: ['./view-card-details.component.scss'],
  providers: [DateFormatPipe]
})
export class ViewCardDetailsComponent implements OnInit {
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private route: ActivatedRoute,
    private router: Router,
    private applicantService: ApplicantService,
    private dateFormatPipe: DateFormatPipe,
    private scrollService: ScrollService
  ) {}

  applicant_data: any;
  fanId: string;
  applicationID: string;
  isServiceCenter = false;

  applicant_error: string | null;
  card_details_error: string | null;
  card_details_open = false;
  card_details_modal: any;

  card_data: CardGetByApplicationId;
  card_integration_data: any;
  emergencyContactSubmissionTypes = [1, 2, 3, 4];
  dependentRequest: CustomerCardApplicationGetListByFanIdRequestPagingRequest = {
    filter: {
      hayyaNo: null,
      includeParent: false
    },
    pageSize: 99,
    pageIndex: 0,
    orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }] ,
    countRequired: true
  }
  dependentList: CustomerCardApplicationGetListResponse[] = [];
  dependentPage = 1;
  eventTournamentType: TournamentType = 2;

  ngOnInit(): void {
    this.eventTournamentType = parseInt(localStorage.getItem('eventType')) as TournamentType;
    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
    this.getApplicantData();
    this.eventTournamentType === 2 && this.getDependentList();
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.scrollService.scrollToTop();
  }

  getApplicantData() {
    this.route.data
    .pipe(take(1))
    .subscribe(
       async (data) => {
         const { applicantDetail, cardDetail, cardIntegrationStatus } = data;
         const { data: applicantData, error } = applicantDetail;

         if(error) {
           this.applicant_error = error;
           this.applicant_data = null;
           return;
         }

         let _applicantData = this.applicantService.composeApplicantDetail(applicantData);
         let {
           application_date,
           expiry_date,
           dateofbirth,
           arrivalDate,
           doc_front_image,
           user_image_url,
           accommodationPic,
           docSubType
         } = _applicantData;

         const {
           application_id,
           emergencyContactOneFullName,
           emergencyContactOnePhoneAreaCode,
           emergencyContactOnePhone,
           emergencyContactTwoFullName,
           emergencyContactTwoPhoneAreaCode,
           emergencyContactTwoPhone,
           printingStatus_Name,
           printingStatus
           } = _applicantData;

         [application_date, expiry_date, dateofbirth, arrivalDate] =
         [application_date, expiry_date, dateofbirth, arrivalDate]
          .map(date => date && this.dateFormatPipe.transform(date));

         doc_front_image = this.applicantService.composeImageUrl(doc_front_image);
         user_image_url = await this.applicantService.composeImageUrl(user_image_url);
         accommodationPic = this.applicantService.composeImageUrl(accommodationPic);

         const emergency_contacts = [
          {
            fullname: emergencyContactOneFullName,
            country_code: emergencyContactOnePhoneAreaCode,
            mobile: emergencyContactOnePhone,
          },
          {
            fullname: emergencyContactTwoFullName,
            country_code: emergencyContactTwoPhoneAreaCode,
            mobile: emergencyContactTwoPhone,
          },
        ];

         _applicantData = {
           ..._applicantData,
           application_date,
           expiry_date,
           dateofbirth,
           arrivalDate,
           doc_front_image,
           accommodationPic,
           user_image_url,
           emergency_contacts,
           docSubType
         }

         this.applicationID = application_id;
         this.card_data = cardDetail?.data;
         this.card_integration_data = {
           ...cardIntegrationStatus?.data,
           printingStatus_Name,
           printingStatus
          };
         this.applicant_data = _applicantData;
       }
     );
  }

  getDependentList() {
    this.applicantService.getDependentList(this.dependentRequest)
    .pipe(
      take(1),
      catchError(err => {
        console.log(err);
        return EMPTY;
      })
    )
    .subscribe(response => {
      const dependentList = response?.dataList ?? []
      this.dependentList = dependentList.map(dependent => {
        let { profilePic } = dependent;
        profilePic = this.applicantService.composeImageUrl(profilePic);
        return { ...dependent, profilePic }
      })
    })
  }

  openCardDetails() {
    this.card_details_modal = null;
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

          this.card_details_modal = cardList.map((card) => {
            // this.card_details_modal = cardList.filter((_, index) => index < 2).map((card, index) => {
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
          this.card_details_error = err?.error?.message || 'Something went wrong!'
        }
      );
  }

  closeCardError() {
    this.card_details_error = null;
  }

  redirectToList() {
    this.router.navigate(['main/card-replacement/list']);
  }
}
