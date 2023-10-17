import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import {
  BulkRegistrationService,
  CreateBulkRegistrationDraftInsertRequestList,
  MetadataService,
} from '@fan-id/api/server';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import * as $ from 'jquery';
import { SubmissionStatus, BulkImportData } from '@fan-id/api/server';
import { switchMap } from 'rxjs/operators';
import { CoreService } from '@fan-id/core';

@Component({
  selector: 'fan-id-bulk-upload-step2',
  templateUrl: './bulk-upload-step2.component.html',
  styleUrls: ['./bulk-upload-step2.component.scss'],
})
export class BulkUploadStep2Component implements OnInit {
  eventname: any = '';
  displayEventName;
  organizationname: any = '';
  bulkgroupname: any = '';
  uploadzipfile: any = '';
  deliverytype: any = '';
  servicecentre: any = '';
  showExport: boolean;
  dtOptions: DataTables.Settings = {};
  type: string;
  showBulkCancelPopUp: boolean;
  dtTrigger: Subject<any> = new Subject<any>();
  isDeleteEnable: boolean;
  showIndividualDeletePopup: boolean;
  showDeletePopup: boolean;

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

  load: boolean = false;
  processing: boolean = false;
  uploadbtnvisible: boolean = true;
  submittedStatus: boolean = false;
  importeddata: any = [];
  processingdata: any;
  events: any;
  organizations: any;
  servicecentres: any;
  importListTemp: any = [];
  importListToSave: any = [];
  subStatus: any;
  togglePanel: boolean = false;
  isSubmitEnabled: boolean = false;
  eventCode: string;
  userOrganizationId: number;
  formData: any;
  selectedId: any;
  eventNameDisplay: string;
  selectedPayload: any;
  arab_nationalities: string[];
  showProcessing = false;
  hideProcessing = false;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  private fixedCounter = new BehaviorSubject<number>(-1);
  fixedCounter$ = this.fixedCounter.asObservable();
  counterExcel = 0;
  constructor(
    private bulkuploadService: BulkRegistrationService,
    private router: Router,
    private coreService: CoreService,
    private metadataService: MetadataService
  ) {
    this.arab_nationalities = this.metadataService.getArabNationalities();
  }
  updateFixedValue(value: number) {
    this.fixedCounter.next(value);
  }
  ngOnInit() {
    //  debugger;
    this.showProcessing = true;
    this.hideProcessing = false;
    this.eventname = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.eventNameDisplay = localStorage.getItem('event');
    this.eventCode = localStorage.getItem('eventCode');
    this.userOrganizationId = parseInt(localStorage.getItem('organizationId'));

    const prevState = JSON.parse(localStorage.getItem('bulkItem'));

    // history.state;
    this.formData = prevState.formData;
    this.selectedPayload = prevState.selectedPayload;
    if (this.selectedPayload) {
      this.formData.organizationname = this.selectedPayload.organizationId.name;
      this.formData.uploadzipfile = this.selectedPayload.fileName;
      // this.formData.deliverytype=this.selectedPayload.selectedDeliveryType.name;
      // this.formData.servicecentre=this.selectedPayload.selectedServiceCentere.name;
    }

    const dataList = prevState.dataList;
    this.eventname = this.formData.RefEvent_Code;
    this.organizationname = this.formData.RefOrganization_Id;
    this.bulkgroupname = this.formData.BulkGroupName;
    this.uploadzipfile = this.formData?.file?.name ?? 'uploaded file';
    this.deliverytype = this.formData.DeliveryAddress;
    this.servicecentre = this.formData.RefSerivceCenter_Code;
    this.showExport = localStorage.getItem("ShowExport")=="true"?true:false;

    const state = history.state;
    this.importeddata = dataList;
    if (state && state.id) {
      const injectPayload = {
        customerCardApplication: state.data.data,
        responses: [],
        uiId: state.uiId,
        isQidCallDone: false,
      };
      if (injectPayload.customerCardApplication.id != 0) {
        injectPayload['importStatus'] = true;
        if (injectPayload.customerCardApplication.docTypeId === 1)
          injectPayload['isQidCallDone'] = true;

        // const selectedData: any = this.importeddata.find(
        //   (e) => e.uiId == state.uiId
        // );
        //  if (state && state.feature == 'bulk-upload-draft') {

        //   let index = this.importeddata.indexOf(selectedData);
        //   this.importeddata.splice(index, 1, { ...injectPayload });
        // } else {
        this.importeddata.splice(
          this.importeddata.findIndex((x) => x.uiId === state.uiId),
          1,
          { ...injectPayload }
        );
        // }
      }

      const newstate = {
        formData: this.formData,
        dataList: this.importeddata,
        selectedPayload: this.selectedPayload,
      };
      localStorage.setItem('bulkItem', JSON.stringify(newstate));
    }
    this.counterExcel = 0;
    this.updateFixedValue(this.counterExcel);
    this.fixedCounter$.subscribe((val) => {
      if (this.importeddata.length === val) {
        this.validateResponse(this.importeddata);
      }
    });

    //Validate Qid Part
    this.importeddata.forEach((elem) => {
      if (elem['isQidCallDone'] === false) {
        if (
          elem.customerCardApplication.docTypeId === 1 &&
          elem.importStatus === true
        ) {
          const qidPayload = {
            qid: elem.customerCardApplication.documentIdNo,
            birthDate: elem.customerCardApplication.dateofBirth,
            applicationNo: elem.customerCardApplication.applicationNo,
            draftID: elem.customerCardApplication.id,
          };
          this.bulkuploadService.validateQid(qidPayload).subscribe(
            (resp) => {
              if (resp.resultCode === 1) {
                elem.customerCardApplication = resp.data;
                elem['isQidCallDone'] = true;
                this.counterExcel = this.counterExcel + 1;
                this.updateFixedValue(this.counterExcel);
              }
            },
            (err) => {
              this.counterExcel = this.counterExcel + 1;

              this.updateFixedValue(this.counterExcel);

              elem['responses'] = [
                {
                  fieldName: 'QIDInvalid',
                  message: err.error.message || 'Validate QID Failed',
                },
              ];
              elem.customerCardApplication =
                err?.error?.data === null
                  ? elem.customerCardApplciation
                  : err.error?.data;
            }
          );
        } else {
          elem['isQidCallDone'] = false;
          this.counterExcel = this.counterExcel + 1;

          this.updateFixedValue(this.counterExcel);
        }
      } else {
        this.counterExcel = this.counterExcel + 1;

        this.updateFixedValue(this.counterExcel);
      }
    });

    this.dtOptions = {
      // select:'multiple',
      searching: false,
      processing: true,
      info: false,
      lengthChange: false,
      pagingType: 'full_numbers',
      pageLength: 10,
      order: [],
      stateSave: true,
      columnDefs: [
        {
          targets: [
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
          ],
          orderable: false,
        },
      ],
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };
    this.dtTrigger.next();
    // this.bulkuploadService.getBulkImportData().pipe(first())
    //   .subscribe((data:BulkImportData[]) => {
    //     this.importeddata = data;
    //
    //   }, error => (console.error(error)));
    //this.submittedStatus=true;
  }

  validateResponse(data: any[]) {
    data.forEach((item) => {
      let framerError = {
        firstName: '',
        lastName: '',
        profilePic: '',
        docType_Name: '',
        document: '',
        docImageFront: '',
        docExpiryDate: '',
        email: '',
        phoneAreaCode: '',
        phone: '',
        gender_Name: '',
        title_Name: '',
        secondName: '',
        thirdName: '',
        fourthName: '',
        applicationType_Name: '',
        customerCategory_Name: '',
        currentResidentCountry_Name: '',
        fanIdNo: '',
        ticketNo: '',
        firstArabicName: '',
        secondArabicName: '',
        thirdArabicName: '',
        forthArabicName: '',
        fifthArabicName: '',
        documentIdNo: '',
        docIssuingAuthority_Nationality: '',
        nationality_Name: '',
        dateofBirth: '',
        regUserCategory_Name: '',
        medicalInformation_Name: '',
        backGroundCheckStatus_Name: '',
        technicalError: '',
        optInMarketing: '',
        accommodationPic: '',
        arrivalDate: '',
        printedQID: '',
        docSubType: '',
      };
      let technicalcount = 1;
      framerError['technicalError'] = '';
      // if (item.errors && item.errors.technicalError != '') {
      //   framerError.technicalError = technicalcount + ". "+item.errors.technicalError;

      //   technicalcount++;
      // }
      if (
        item.customerCardApplication.docTypeId === 1 &&
        item.isQidCallDone === false
      ) {
        const qidError =
          'Please verify and update your QID Number and DoB for MoI authentication';

        framerError.technicalError = technicalcount + '. ' + qidError;
        technicalcount++;
      }

      item.responses.forEach((element) => {
        if (element.fieldName == 'FirstName') {
          framerError.firstName = element.message;
        } else if (element.fieldName == 'LastName') {
          framerError.lastName = element.message;
        } else if (element.fieldName == 'SecondName') {
          framerError.secondName = element.message;
        } else if (element.fieldName == 'FourthName') {
          framerError.fourthName = element.message;
        } else if (element.fieldName == 'ThirdName') {
          framerError.thirdName = element.message;
        } else if (element.fieldName == 'Nationality_Name') {
          framerError.nationality_Name = element.message;
        } else if (element.fieldName == 'RefResidentCountry') {
          framerError.currentResidentCountry_Name = element.message;
        } else if (element.fieldName == 'MedicalInformation_Name') {
          framerError.medicalInformation_Name = element.message;
        } else if (element.fieldName == 'Phone') {
          framerError.phone = element.message;
        } else if (element.fieldName == 'PhoneAreaCode') {
          framerError.phoneAreaCode = element.message;
        } else if (element.fieldName == 'DocumentIdNo') {
          framerError.documentIdNo = element.message;
        } else if (element.fieldName == 'DocExpiryDate') {
          framerError.docExpiryDate = element.message;
        } else if (element.fieldName == 'DateofBirth') {
          framerError.dateofBirth = element.message;
        }

        // if(element.fieldName=="TermsAndConditions"){
        //   framerError.terms=element.message;
        // }
        else if (element.fieldName == 'ProfilePic') {
          framerError.profilePic = element.message;
        } else if (element.fieldName == 'DocImageFront') {
          framerError.docImageFront = element.message;
        } else if (element.fieldName == 'Email') {
          framerError.email = element.message;
        } else if (element.fieldName == 'FirstArabicName') {
          framerError.firstArabicName = element.message;
        } else if (element.fieldName == 'SecondArabicName') {
          framerError.secondArabicName = element.message;
        } else if (element.fieldName == 'ThirdArabicName') {
          framerError.thirdArabicName = element.message;
        } else if (element.fieldName == 'FourthArabicName') {
          framerError.forthArabicName = element.message;
        } else if (element.fieldName == 'FifthArabicName') {
          framerError.fifthArabicName = element.message;
        } else if (element.fieldName == 'Email or Phone Number') {
          framerError.phone = element.message;
          framerError.email = element.message;
        } else if (element.fieldName == 'EmergencyContactOneFullName') {
        } else if (element.fieldName == 'RefTicketNo') {
          framerError.ticketNo = element.message;
        } else if (element.fieldName == 'RefApplicationType_Code') {
          framerError.applicationType_Name = element.message;
        } else if (element.fieldName == 'RefResidentCountry_Code') {
          framerError.currentResidentCountry_Name = element.message;
        } else if (element.fieldName == 'RefCustomerCategory_Code') {
          framerError.customerCategory_Name = element.message;
        } else if (
          element.fieldName == 'RefDocIssuingAuthority_NationalityCode'
        ) {
          framerError.docIssuingAuthority_Nationality = element.message;
        } else if (element.fieldName == 'RefNationality_Code') {
          framerError.nationality_Name = element.message;
        } else if (element.fieldName == 'RefRegUserCategory_Code') {
          framerError.regUserCategory_Name = element.message;
        } else if (
          element.fieldName == 'RefDocIssuingAuthority_NationalityCode'
        ) {
          framerError.docIssuingAuthority_Nationality = element.message;
        } else if (element.fieldName == 'ProofOfAccommodation') {
          framerError.accommodationPic = element.message;
        } else if (element.fieldName == 'ProofOfAccommodationName') {
          framerError.accommodationPic = element.message;
        } else if (element.fieldName == 'ArrivalDate') {
          framerError.arrivalDate = element.message;
        } else if (element.fieldName == 'BioMatchId') {
          framerError.profilePic = 'Bio Match Fail';
          framerError.docImageFront = 'Bio Match Fail';
        } else if (element.fieldName == 'Gender') {
          framerError.gender_Name = element.message;
        }
        if (element.fieldName == 'TermsAndConditions') {
          framerError.technicalError =
            (framerError.technicalError != null &&
            framerError.technicalError.trim() != ''
              ? framerError.technicalError + '\n'
              : '') +
            technicalcount +
            '. ' +
            element.message;
          technicalcount++;
        }
        if (element.fieldName == 'DocSubType') {
          framerError.docSubType = element.message;
        }
        if (element.fieldName == 'PrintedQID') {
          framerError.printedQID = element.message;
        }
        if (element.fieldName == 'QIDInvalid') {
          framerError.technicalError =
            (framerError.technicalError != null &&
            framerError.technicalError.trim() != ''
              ? framerError.technicalError + '\n'
              : '') +
            technicalcount +
            '. ' +
            element.message;
          technicalcount++;
        }
      });
      if (item.responses.length > 0) {
        item.importStatus = false;
      }
      item.errors = framerError;
      setTimeout(() => {
        this.hideProcessing = true;
      }, 2000);
    });
    this.retriggerdt();
  }
  onSubmit() {
    const data = [];
    let status: any;
    const selectedRecords = this.importListTemp.length;
    let totalselectedCount = 0;
    this.checkboxes.forEach((element) => {
      if (element.nativeElement.checked === true) {
        totalselectedCount = totalselectedCount + 1;
      }
    });

    let listRecords = {
      qid: 0,
      passport: 0,
      arab: 0,
      nonarab: 0,
      nondoc: 0,
      nonnat: 0,
    };
    this.importeddata.forEach((element) => {
      if (
        element.customerCardApplication.docTypeId != null &&
        element.customerCardApplication.docTypeId == 1
      ) {
        listRecords.qid++;
        if (element.customerCardApplication.nationalityCode != null) {
          if (
            this.arab_nationalities.includes(
              element.customerCardApplication.nationalityCode
            )
          ) {
            listRecords.arab++;
          } else {
            listRecords.nonarab++;
          }
        } else {
          listRecords.nonnat++;
        }
      } else if (
        element.customerCardApplication.docTypeId != null &&
        element.customerCardApplication.docTypeId == 3
      ) {
        listRecords.passport++;
        if (element.customerCardApplication.nationalityCode != null) {
          if (
            this.arab_nationalities.includes(
              element.customerCardApplication.nationalityCode
            )
          ) {
            listRecords.arab++;
          } else {
            listRecords.nonarab++;
          }
        } else {
          listRecords.nonnat++;
        }
      } else {
        listRecords.nondoc++;
      }
    });
    let failedRecords = {
      qid: 0,
      passport: 0,
      arab: 0,
      nonarab: 0,
      nondoc: 0,
      nonnat: 0,
    };

    this.importListTemp.forEach((element) => {
      if (
        element.customerCardApplication.id != 0 &&
        element.customerCardApplication.isApplicationValid === true
      ) {
        data.push({ id: element.customerCardApplication.id, isDraft: true });
      } else {
        if (
          element.customerCardApplication.docTypeId != null &&
          element.customerCardApplication.docTypeId == 1
        ) {
          failedRecords.qid++;
          if (element.customerCardApplication.nationalityCode != null) {
            if (
              this.arab_nationalities.includes(
                element.customerCardApplication.nationalityCode
              )
            ) {
              failedRecords.arab++;
            } else {
              failedRecords.nonarab++;
            }
          } else {
            failedRecords.nonnat++;
          }
        } else if (
          element.customerCardApplication.docTypeId != null &&
          element.customerCardApplication.docTypeId == 3
        ) {
          failedRecords.passport++;
          if (element.customerCardApplication.nationalityCode != null) {
            if (
              this.arab_nationalities.includes(
                element.customerCardApplication.nationalityCode
              )
            ) {
              failedRecords.arab++;
            } else {
              failedRecords.nonarab++;
            }
          } else {
            failedRecords.nonnat++;
          }
        } else {
          failedRecords.nondoc++;
        }
      }
    });
    // let failedRecords=totalselectedCount - data.length;
    const body: CreateBulkRegistrationDraftInsertRequestList = {
      data,
      refSystemUser_Id: 3,
      submitReasonType: 1,
      channel: 8,
    };
    // this.processing=true;
    if (data.length > 0) {
      this.bulkuploadService.postSelected(body).subscribe(
        (success) => {
          this.checkboxes.forEach((element) => {
            element.nativeElement.checked = false;
          });
          var elements = <HTMLInputElement[]>(
            (<any>document.getElementsByName('checkall'))
          );
          for (let i = 0; i < elements.length; i++) {
            elements[i].checked = false;
          }
          // document.getElementById("checkAllmem").checked("checked","false")// Uncheck

          this.showExport = true;
          localStorage.setItem("ShowExport","true");

          status = {
            qid: {
              pendingRecords:
                listRecords.qid -
                (success?.qid?.successApplication?.total || 0) -
                (failedRecords.qid +
                  (success?.qid?.failedApplication?.total || 0)),
              failedRecords:
                failedRecords.qid +
                (success?.qid?.failedApplication?.total || 0),
              succesRecords: success?.qid?.successApplication?.total || 0,
            },
            passport: {
              pendingRecords:
                listRecords.passport -
                (success?.passport?.successApplication?.total || 0) -
                (failedRecords.passport +
                  (success?.passport?.failedApplication?.total || 0)),
              failedRecords:
                failedRecords.passport +
                (success?.passport?.failedApplication?.total || 0),
              succesRecords: success?.passport?.successApplication?.total || 0,
            },
            arab: {
              pendingRecords:
                listRecords.arab -
                (failedRecords.arab +
                  (success?.qid?.failedApplication?.arabic || 0) +
                  (success?.passport?.failedApplication?.arabic || 0)) -
                (success?.qid?.successApplication?.arabic || 0) +
                (success?.passport?.successApplication?.arabic || 0),
              failedRecords:
                failedRecords.arab -
                (success?.qid?.failedApplication?.arabic || 0) +
                (success?.passport?.failedApplication?.arabic || 0),
              succesRecords:
                (success?.qid?.successApplication?.arabic || 0) +
                (success?.passport?.successApplication?.arabic || 0),
            },
            nonarab: {
              pendingRecords:
                listRecords.nonarab -
                (failedRecords.nonarab +
                  (success?.qid?.failedApplication?.nonArabic || 0) +
                  (success?.passport?.failedApplication?.nonArabic || 0)) -
                (success?.qid?.successApplication?.nonArabic || 0) +
                (success?.passport?.successApplication?.nonArabic || 0),
              failedRecords:
                failedRecords.nonarab -
                (success?.qid?.failedApplication?.nonArabic || 0) +
                (success?.passport?.failedApplication?.nonArabic || 0),
              succesRecords:
                (success?.qid?.successApplication?.nonArabic || 0) +
                (success?.passport?.successApplication?.nonArabic || 0),
            },
            nonnat: {
              pendingRecords: (listRecords.nonnat || 0 )- (failedRecords.nonnat || 0),
              failedRecords: (failedRecords.nonnat || 0),
            },
            nondoc: {
              pendingRecords: (listRecords.nondoc || 0) - (failedRecords.nondoc | 0),
              failedRecords: (failedRecords.nondoc || 0),
            },
          };
          // status={
          //   pendingRecords:this.importeddata.length - totalselectedCount,
          //   failedRecords:failedRecords + success.totatlFailed,
          //   succesRecords: success.totatlSuccess

          // }

          if (success.successList) {
            success.successList.forEach((element) => {
              this.removeIndvidualbydId(element.data);
            });
            this.retriggerdt();
          }
          this.importListTemp = [];
          this.isValidSubmit();

          this.subStatus = status;
          this.submittedStatus = true;
          //frame techincal error
          if (success.failedList) {
            success.failedList.forEach((sub) => {
              let failedElement = {
                ...this.importeddata.find(
                  (e) => e.customerCardApplication.id === sub.data.id
                ),
              };
              if (failedElement != null) {
                let failedElementIndex = this.importeddata.findIndex(
                  (e) => e.customerCardApplication.id === sub.data.id
                );
                failedElement.errors.technicalError = sub.reason;
                failedElement.importStatus = false;
                this.importeddata[failedElementIndex] = { ...failedElement };
              }
            });
            // const prevState =JSON.parse(localStorage.getItem("bulkItem"));
            // const framedNewState= {
            //   formData:this.formData,
            //   dataList: this.importeddata,
            //   selectedPayload:prevState.selectedPayload
            // }
            // localStorage.setItem("bulkItem",JSON.stringify(framedNewState));
          }

          // success.failedList.forEach(sub => {

          // this.importeddata.forEach(element => {
          //   if(element.customerCardApplication.id ! =0 && element.customerCardApplication.id === sub.data.id )
          //     {
          //       element.errors.technicalError = sub.reason;
          //     }
          //   });
          // });
        },
        (error) => console.error(error)
      );
    } else {
      window.alert('Please select atleast one record for submission');
    }
  }

  selectMember(uiId: any, isChecked) {
    if (isChecked.target.checked) {
      this.importListTemp.push(this.findElementbyUiId(uiId));
    } else {
      this.importListTemp.splice(
        this.importListTemp.findIndex((x) => x.uiId == uiId),
        1
      );
    }
    this.isValidSubmit();
  }
  isValidSubmit() {
    this.isSubmitEnabled = false;
    this.importListTemp.forEach((element) => {
      if (
        element.customerCardApplication.id != 0 &&
        element.customerCardApplication.isApplicationValid === true
      ) {
        this.isSubmitEnabled = true;
      }
    });
    this.isDeleteEnable = false;
    this.checkboxes.forEach((element) => {
      if (element.nativeElement.checked === true) {
        this.isDeleteEnable = true;
      }
    });
  }
  removeSelectedItems() {
    let data = [];
    this.importListTemp.forEach((element) => {
      if (element.customerCardApplication.id != 0)
        data.push({ id: element.customerCardApplication.id });
    });
    if (data.length > 0) {
      const payload = {
        data: data,
        organizationId: this.formData.RefOrganization_Id,
        bulkGroupName: this.formData.BulkGroupName,
        tournamentCode: this.formData.RefEvent_Code,
      };

      this.bulkuploadService.deleteDraft(payload).subscribe();
    }
    this.importListTemp.forEach((element) => {
      this.importeddata.splice(
        this.importeddata.findIndex((x) => x.uiId === element.uiId),
        1
      );
      //  this.updatecache();
    });
    this.importListTemp = [];
    // let count = 0;
    // let arr = [];
    // this.checkboxes.forEach((element) => {
    //   if (element.nativeElement.checked === true) {
    //     arr.push(count);
    //   }
    //   count = count + 1;
    // });
    // while (arr.length > 0) {
    //   var popped = arr.pop();
    //   this.importeddata.splice(popped, 1);
    // }
    this.updatecache();
    this.closeCancel();
    this.retriggerdt();
  }
  updatecache() {
    const newstate = {
      formData: this.formData,
      dataList: this.importeddata,
      selectedPayload: this.selectedPayload,
    };
    localStorage.setItem('bulkItem', JSON.stringify(newstate));
  }
  removeIndvidual(index) {
    this.selectedId = index;
    this.showIndividualDeletePopup = true;
  }
  removeIndvidualbydId(id) {
    const selectedData: any = this.importeddata.find(
      (e) => e.customerCardApplication.id == id
    );
    let index = this.importeddata.indexOf(selectedData);

    this.importeddata.splice(index, 1);
    this.updatecache();
  }
  checkAll(args) {
    this.importListTemp = [];
    let count = 0;
    this.checkboxes.forEach((element) => {
      if (args.target.checked) {
        element.nativeElement.checked = true;
        this.isDeleteEnable = true;
        // if (
        //   this.importeddata[count].customerCardApplication.id != 0 &&
        //   this.importeddata[count].customerCardApplication
        //     .isApplicationValid === true
        // ) {
        this.importListTemp.push(this.importeddata[count]);
        //  }
        count = count + 1;
      } else {
        element.nativeElement.checked = false;
        this.isDeleteEnable = false;
      }
      // this.importListTemp.length = 0;
    });
    this.isValidSubmit();
  }

  close() {
    this.submittedStatus = false;
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();

    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {});
    this.retriggerdt();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.fixedCounter.unsubscribe();
  }

  getImage(imagePath) {
    return this.bulkuploadService.getImage(imagePath);
  }

  updateOcr(id: any) {
    const payload = {
      refEvent_Code: this.formData.RefEvent_Code,
      draftId: id,
      bulkGroupName: this.formData.BulkGroupName,
    };
    this.bulkuploadService
      .updateOcr(payload)
      .toPromise()
      .then((response) => {
        if (response != null && response.resultCode === 1) {
          if (response.data != null) {
            this.importeddata.forEach((element) => {
              if (
                element.customerCardApplication.id != 0 &&
                element.customerCardApplication.id ===
                  response.data.customerCardApplication.id
              ) {
                let index = this.importeddata.indexOf(element);
                this.importeddata[index] = response.data;
              }
            });
            this.updatecache();
            this.validateResponse(this.importeddata);
          }
        }
      });
  }

  editApplication(obj: any, index: any) {
    if (obj.customerCardApplication.id != 0) {
      this.router.navigate(['main/bulk-registration/upload/edit-application'], {
        queryParams: {
          id: obj.customerCardApplication.id,
          feature: 'bulk-upload-draft',
        },
        state: { data: { uiId: obj.uiId, isQidCallDone: obj.isQidCallDone } },
      });
    } else {
      this.router.navigate(['main/bulk-registration/upload/edit-application'], {
        queryParams: { id: index, feature: 'bulk-upload-non-draft' },
        state: { data: obj },
      });
    }
  }

  cancel() {
    this.type = 'cancel';
    this.showBulkCancelPopUp = true;
  }

  backtoHome() {
    this.submittedStatus = false;
    this.router.navigate(['/main/bulk-registration']);
  }
  proceedCancel() {
    // let data = [];
    // let count = 1;
    // comment removal of import success recodr
    // this.importeddata.forEach((element) => {
    //   if (element.customerCardApplication.id != 0)
    //     data.push({ id: element.customerCardApplication.id });
    // });
    // if (data.length > 0) {
    //   const payload = {
    //     data: data,
    //     organizationId: this.formData.RefOrganization_Id,
    //     bulkGroupName: this.formData.BulkGroupName,
    //     tournamentCode: this.formData.RefEvent_Code,
    //   };

    //   this.bulkuploadService.deleteDraft(payload).subscribe((respose) => {
    //     this.showBulkCancelPopUp = false;
    //     this.router.navigate(['/main/bulk-registration']);
    //   });
    // } else {
      this.showBulkCancelPopUp = false;
      this.router.navigate(['/main/bulk-registration']);
    // }
  }
  closeCancel() {
    this.showBulkCancelPopUp = false;
    this.showIndividualDeletePopup = false;
    this.showDeletePopup = false;
  }

  retriggerdt() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();

      this.dtTrigger.next();
    });
  }

  exportFailedApplication() {
    let exportedDraftids = [];
    this.importeddata.forEach((element) => {
   if (element.customerCardApplication.id == 0)
      exportedDraftids.push(element.customerCardApplication.excelRefNumber);
    });
    const payload = {
      excludeDraft: false,
      refOrganization_Id: this.formData.RefOrganization_Id,
      bulkGroupName: this.formData.BulkGroupName,
      refTournament_Code: this.formData.RefEvent_Code,
      isExportFromSelected: true,
      exportSelected: exportedDraftids,
    };
    this.bulkuploadService.exportFailed(payload).subscribe((data) => {
      const blob = new Blob([data], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      let link = document.createElement('a');
      if (link.download !== undefined) {
        let url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          'ExportedExcel_' + this.bulkgroupname + '.xlsx'
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }
  closeProcessing() {
    this.showProcessing = false;
  }
  proceedDelete() {
    this.showDeletePopup = true;
  }
  proceedDeleteBYID() {
    const selectedData: any = this.findElementbyUiId(this.selectedId);
    let data = [];
    if (selectedData?.customerCardApplication.id != 0) {
      data.push({ id: selectedData.customerCardApplication.id });
    }
    if (data.length > 0) {
      const payload = {
        data: data,
        organizationId: this.formData.RefOrganization_Id,
        bulkGroupName: this.formData.BulkGroupName,
        tournamentCode: this.formData.RefEvent_Code,
      };

      this.bulkuploadService.deleteDraft(payload).subscribe();
    }
    this.importeddata.splice(
      this.importeddata.findIndex((x) => x.uiId === this.selectedId),
      1
    );
    this.updatecache();
    this.closeCancel();
    this.retriggerdt();
  }
  findElementbyUiId(id) {
    return this.importeddata.find((x) => x.uiId === id);
  }
  findElementbyUiIdTemp(id) {
    return this.importListTemp.find((x) => x.uiId === id);
  }
}
