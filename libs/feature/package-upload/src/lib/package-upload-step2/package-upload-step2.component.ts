import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BulkRegistrationService, MetadataService, PackageUploadService } from '@fan-id/api/server';
import { CoreService, Environment, FanIDConfig } from '@fan-id/core';
import { downloadFile } from '@fan-id/shared/utils/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'fan-id-package-upload-step2',
  templateUrl: './package-upload-step2.component.html',
  styleUrls: ['./package-upload-step2.component.scss']
})
export class PackageUploadStep2Component implements OnInit,OnDestroy,AfterViewInit {
  @ViewChild(NgSelectComponent)
  ngSelectComponent!: NgSelectComponent;

  @ViewChildren("checkboxes")
  checkboxes!: QueryList<ElementRef>;

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtProcessing = false;
  indexSaveBool = false;
  indexSave = 0;
  apiUrl: string;
  pageConfig = {
    pageSize: 10,
    pageIndex: 0,
  }
  request = {
    filter: {
      bulkGroupName: '',
      refEvent_Code: '',
      refOrganization_Id: '',
      isBulkRegistrationDraft: false,
      filterType_Package: 0
    },
    pageIndex: 0,
    pageSize: 10,
    countRequired: true,
  }
  dataList: any[] = [];
  showDeletePopup = false;
  isDeleteEnable = false;
  importListTemp: any[] = [];
  isSubmitEnabled = false;
  filterType = new FormControl(null)
  columns = [
    {
      id: 1,
      name: 'Arab Nationals (Non Latin Data)',
      value: 1
    },
    {
      id: 2,
      name: 'Non Arab Nationals (Latin Data)',
      value: 2
    },
    {
      id: 3,
      name: 'Import Failed Records',
      value: 3
    }
  ];
  bulkPackageData = {
    BulkGroupName: '',
    RefEvent_Code: '',
    RefOrganization_Id: '',
    RefRegUserCategory_Code: '',
    RefApplicationType_Code: ''
  };
  selectedPayload: any;
  refEvent_Code = '';
  bulkGroupName = '';
  applicationNo = '';
  tempSuccessArray: any[] = [];
  responseArrayQIDorPP: any = [];
  arab_nationalities: string[] = [];
  isNationalityArab = false;
  applicantType = 'Qatar Resident';
  userCategory!: Observable<any>;
  selectedApplication:any;
  showIndividualDeletePopup = false;
  type = '';
  showBulkCancelPopUp = false;
  processing = false;
  feature:any;
  delete_error = false;
  delete_error_message = "";
  selectAllChecked = false;
  checkedIds: number[] = [];
  uncheckedIds: number[] = [];
  showSelectionClearWarning = false;
  selectionWarningOrigin = '';
  submitSuccess = false;
  submitError = false;
  totalApplicationCount = 0;
  showDeleteStatus = false;
  deleteStatus = { totalSuccess: 0, totalFailed: 0 };
  backUrl = 'main/bulk-groups/step-1';
  showAllApplicationsSubmitted = false;
  resetTableState = true;

  constructor(
    private bulkuploadService: BulkRegistrationService, private router: Router,private coreService: CoreService,
    private packageUploadService: PackageUploadService,
    private metadataService: MetadataService,
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.apiUrl = this.config.apiUrl;
    const previousUrl = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString();
    if (previousUrl?.includes('edit-application')) {
      this.resetTableState = false;
    }
  }

  ngOnInit() {
    this.processPackageData();
    this.setMetadataOfPackage();
    this.setRequest();
    this.arab_nationalities = this.metadataService.getArabNationalities();
    this.dtOptions = {
      stateSave: true,
      stateLoadParams: (settings, data) => {
        if (this.resetTableState) {
          this.resetTableState = false;
          return false;
        }
      },
      pagingType: 'full_numbers',
      pageLength: this.pageConfig.pageSize,
      searching: false,
      ordering: false,
      processing: false,
      info: false,
      lengthChange: false,
      //************** */
      serverSide: true,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      ajax: (dataTablesParameters: any, callback) => {
        if (this.indexSaveBool === true) {
          dataTablesParameters.start = this.indexSave;
        }
        this.indexSave = dataTablesParameters.start;
        this.http
          .post<any>(this.apiUrl + "/api/PackageUpload/Get-Package-Upload-Bulk-Group-List", {
            ...this.request,
            pageIndex: dataTablesParameters.start / dataTablesParameters.length,
          })
          .pipe(
            catchError(() => {
              return of({
                dataList: [],
                totalCount: 0,
                isError: true,
              });
            })
          )
          .subscribe((resp) => {
            if (resp.dataList) {
              this.showAllApplicationsSubmitted =
                resp.dataList.length === 0 && resp.isError !== true && this.request.filter.filterType_Package === 0;
              this.totalApplicationCount = resp.totalCount;
            }
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
        this.indexSaveBool = false;
      },
      //**************** */
      initComplete: function (settings, json) {
        $('#packageContinueDataTable').wrap("<div class='fan-id-tablewrap'></div>");
      },
      preDrawCallback: () => {
        this.dtProcessing = true;
      },
      drawCallback: () => {
        this.dtProcessing = false;
      }
    }
  }

  processPackageData() {
    const bulkPackageData = JSON.parse(localStorage.getItem("bulkPackageData") as string);
    if(!bulkPackageData) {
      this.router.navigate([this.backUrl]);
      return;
    }
    this.bulkPackageData = bulkPackageData;
    this.refEvent_Code = this.bulkPackageData.RefEvent_Code;
    this.bulkGroupName = this.bulkPackageData.BulkGroupName;
  }

  setMetadataOfPackage() {
    const languageId = JSON.parse(localStorage.getItem("languageId") as string);
    this.userCategory = this.metadataService.getRegUserCategories({ languageId, refresh: false })
      .pipe(map(data => data?.find((item) => {
        return item?.code === this.bulkPackageData.RefRegUserCategory_Code;
      })));

    this.applicantType =
      this.bulkPackageData.RefApplicationType_Code == "Other" ? "GCC or International" : "Qatar Resident";
  }

  setRequest() {
    this.request.filter.bulkGroupName = this.bulkGroupName;
    this.request.filter.refEvent_Code = this.refEvent_Code;
    this.request.filter.refOrganization_Id = this.bulkPackageData.RefOrganization_Id;
    this.request.pageIndex = this.pageConfig.pageIndex;
    this.request.pageSize = this.pageConfig.pageSize;
  }

  validateResponse(data: any[]) {
    data.forEach(item => {
      const framerError = {
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
        ProfilePicOrDocument: ''
      }
      let technicalCount = 1;
      framerError['technicalError'] = '';

      if (
        item.customerCardApplication.docTypeId === 1 &&
        item.isQidCallDone === false
      ) {
        const qidError = 'Please verify and update your QID Number and DoB for MoI authentication';
        framerError.technicalError = technicalCount + '. ' + qidError;
        technicalCount++;
      }

      const illegibleErrorMessages = ['UNITOFWORK_EXCEPTION'];
      const errorMessageForIllegibleError = 'Something went wrong while submitting the application. Please retry';
      let bgError = item.customerCardApplication.bgSubmittedErrorMsg;
      bgError = illegibleErrorMessages.includes(bgError) ? errorMessageForIllegibleError : bgError;
      if (bgError) {
        framerError.technicalError = framerError.technicalError
          ? framerError.technicalError + '\n' + technicalCount + '. ' + bgError
          : technicalCount + '. ' + bgError;
        technicalCount++;
      }

      item.responses?.forEach(element => {
        if (element.fieldName == "FirstName") {
          framerError.firstName = element.message;
        }
        else if (element.fieldName == "LastName") {
          framerError.lastName = element.message;
        }
        else if (element.fieldName == "SecondName") {
          framerError.secondName = element.message;
        }
        else if (element.fieldName == "FourthName") {
          framerError.fourthName = element.message;
        }
        else if (element.fieldName == "ThirdName") {
          framerError.thirdName = element.message;
        }

        else if (element.fieldName == "Nationality_Name") {
          framerError.nationality_Name = element.message;
        }
        else if (element.fieldName == "RefResidentCountry") {
          framerError.currentResidentCountry_Name = element.message;
        }

        else if (element.fieldName == "MedicalInformation_Name") {
          framerError.medicalInformation_Name = element.message;
        }
        else if (element.fieldName == "Phone") {
          framerError.phone = element.message;
        }

        else if (element.fieldName == "PhoneAreaCode") {
          framerError.phoneAreaCode = element.message;
        }
        else if (element.fieldName == "DocumentIdNo") {
          framerError.documentIdNo = element.message;
        }

        else if (element.fieldName == "DocExpiryDate") {
          framerError.docExpiryDate = element.message;
        }
        else if (element.fieldName == "DateofBirth") {
          framerError.dateofBirth = element.message;
        }

        // if(element.fieldName=="TermsAndConditions"){
        //   framerError.terms=element.message;
        // }
        else if (element.fieldName == "ProfilePic") {
          if (element.message) {
            framerError.profilePic = element.message;
          }
        }
        else if (element.fieldName == "ProfilePicOrDocument") {
          if (element?.message) {
            try {
              const message_obj = JSON.parse(element.message);
              const { OCR, MOI, ICAO } = message_obj ?? {};
              const icao_errors = ICAO?.split(',').map((x: string) => `- ${x?.trim()}`);
              if (icao_errors?.length > 0) {
                framerError.ProfilePicOrDocument = icao_errors.join('\n');
              }

              if (OCR) {
                framerError.docImageFront = OCR;
              }

              if (MOI) {
                framerError.technicalError = framerError.technicalError
                  ? framerError.technicalError + '\n' + technicalCount + '. ' + MOI
                  : technicalCount + '. ' + MOI;
                technicalCount++;
              }
            } catch (error) {
              framerError.ProfilePicOrDocument = element.message;
            }
          }
        }
        else if (element.fieldName == "DocImageFront") {
          framerError.docImageFront = element.message;
        }
        else if (element.fieldName == "Email") {
          framerError.email = element.message;
        }
        else if (element.fieldName == "FirstArabicName") {
          framerError.firstArabicName = element.message;
        }
        else if (element.fieldName == "SecondArabicName") {
          framerError.secondArabicName = element.message;
        }
        else if (element.fieldName == "ThirdArabicName") {
          framerError.thirdArabicName = element.message;
        }
        else if (element.fieldName == "FourthArabicName") {
          framerError.forthArabicName = element.message;
        }
        else if (element.fieldName == "FifthArabicName") {
          framerError.fifthArabicName = element.message;
        }

        else if (element.fieldName == "Email or Phone Number") {
          framerError.phone = element.message;
          framerError.email = element.message;
        }
        else if (element.fieldName == "EmergencyContactOneFullName") {
        }
        else if (element.fieldName == "RefTicketNo") {
          framerError.ticketNo = element.message;

        }
        else if (element.fieldName == "RefApplicationType_Code") {
          framerError.applicationType_Name = element.message;

        }
        else if (element.fieldName == "RefResidentCountry_Code") {
          framerError.currentResidentCountry_Name = element.message;

        }
        else if (element.fieldName == "RefCustomerCategory_Code") {
          framerError.customerCategory_Name = element.message;

        }
        else if (element.fieldName == "DocIssuingAuthority_Nationality") {
          framerError.docIssuingAuthority_Nationality = element.message;

        }
        else if (element.fieldName == "RefNationality_Code") {
          framerError.nationality_Name = element.message;

        }
        else if (element.fieldName == "RefRegUserCategory_Code") {
          framerError.regUserCategory_Name = element.message;
        }
        else if (element.fieldName == "ProofOfAccommodation") {
          framerError.accommodationPic = element.message;
        }
        else if (element.fieldName == "ProofOfAccommodationName") {
          framerError.accommodationPic = element.message;
        }
        else if (element.fieldName == "ArrivalDate") {
          framerError.arrivalDate = element.message;
        }
        else if (element.fieldName == "BioMatchId") {
          framerError.profilePic = "Bio Match Fail";
          framerError.docImageFront = "Bio Match Fail";
        }
        else if (element.fieldName == "Gender") {
          framerError.gender_Name = element.message;
        }
        if (element.fieldName == "TermsAndConditions") {
          framerError.technicalError =
            (framerError.technicalError != null &&
              framerError.technicalError.trim() != ''
              ? framerError.technicalError + '\n'
              : '') +
            technicalCount +
            '. ' +
            element.message;
          technicalCount++;
        }
        if (element.fieldName == "DocSubType") {
          framerError.docSubType = element.message;
        }
        if (element.fieldName == "PrintedQID") {
          framerError.printedQID = element.message;
        }
        if (element.fieldName == "QIDInvalid") {
          framerError.technicalError =
            (framerError.technicalError != null &&
              framerError.technicalError.trim() != ''
              ? framerError.technicalError + '\n'
              : '') +
            technicalCount +
            '. ' +
            element.message;
          technicalCount++;
        }
      });
      if (framerError.ProfilePicOrDocument) {
        framerError.profilePic = framerError.profilePic
          ? '- ' + framerError.profilePic + '\n' + framerError.ProfilePicOrDocument
          : framerError.ProfilePicOrDocument;
      }
      if (framerError.technicalError) {
        const technical_errors = framerError.technicalError.split('\n');
        if (technical_errors.length === 1) {
          framerError.technicalError = technical_errors[0].replace('1. ', '');
        }
      }
      item.errors = framerError;
    });
  }

  confirmFilter() {
    if (this.isSubmitEnabled) {
      this.selectionWarningOrigin = 'filter';
      this.showSelectionClearWarning = true;
      return;
    }
    this.filterTable();
  }

  filterTable() {
    const filterType_Package = this.filterType.value;
    this.request.filter.filterType_Package = filterType_Package;
    this.resetTableState = true;
    this.retriggerdt();
    this.clearSelection();
  }

  confirmFilterClear() {
    if (this.isSubmitEnabled) {
      this.selectionWarningOrigin = 'clear';
      this.showSelectionClearWarning = true;
      return;
    }
    this.clearFilter();
  }

  clearFilter() {
    this.filterType.reset();
    this.request.filter.filterType_Package = 0;
    this.resetTableState = true;
    this.retriggerdt();
    this.clearSelection();
  }

  closeSelectionWarning(e: 'yes' | 'no') {
    this.showSelectionClearWarning = false;
    if (e === 'yes') {
      if (this.selectionWarningOrigin === 'clear') {
        this.clearFilter();
      } else if (this.selectionWarningOrigin === 'filter') {
        this.filterTable();
      }
    }
  }

  clearSelection() {
    this.selectAllChecked = false;
    this.checkedIds.length = 0;
    this.uncheckedIds.length = 0;
    this.setSubmitDeleteState();
  }

  deleteApplication(data) {
    this.selectedApplication = data;
    this.showIndividualDeletePopup = true;
  }

  checkAll(_) {
    if (this.selectAllChecked) {
      this.uncheckedIds.length = 0;
      this.selectAllChecked = false;
    } else {
      this.checkedIds.length = 0;
      this.uncheckedIds.length = 0;
      this.selectAllChecked = true;
    }
    this.checkboxes.forEach((element) => {
      element.nativeElement.checked = this.selectAllChecked;
    });
    this.setSubmitDeleteState();
  }

  selectApplication(event: any, data: any) {
    const checked = event.target.checked;
    const id = data.customerCardApplication.id;
    if (checked) {
      this.uncheckedIds.splice(this.uncheckedIds.indexOf(id), 1);
      if (!this.selectAllChecked)
        this.checkedIds.push(id);
    } else {
      this.checkedIds.splice(this.checkedIds.indexOf(id), 1);
      if (this.selectAllChecked)
        this.uncheckedIds.push(id);
    }
    this.setSubmitDeleteState();
  }

  private isApplicationChecked(id: number) {
    if (!this.selectAllChecked) {
      return this.checkedIds.indexOf(id) >= 0 ? true : false;
    } else {
      return this.uncheckedIds.indexOf(id) >= 0 ? false : true;
    }
  }

  setSubmitDeleteState() {
    this.selectAllChecked =
      this.selectAllChecked ? this.uncheckedIds.length !== this.totalApplicationCount : false;
    this.isSubmitEnabled = this.checkedIds.length > 0 || this.selectAllChecked;
    this.isDeleteEnable = this.checkedIds.length > 0 || this.selectAllChecked;
  }

  editApplication(obj:any) {
    localStorage.setItem('bulkPackageOrExcelItem', JSON.stringify(obj));
    this.router.navigate([
      'main/bulk-registration/upload/edit-application',
    ],{
      queryParams: { id:obj.customerCardApplication.id, feature:'package-upload-draft' }
    });
  }

  getImage(imagePath: any) {
    return this.bulkuploadService.getImage(imagePath);
  }

  proceedDeleteSelectedApplications() {
    this.type = 'delete';
    this.showDeletePopup = true;
  }

  cancel() {
    this.showBulkCancelPopUp = false;
    this.router.navigate([this.backUrl]);
  }

  onSubmit() {
    const isSubmitAll = this.selectAllChecked;
    const filterType_Package = this.request.filter.filterType_Package;
    const excludeIds = this.uncheckedIds;
    const bulkGroupName = this.bulkGroupName;
    const organizationId = this.bulkPackageData.RefOrganization_Id;
    const data = this.checkedIds.map((id) => ({id, isDraft: true}));
    const refSystemUser_Id = parseInt(localStorage.getItem('userId') as string);

    const body = {
      data,
      refSystemUser_Id,
      submitReasonType: 1,
      channel: 8,
      isSubmitAll,
      ...(filterType_Package && { filterType_Package }),
      excludeIds,
      bulkGroupName,
      organizationId,
    }

    this.packageUploadService.packageUploadFinalSubmit(body).subscribe({
      next: (response) => {
        const { status } = response;
        if (status === 200) {
          this.submitSuccess = true;
        } else {
          this.submitError = true;
        }
      },
      error: (error) => {
        console.log({error});
        this.submitError = true;
      },
    })
  }

  closeSubmitSuccess() {
    this.submitSuccess = false;
    this.retriggerdt();
    this.clearSelection();
  }

  closeSubmitError() {
    this.submitError = false;
    this.retriggerdt();
    this.clearSelection();
  }

  closeCancel() {
    this.showBulkCancelPopUp = false;
    this.showIndividualDeletePopup = false;
    this.showDeletePopup = false;
  }

  deleteSelectedApplications() {
    this.showDeletePopup = false;
    const isSubmitAll = this.selectAllChecked;
    const data = this.checkedIds.map((x) => ({ id: x }));
    if (data.length > 0 || isSubmitAll) {
      const filterType_Package = this.request.filter.filterType_Package;
      const payload = {
        data,
        organizationId: this.bulkPackageData.RefOrganization_Id,
        bulkGroupName: this.bulkPackageData.BulkGroupName,
        tournamentCode: this.bulkPackageData.RefEvent_Code,
        isSubmitAll,
        excludeIds: this.uncheckedIds,
        ...(filterType_Package && { filterType_Package }),
      }

      this.bulkuploadService.deleteDraft(payload).subscribe({
        next: (response: any) => {
          const { totatlSuccess: totalSuccess, totatlFailed: totalFailed } = response;
          this.showDeletePopup = false;
          this.deleteStatus = { totalSuccess, totalFailed };
          this.showDeleteStatus = true;
        },
        error: error => {
          console.log(error);
          this.delete_error = true;
          this.delete_error_message = "Failed to delete";
        }
      })
    }
  }

  closeDeleteStatus() {
    this.showDeleteStatus = false;
    this.retriggerdt();
    this.clearSelection();
  }

  closeAllApplicationsSubmitted() {
    this.showAllApplicationsSubmitted = false;
    this.router.navigate([this.backUrl]);
  }

  retriggerdt() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  deleteSelectedApplication() {
    this.showIndividualDeletePopup = false;
    const payload = {
      data: [{ id: this.selectedApplication.customerCardApplication.id }],
      organizationId: this.bulkPackageData.RefOrganization_Id,
      bulkGroupName: this.bulkPackageData.BulkGroupName,
      tournamentCode: this.bulkPackageData.RefEvent_Code,
      isSubmitAll: false,
      excludeIds: [],
    }

    this.bulkuploadService.deleteDraft(payload).subscribe({
      next: (response: any) => {
        const { totatlSuccess: totalSuccess, totatlFailed: totalFailed } = response;
        this.showIndividualDeletePopup = false;
        this.deleteStatus = { totalSuccess, totalFailed };
        this.showDeleteStatus = true;
      },
      error: error => {
        console.log(error);
        this.delete_error = true;
        this.delete_error_message = "Failed to delete";
      }
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  exportFailedApplication() {
    const body = {
      refOrganization_Id: this.bulkPackageData.RefOrganization_Id,
      bulkGroupName: this.bulkPackageData.BulkGroupName,
      RefTournament_Code: this.bulkPackageData.RefEvent_Code
    }
    this.packageUploadService.ExportFailedPackageItem(body)
      .pipe(map(data => {
        if (!data) throw new Error("No data found");
        return data;
      }))
      .subscribe({
        next: (data) => {
          downloadFile({
            data,
            type: "application/zip",
            filename: "ExportedPackage_" + this.bulkPackageData.BulkGroupName + ".zip"
          });
        }, error: (err) => {
          console.log(err);
          alert("Failed to export");
        }
      });
  }
}
