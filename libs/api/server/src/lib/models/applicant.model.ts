import { ApiResultCode, BaseResponse, HttpStatusCode, OrderByModel } from "./api.model";

export interface CustomerCardApplicationInsertRequest {
  AccommodationPic?: File;
  AccommodationTypeSelected?: number;
  AddressLine1?: string;
  AddressLine2?: string;
  AddressLine3?: string;
  ApplicationDate?: string;
  ApplicationNo?: string;
  ApplicationStatus?: CustomerCardApplicationApplicationStatus;
  applicationStatus?: number;
  arrivalDate?: string;
  BackgroundCheckStatus?: number;
  BioMatchId?: string;
  BuildingNumber?: string;
  BulkGroupName?: string;
  BulkRegDraftId?: number;
  CancelledFanIdNo?: string;
  Channel?: number;
  DateofBirth: string;
  DeliveryAddress?: string;
  DocExpiryDate?: string;
  DocImageBack: File;
  DocImageFront: File;
  DocQualityScore?: number;
  DocSubType?: string;
  DocumentIdNo: string;
  Email: string;
  EmailOtpCode?: string;
  EmergencyContactOneFullName?: string;
  EmergencyContactOnePhone?: string;
  EmergencyContactOnePhoneAreaCode?: string;
  EmergencyContactTwoFullName?: string;
  EmergencyContactTwoPhone?: string;
  EmergencyContactTwoPhoneAreaCode?: string;
  FaceIDScore?: number;
  FanIdNo?: string;
  FifthArabicName?: string;
  FirstArabicName?: string;
  FirstName: string;
  ForthArabicName?: string;
  FourthName?: string;
  GccDoc?: string;
  HotelAccommodationAddress?: string;
  IcaoAndOcrError?: string;
  IsBulkRegistrationDraft?: boolean;
  IsChildApplication: boolean;
  IsFromDirectReg?: boolean;
  IsHayyaCard?: boolean;
  isProfilePicICAOComplains?: boolean;
  LastName: string;
  matchHospitalityOrder?: string;
  MaxNumberOfApplication?: number;
  OptInMarketing?: boolean;
  OrgGroupAccommodationAddress?: string;
  otherProfession?: string;
  Phone: string;
  PhoneAreaCode: string;
  PlaceOfBirth?: string;
  PreviousNationality_Code?: string;
  ProfilePic: File;
  PurposeOfVisit?: string;
  Reason?: string;
  RefAddressNationality_Code?: string;
  RefApplicationType_Code: string;
  RefCardDeliveryType_Code: string;
  RefConferenceEvent_Id?: number;
  RefCurrentResidentCountry_Code: string;
  RefCustomerCategory_Code: string;
  RefDocIssuingAuthority_NationalityCode?: string;
  RefDocType_Id: number;
  RefEvent_Code: string;
  RefGender_Code: string;
  RefMedicalInformation_Id?: string;
  RefNationality_Code: string;
  RefOrganization_Id?: number;
  RefParentFanIdNo?: string;
  RefProfession_Code?: string;
  RefPurposeOfVisit_Code?: string;
  RefRegServiceCenter_Code?: string;
  RefRegUserCategory_Code?: string;
  RefResidentCountry_Code?: string;
  RefSerivceCenter_Code?: string;
  RefSystemUser_Id?: number;
  RefTicketNo?: string;
  RefTitle_Code: string;
  Salary?: number;
  SecondArabicName?: string;
  SecondName?: string;
  SmsOtpCode?: string;
  StreetNumber?: string;
  SubmissionType: number;
  submitReasonType?: number;
  ThirdArabicName?: string;
  ThirdName?: string;
  TicketOrderId?: string;
  UnitNumber?: string;
  update?: boolean;
  VisaCopyDoc?: string;
  VoucherCode?: string;
  ZipCode?: string;
  ZoneNumber?: string;
}

export type CustomerCardApplicationInsertRequestKey = keyof CustomerCardApplicationInsertRequest;

export type CustomerCardApplicationApplicationStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 9 | 8;

// map for formcontrolnames to model names
export const registerFormKeyMap: {
  [key: string]: CustomerCardApplicationInsertRequestKey;
} = {
  // ticket-form
  ticketOrderId: "TicketOrderId",
  voucherCode: "VoucherCode",
  matchHospitality: "matchHospitalityOrder",
  purpose_visit: "RefPurposeOfVisit_Code",
  purpose_visit_other: "PurposeOfVisit",
  // application-form
  application_type: "RefApplicationType_Code",
  fan_category: "RefCustomerCategory_Code",
  current_country: "RefCurrentResidentCountry_Code",
  estimated_arrival: "arrivalDate",
  user_category: "RefRegUserCategory_Code",
  conference_name: "RefConferenceEvent_Id",
  // upload-form
  user_image: "ProfilePic",
  document_type: "RefDocType_Id",
  document_front: "DocImageFront",
  document_back: "DocImageBack",
  document_proof: "AccommodationPic",
  document_number: "DocumentIdNo",
  document_expiry: "DocExpiryDate",
  dateofbirth: "DateofBirth",
  issuing_country: "RefDocIssuingAuthority_NationalityCode",
  nationality: "RefNationality_Code",
  // residency-form
  country_birth: "PlaceOfBirth",
  country_residence: "RefCurrentResidentCountry_Code",
  previous_nationality: "PreviousNationality_Code",
  permit_document: "GccDoc",
  visa_copy_document: "VisaCopyDoc",
  job_title: "RefProfession_Code",
  job_title_other: "otherProfession",
  // accommodation-form
  accommodation_type: "AccommodationTypeSelected",
  accommodation_name: "HotelAccommodationAddress",
  // personal-form
  ticket_number: "RefTicketNo",
  order_id: "TicketOrderId",
  voucher_code: "VoucherCode",
  hospitality_number: "matchHospitalityOrder",
  // title: "RefTitle_Code",
  firstname: "FirstName",
  secondname: "SecondName",
  thirdname: "ThirdName",
  fourthname: "FourthName",
  lastname: "LastName",
  firstname_ar: "FirstArabicName",
  secondname_ar: "SecondArabicName",
  thirdname_ar: "ThirdArabicName",
  fourthname_ar: "ForthArabicName",
  lastname_ar: "FifthArabicName",
  gender: "RefGender_Code",
  phonecode: "PhoneAreaCode",
  mobile: "Phone",
  email: "Email",
  medical: "RefMedicalInformation_Id",
  contactname: "EmergencyContactOneFullName",
  contactcode: "EmergencyContactOnePhoneAreaCode",
  contactnumber: "EmergencyContactOnePhone",
  // preferred-collection-form
  delivery_type: 'RefCardDeliveryType_Code',
  service_centre: 'RefSerivceCenter_Code',
  address_line_1: 'AddressLine1',
  address_line_2: 'AddressLine2',
  address_line_3: 'AddressLine3',
  address_line_4: 'ZipCode',
  deliver_country: 'RefAddressNationality_Code',
  // terms-form
  email_updates: "OptInMarketing",
  // card-choice-form
  receive_card: "IsHayyaCard",
};

export interface CustomerCardApplicationGetListResponse {
  accommodationPic?: string;
  accommodationTypeName?: string;
  accommodationTypeSelected?: number;
  accommodationTypeSelected_Name?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  addressNationalityCode?: string | null;
  applicationDate?: string | null;
  applicationNo: string;
  applicationStatus_Name?: string | null;
  applicationStatus?: CustomerCardApplicationApplicationStatus;
  applicationType_Name?: string | null;
  applicationTypeCode: string;
  approvalComments?: string | null;
  arrivalDate?: string;
  backGroundCheckStatus_Name?: string | null;
  backgroundCheckStatus?: number | null;
  bioMatchId?: string | null;
  border_Entry_Status?: string;
  buildingNumber?: string | null;
  bulkGroupExtractId?: string;
  bulkGroupName?: string | null;
  cardDeliveryType_Name?: string | null;
  cardDeliveryTypeCode: string;
  cardStatus_Name?: string | null;
  cardStatus?: number;
  channel?: number;
  currentResidentCountry_Name?: string | null;
  currentResidentCountryCode: string;
  customerCategory_Name?: string | null;
  customerCategoryCode: string;
  dateofBirth: string;
  deliveryAddress?: string | null;
  deliveryStatus_Name?: string | null;
  deliveryStatus?: number;
  dependentCount?: number;
  docExpiryDate?: string | null;
  docImageBack?: string | null;
  docImageFront: string;
  docIssuingAuthority_Nationality?: string | null;
  DocIssuingAuthority?: string | null;
  docQualityScore?: number | null;
  docSubType?: string | null;
  docType_Name?: string | null;
  docTypeId: number;
  documentIdNo: string;
  email: string;
  emergencyContactOneFullName?: string | null;
  emergencyContactOnePhone?: string | null;
  emergencyContactOnePhoneAreaCode?: string | null;
  emergencyContactOnePhoneCountryCode?: string | null;
  emergencyContactTwoFullName?: string | null;
  emergencyContactTwoPhone?: string | null;
  emergencyContactTwoPhoneAreaCode?: string | null;
  emigration_Status?: string;
  eventCode: string;
  faceIDScore?: number | null;
  fanIdNo: string;
  fanIdTypeName?: string;
  fifthArabicName?: string | null;
  firstArabicName?: string | null;
  firstName: string;
  forthArabicName?: string | null;
  fourthName?: string | null;
  gccDoc?: string;
  gccDocPath?: string;
  gender_Name?: string | null;
  genderCode: string;
  hayyaNo?: string;
  hotelAccommodationAddress?: string;
  icaoAndOcrError?: string;
  id?: number;
  isApplicationValid?: boolean;
  isApprovedOnece?: boolean;
  isChildApplication: boolean;
  isHayyaCard?: boolean;
  isProfilePicICAOComplains?: boolean;
  isProfilePicICAOMsg?: string;
  isRequestFormLifray?: boolean | null;
  isTicketValidated?: boolean | null;
  lastName: string;
  matchHospitality?: string;
  medicalInformation_Name?: string | null;
  medicalInformationId?: string | null;
  nationality_Name?: string | null;
  nationalityCode: string;
  optInMarketing?: boolean;
  organization_Name?: string | null;
  organizationCategory_Translation_Name?: string;
  organizationId?: number | null;
  orgGroupAccommodationAddress?: string;
  otherProfession?: string;
  parentFanIdNo?: string | null;
  phone: string;
  phoneAreaCode: string;
  phoneCountryCode?: string;
  placeOfBirth?: string;
  placeOfBirth_Name?: string;
  previousNationality_Code?: string;
  previousNationality_Name?: string;
  printingStatus_Name?: string | null;
  printingStatus?: number;
  profession_Name?: string | null;
  professionCode?: string | null;
  profilePic: string;
  purposeOfVisit?: string;
  reason?: string | null;
  refConferenceEvent_Id?: number | null;
  refPurposeOfVisit_Code?: string;
  registrationServiceCenterCode?: string | null;
  regUserCategory_Name?: string | null;
  remainingResubmitCount?: number;
  remainingUpdateCount?: number;
  representingCountryCode_Name?: string;
  representingCountryCode?: string;
  residentCountryCode?: string | null;
  salary?: number | null;
  secondArabicName?: string | null;
  secondName?: string | null;
  serivceCenterCode?: string | null;
  serivceCenterName?: string | null;
  serviceCenter_Name?: string | null;
  streetNumber?: string | null;
  submissionType_Name?: string | null;
  submissionType?: number;
  submitReasonType?: number | null;
  system_RowVersion?: string | null;
  systemUser_Name?: string | null;
  thirdArabicName?: string | null;
  thirdName?: string | null;
  ticketNo?: string | null;
  ticketOrderId?: string | null;
  title_Name?: string | null;
  titleCode: string;
  unitNumber?: string | null;
  userCategoryCode?: string | null;
  userId?: number | null;
  visaCopyDoc?: string;
  visaCopyDocPath?: string;
  visaDuration?: number,
  visaIssuedDate?: string,
  visaLastEntryDate?: string,
  visaStatus?: number;
  visaStatus_Name?: string | null;
  visaUsageFlag?: string | null;
  visaNum?: string | null;
  visaExpiryDate?: string | null;
  visaDescriptionAr?: string | null;
  visaDescriptionEn?: string | null;
  voucherCode?: string | null;
  zipCode?: string | null;
  zoneNumber?: string | null;
  conferenceEvent_Name?: string | null;
  isProfilePicError?: boolean;
  isNewRegisterationFromAccreditation?: boolean;
  refCustomerBelongingsIds?: string;
  refCustomerComapanyProfileIds?: string;
  refCustomerServicesIds?: string;
  refCustomerzonesIds?: string;
  refCustomerAccreditationOrganizationsIds?: string;
  refEventsCustomerVenuesIds?: string;
  organizationEnName?: string;
  organizationArName?: string;
  otherProfessionAR?: string;
  mofaTitleAR?: string;
  mofaTitleEN?: string;
}

export type CustomerCardApplicationGetListResponseKey = keyof CustomerCardApplicationGetListResponse;

export const applicantDetailKeyMap: {
  [key: string]: CustomerCardApplicationGetListResponseKey;
} = {
  // application details
  application_type: 'applicationType_Name',
  applicationTypeCode: 'applicationTypeCode',
  application_date: 'applicationDate',
  approval_comments: 'approvalComments',
  application_number: 'applicationNo',
  arrivalDate: "arrivalDate",
  current_country: 'currentResidentCountry_Name',
  current_country_code: 'currentResidentCountryCode',
  submission_type: 'submissionType_Name',
  fanid_category: 'customerCategory_Name',
  fanid_category_code: 'customerCategoryCode',
  fanid_number: 'fanIdNo',
  fanid_card_details: 'cardStatus_Name',
  document_quality_score: 'docQualityScore',
  faceid_score: 'faceIDScore',
  application_status: 'applicationStatus_Name',
  application_status_id: 'applicationStatus',
  backgroundcheck_status: 'backGroundCheckStatus_Name',
  backgroundcheck_status_id: 'backgroundCheckStatus',
  application_id: 'id',
  card_status_id: "cardStatus",
  organizationCategory: 'organizationCategory_Translation_Name',
  hayyaNo: 'hayyaNo',
  // accreditation
  refConferenceEvent_Id: 'refConferenceEvent_Id',
  representingCountryCode_Name: "representingCountryCode_Name",
  refCustomerComapanyProfileIds: 'refCustomerComapanyProfileIds',
  refCustomerBelongingsIds: 'refCustomerBelongingsIds',
  refCustomerzonesIds: 'refCustomerzonesIds',
  refEventsCustomerVenuesIds: 'refEventsCustomerVenuesIds',
  refCustomerAccreditationOrganizationsIds: 'refCustomerAccreditationOrganizationsIds',
  organizationEnName: "organizationEnName",
  organizationArName: "organizationArName",
  otherProfessionAR: "otherProfessionAR",
  isAccreditation: "isNewRegisterationFromAccreditation",
  // document details
  user_image_url: 'profilePic',
  document_type: 'docType_Name',
  document_number: 'documentIdNo',
  expiry_date: 'docExpiryDate',
  issuing_country: 'docIssuingAuthority_Nationality',
  issuing_country_code: 'DocIssuingAuthority',
  doc_front_image: 'docImageFront',
  accommodationPic: "accommodationPic",
  docSubType:"docSubType",
  // residency details
  placeOfBirth: 'placeOfBirth',
  placeOfBirth_Name: 'placeOfBirth_Name',
  currentResidentCountryCode: 'currentResidentCountryCode',
  currentResidentCountry_Name: 'currentResidentCountry_Name',
  previousNationality_Code: 'previousNationality_Code',
  previousNationality_Name: 'previousNationality_Name',
  professionCode: 'professionCode',
  profession_Name: 'profession_Name',
  otherProfession: 'otherProfession',
  gccDocPath: 'gccDocPath',
  visaCopyDocPath: 'visaCopyDocPath',
  gccDoc: 'gccDoc',
  visaCopyDoc: 'visaCopyDoc',
  // accommodation details
  accommodationTypeSelected: 'accommodationTypeSelected',
  accommodationTypeSelected_Name: 'accommodationTypeSelected_Name',
  hotelAccommodationAddress: 'hotelAccommodationAddress',
  // personal details
  ticket_reference_number: 'ticketNo',
  order_id: 'ticketOrderId',
  voucher_code: 'voucherCode',
  matchHospitality: 'matchHospitality',
  title: 'title_Name',
  titleEN: 'mofaTitleEN',
  titleAR: 'mofaTitleAR',
  firstname: 'firstName',
  secondname: 'secondName',
  thirdname: 'thirdName',
  fourthname: 'fourthName',
  lastname: 'lastName',
  nationality: 'nationality_Name',
  nationality_code: 'nationalityCode',
  dateofbirth: 'dateofBirth',
  gender: 'gender_Name',
  country_code: 'phoneAreaCode',
  mobile: 'phone',
  email: 'email',
  user_category: 'regUserCategory_Name',
  medical: 'medicalInformation_Name',
  firstArabicName:'firstArabicName',
  secondArabicName:'secondArabicName',
  thirdArabicName:'thirdArabicName',
  forthArabicName:'forthArabicName',
  fifthArabicName: 'fifthArabicName',
  phoneCountryCode: 'phoneCountryCode',
  // delivery details
  delivery_type: 'cardDeliveryType_Name',
  delivery_type_code: 'cardDeliveryTypeCode',
  service_center_code: 'serivceCenterCode',
  service_center: 'serviceCenter_Name',
  delivery_address: 'deliveryAddress',
  address_line_1: 'addressLine1',
  address_line_2: 'addressLine2',
  address_line_3: 'addressLine3',
  address_line_4: 'zipCode',
  // emergency contact details
  submissionType: "submissionType",
  emergencyContactOneFullName: "emergencyContactOneFullName",
  emergencyContactOnePhoneCountryCode: "emergencyContactOnePhoneCountryCode",
  emergencyContactOnePhoneAreaCode: "emergencyContactOnePhoneAreaCode",
  emergencyContactOnePhone: "emergencyContactOnePhone",
  emergencyContactTwoFullName: "emergencyContactTwoFullName",
  emergencyContactTwoPhoneAreaCode: "emergencyContactTwoPhoneAreaCode",
  emergencyContactTwoPhone: "emergencyContactTwoPhone",
  // integration details
  printingStatus_Name: 'printingStatus_Name',
  printingStatus: 'printingStatus',
  isChildApplication:'isChildApplication',
  // visa details
  visaStatus: 'visaStatus',
  visaStatus_Name: 'visaStatus_Name',
  visaNum: 'visaNum',
  visaExpiryDate: 'visaExpiryDate',
  visaLastEntryDate: 'visaLastEntryDate',
  visaDescriptionAr: 'visaDescriptionAr',
  visaDescriptionEn: 'visaDescriptionEn',
  visaDuration: 'visaDuration',
  visaIssuedDate: "visaIssuedDate",
  visaUsageFlag:"visaUsageFlag",
  // other
  remainingResubmitCount: 'remainingResubmitCount',
  remainingUpdateCount: 'remainingUpdateCount',
  accommodationTypeName: 'accommodationTypeName',
  bulkGroupName: "bulkGroupName",
  orgGroupAccommodationAddress: "orgGroupAccommodationAddress",
  organization_Name: "organization_Name",
  fanIdTypeName: "fanIdTypeName",
  emigration_Status: "emigration_Status",
  border_Entry_Status: "border_Entry_Status",
  channel: "channel",
  customerCategoryCode: 'customerCategoryCode',
  conferenceEvent_Name:"conferenceEvent_Name",
  userCategoryCode:"userCategoryCode"
}
export interface CardGetByApplicationIdDataResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  data?: CardGetByApplicationId;
}

export interface CardGetByApplicationId {
  /** @format int64 */
  id?: number;

  /** @format int64 */
  customerCardId?: number;
  cardSerialNo?: string | null;
  bluetoothId?: string | null;
  desFireId?: string | null;
  panNo?: string | null;
  cardNo?: string | null;
  qrailTravelCardNo?: string | null;
  mowasalat_PTN_No?: string | null;

  /** @format int32 */
  status?: number | null;
  cardExpireDate?: string | null;
  description?: string | null;

  /** @format int64 */
  refApplication_Id?: number;
  cardStatus_Name?: string | null;
  isCardActive?: boolean;
  fanIdNo?: string;
}

export interface CustomerCardIntegrationStatusResponse {
  status?: number;
  status_Name?: string | null;
  integrationType?: number;

  /** @format int64 */
  integrationId?: number | null;
}

export interface CustomerCardIntegrationResponse {
  qnb_Status?: CustomerCardIntegrationStatusResponse;
  idam_Status?: CustomerCardIntegrationStatusResponse;
  qRail_Status?: CustomerCardIntegrationStatusResponse;
  mowasalat_Status?: CustomerCardIntegrationStatusResponse;
  qPost_Status?: CustomerCardIntegrationStatusResponse;
}

export interface CustomerCardIntegrationResponseDataResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  data?: CustomerCardIntegrationResponse;
}

export interface BulkRegistrationDraftGetListRequest {
  applicationNo?: string | null;
  fanIdNo?: string | null;
  isChildApplication?: boolean | null;
  refParentFanIdNo?: string | null;
  refEvent_Code?: string | null;
  refCardDeliveryType_Code?: string | null;
  refSerivceCenter_Code?: string | null;
  refApplicationType_Code?: string | null;
  refCustomerCategory_Code?: string | null;
  refCurrentResidentCountry_Code?: string | null;
  applicationStatus?: number | CustomerCardApplicationApplicationStatus;

  /** @format int64 */
  refDocType_Id?: number | null;
  docImageFront?: string | null;
  docImageBack?: string | null;
  profilePic?: string | null;

  /** @format date-time */
  docExpiryDate?: string | null;
  documentIdNo?: string | null;
  refTitle_Code?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  /** @format date-time */
  dateofBirth?: string | null;
  phoneAreaCode?: string | null;
  phone?: string | null;
  refGender_Code?: string | null;
  email?: string | null;
  refProfession_Code?: string | null;

  /** @format double */
  salary?: number | null;
  refNationality_Code?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  zipCode?: string | null;

  /** @format int64 */
  refOrganization_Id: number;
  bulkGroupName?: string | null;
  refTicketNo?: string | null;
  ticketOrderId?: string | null;
  docSubType?: string | null;
  refDocIssuingAuthority_NationalityCode?: string | null;
  secondName?: string | null;
  thirdName?: string | null;
  fourthName?: string | null;
  refRegUserCategory_Code?: string | null;

  /** @format date-time */
  applicationDate?: string | null;
  refAddressNationality_Code?: string | null;

  /** @format int32 */
  channel?: number | null;

  /** @format int32 */
  docQualityScore?: number | null;

  /** @format int32 */
  faceIDScore?: number | null;

  /** @format int32 */
  backgroundCheckStatus?: number | null;
  refMedicalInformation_Id?: string | null;
  emergencyContactOneFullName?: string | null;
  emergencyContactOnePhoneAreaCode?: string | null;
  emergencyContactOnePhone?: string | null;
  emergencyContactTwoFullName?: string | null;
  emergencyContactTwoPhoneAreaCode?: string | null;
  emergencyContactTwoPhone?: string | null;
  deliveryAddress?: string | null;

  /** @format int64 */
  refSystemUser_Id?: number | null;
  refRegServiceCenter_Code?: string | null;
  bioMatchId?: string | null;
  unitNumber?: string | null;
  buildingNumber?: string | null;
  streetNumber?: string | null;
  zoneNumber?: string | null;
  firstArabicName?: string | null;
  secondArabicName?: string | null;
  thirdArabicName?: string | null;
  forthArabicName?: string | null;
  fifthArabicName?: string | null;
  isTicketValidated?: boolean | null;

  /** @format int32 */
  submissionType?: number | null;
}

export interface BulkRegistrationDraftGetListRequestPagingRequest {
  filter?: BulkRegistrationDraftGetListRequest;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;
}

export interface BulkRegistrationDraftGetListResponse {
  applicationNo?: string | null;
  fanIdNo?: string | null;
  isChildApplication: boolean;
  parentFanIdNo?: string | null;
  eventCode: string;
  cardDeliveryTypeCode: string;
  serivceCenterCode?: string | null;
  applicationTypeCode: string;
  customerCategoryCode: string;
  currentResidentCountryCode: string;

  /** @format int64 */
  docTypeId: number;
  documentIdNo: string;
  docSubType?: string | null;
  DocIssuingAuthority?: string | null;

  /** @format date-time */
  docExpiryDate?: string | null;
  titleCode: string;
  genderCode: string;
  firstName: string;
  lastName: string;
  secondName?: string | null;
  thirdName?: string | null;
  fourthName?: string | null;

  /** @format date-time */
  dateofBirth: string;
  phoneAreaCode: string;
  phone: string;
  email: string;
  professionCode?: string | null;

  /** @format double */
  salary?: number | null;
  nationalityCode: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  zipCode?: string | null;

  /** @format int64 */
  organizationId?: number | null;
  bulkGroupName?: string | null;
  ticketNo?: string | null;
  ticketOrderId?: string | null;

  /** @format date-time */
  applicationDate?: string | null;
  channel?: number;

  /** @format int32 */
  docQualityScore?: number | null;

  /** @format int32 */
  faceIDScore?: number | null;

  /** @format int32 */
  backgroundCheckStatus?: number | null;
  medicalInformationId?: string | null;
  emergencyContactOneFullName?: string | null;
  emergencyContactOnePhoneAreaCode?: string | null;
  emergencyContactOnePhone?: string | null;
  emergencyContactTwoFullName?: string | null;
  emergencyContactTwoPhoneAreaCode?: string | null;
  emergencyContactTwoPhone?: string | null;
  deliveryAddress?: string | null;
  userCategoryCode?: string | null;

  /** @format int64 */
  userId?: number | null;
  reason?: string | null;
  addressNationalityCode?: string | null;

  /** @format int32 */
  submitReasonType?: number | null;
  bioMatchId?: string | null;
  unitNumber?: string | null;
  buildingNumber?: string | null;
  streetNumber?: string | null;
  zoneNumber?: string | null;
  firstArabicName?: string | null;
  secondArabicName?: string | null;
  thirdArabicName?: string | null;
  forthArabicName?: string | null;
  fifthArabicName?: string | null;
  registrationServiceCenterCode?: string | null;
  isTicketValidated?: boolean | null;
  submissionType?: number;
  docImageFront: string;
  docImageBack?: string | null;
  profilePic: string;

  /** @format int64 */
  bulkRegDraftId?: number | null;
  bulkGroupExtractId?: string | null;
  isBulkRegistrationDraft?: boolean;
  residentCountryCode?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  cardDeliveryType_Name?: string | null;
  applicationType_Name?: string | null;
  customerCategory_Name?: string | null;
  currentResidentCountry_Name?: string | null;
  docType_Name?: string | null;
  title_Name?: string | null;
  gender_Name?: string | null;
  profession_Name?: string | null;
  nationality_Name?: string | null;
  organization_Name?: string | null;
  docIssuingAuthority_Nationality?: string | null;
  medicalInformation_Name?: string | null;
  regUserCategory_Name?: string | null;
  systemUser_Name?: string | null;
  cardStatus_Name?: string | null;
  applicationStatus_Name?: string | null;

  /** @format int64 */
  dependentCount?: number;
  deliveryStatus_Name?: string | null;
  printingStatus_Name?: string | null;
  submissionType_Name?: string | null;
  approvalComments?: string | null;
  backGroundCheckStatus_Name?: string | null;
  applicationState_Name?: string | null;
  serviceCenter_Name?: string | null;
}

export interface BulkRegistrationDraftGetListResponsePagingResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;

  /** @format int64 */
  totalCount?: number;
  dataList?: BulkRegistrationDraftGetListResponse[] | null;
}

export interface CreateBulkRegistrationDraftInsertRequest {
  /** @format int64 */
  id: number;
  isDraft: boolean;
}

export interface CreateBulkRegistrationDraftInsertRequestList {
  data: CreateBulkRegistrationDraftInsertRequest[];

  /** @format int64 */
  refSystemUser_Id: number;

  /** @format int32 */
  submitReasonType: number;
  channel?: number;
  bulkGroupName?: string | null;
  organizationId?: number | null;
}

export interface BulkResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;

  /** @format int64 */
  totatlSuccess?: number | null;

  /** @format int64 */
  totatlFailed?: number | null;
  failedList?: any[] | null;
  successList?: any[] | null;

  /** @format int64 */
  totatlInsertSuccess?: number | null;

  /** @format int64 */
  totatlInsertFailed?: number | null;

  /** @format int64 */
  totatlUpdateSuccess?: number | null;

  /** @format int64 */
  totatlUpdateFailed?: number | null;
}

export interface CustomerCardApplicationGetListByFanIdRequest {
  fanIdNo?: string;
  includeParent?: boolean;
  hayyaNo?: string;
}

export interface CustomerCardApplicationGetListByFanIdRequestPagingRequest {
  filter?: CustomerCardApplicationGetListByFanIdRequest;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;
}

export interface CustomerCardApplicationGetListResponsePagingResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;

  /** @format int64 */
  totalCount?: number;
  dataList?: CustomerCardApplicationGetListResponse[] | null;
}

export interface CardGetByApplicationIdPagingResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;

  /** @format int64 */
  totalCount?: number;
  dataList?: CardGetByApplicationId[] | null;
}

export interface CustomerCardApplicationCardListRequest {
  applicationDateBegin?: string | null;
  applicationDateEnd?: string | null;
  tournamentCode?: string | null;

  /** @format int32 */
  cardStatus?: number;
  applicationStatus_Name?:string;
  serviceCentreCode?: string | null;
}

export interface MoiEhterazValidationRequest {
  qid?: string | null;

  /** @format date-time */
  qidCardExpiryDate?: string;

  /** @format date-time */
  birthDate?: string;
  natCode?: string | null;
}

export interface CustomerCardApplicationAllListRequest {
  channel?: number;
  cardStatus?: number;
  applicationDateBegin?: string | null;
  applicationDateEnd?: string | null;
  TournamentCode?: string | null;
  organization_Name?: string | null;
  cardStatus_Name?: string | null;
  applicationStatus?: number | CustomerCardApplicationApplicationStatus;
  applicationStatus_Name?: string | null;

  bulkGroupName?: string | null;
  submissionType_Name?: string | null;
  inAnyApplicationType?: string[] | null;
  inAnyDocType?: number[] | null;
  inAnyEventList?: string[] | null;
  inAnyApplicationStatus?: number[] | null;
  inAnyRefSerivceCenter?: string[] | null;
  inAnyRefRegSerivceCenter?: string[] | null;
  inAnyRefOrganization_Id?: number | number[] | null;
  inAnyBulkGroupName?: string[] | null;
  includeDraft?:boolean;
  inAnyCustomerCategoryCodes?: string[] | null;
  inAnyNationalityCodes?: string[] | null;
  moiErrorCode?: string | null;
}

export interface CustomerCardApplicationActionGetListRequest {
  /** @format int32 */
  actionType?: number | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  description?: string | null;
  agent_Name?: string | null;
  system_CreatedBy?: string | null;
  system_ModifiedBy?: string | null;
}

export interface CustomerCardApplicationActionGetListRequestPagingRequest {
  filter?: CustomerCardApplicationActionGetListRequest;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;
}

export interface CustomerCardApplicationActionGetListResponse {
  /** @format int32 */
  actionType: number;

  /** @format int64 */
  refApplication_Id: number;
  description?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  customerCardApplicationAction_RefSerivceCenter_Code_Name?: string | null;
  applicationNo?: string | null;
  fanIdNo?: string | null;
  isChildApplication?: boolean;
  refParentFanIdNo?: string | null;
  applicationStatus?: CustomerCardApplicationApplicationStatus;
  applicationStatus_Name?: string | null;

  /** @format int64 */
  refDocType_Id?: number | null;
  documentIdNo?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  refTicketNo?: string | null;
  ticketOrderId?: string | null;
  refSerivceCenter_Code?: string | null;
  secondName?: string | null;
  thirdName?: string | null;
  fourthName?: string | null;

  /** @format date-time */
  dateofBirth?: string | null;

  /** @format date-time */
  applicationDate?: string | null;
  phoneAreaCode?: string | null;
  phone?: string | null;
  refEvent_Code?: string | null;
  event_Name?: string | null;
  actionType_Name?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  agent_Name?: string | null;
}

export interface CustomerCardApplicationActionGetListResponsePagingResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: CustomerCardApplicationActionGetListResponse[] | null;
}

export interface EntryPermitHistoryRequest {
  fanIdNo?: string | null;
  applicationNo?: string | null;
}

export interface EntryPermitHistoryResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;
  data?: EntryPermitHistoryListObject[] | null;
}

export interface EntryPermitHistoryListObject {
  /** @format int64 */
  id?: number;

  /** @format date-time */
  system_CreatedOn?: string;
  isSent?: boolean;

  /** @format date-time */
  system_ModifiedOn?: string;
  isActive?: boolean;
}

export interface EntryPermitStatusRequest {
  fanIdNo: string;
}

export interface EntryPermitStatusResponse extends BaseResponse {
  data: boolean;
}


export interface EntryPermitSendEmailRequest {
  fanIdNo?: string | null;
  applicationNo?: string | null;
  email?: string | null;
}

export type TICAODocumentInformation =
  Pick<CustomerCardApplicationGetListResponse,
  "faceIDScore" | "icaoAndOcrError" | "docImageFront" | "docTypeId">

export interface IValidateEmailPhoneDocumentRequest {
  type: string;
  email?: string | null;
  phone?: string | null;
  documentNo?: string | null;
  eventcode: string;
  refNationality_Code?: string | null;
  fanIdNo?: string | null;
  customerCategoryCode?: string;
  /** @format int64 */
  draftId?: number | null;
  userCategoryCode?: string;
  conferenceEventId?: number;
}

export enum ESubmissionType {
  EXCEL = 1,
  MANUAL = 2,
  SC = 3,
  PACKAGE = 9,
  PACKAGE_EXCEL = 11
}

export enum ApplicationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  DataError = 4,
  RequestForCorrection = 5,
  Draft = 0,
  Cancelled = 6,
  Pending_Accommodation_Confirmation = 7,
  Pending_Verification = 9,
  Pending_Ticket_Verification = 11,
  Pending_Payment = 10,
  Pending_Entry_Visa = 12,
  CancellationInProgress = 14
}

// export class EhterazResponseData{
//   status?:boolean;
//   message?:string | null;
//   userStatus?:string | null;
//   qrColor?:string |null;
//   isVaccinated?:boolean;
// }

export interface SACSStatusResponse extends BaseResponse {
  data: SACSStatusResponseData;
}

export interface SACSStatusResponseData {
  /** @format int64 */
  refApplicatio_Id?: number | null;
  fanIdNo?: string | null;
  cardSerialNo?: string | null;
  uhf?: string | null;
  fanidStatus?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  isActive?: boolean;
}

export interface CustomerBorderEntryStatusResponse extends BaseResponse {
  data: CustomerBorderEntryStatusResponseData;
}

export interface CustomerBorderEntryStatusResponseData {
  emigration_Status?: string;
}

export interface IValidateHayyaAppCreateEligibilityRequest {
  docNum: string;
  docType: number;
  refNationalityCode: string;
  hayyaNo: string;
  fanIdNo: string;
  refCustomerCategoryCode: string;
  refRegUserCategoryCode: string;
  channel: number;
  refConferenceEvent_Id?: number;
}

export interface IValidateHayyaAppCreateEligibilityResponseData {
  returnVal: boolean;
  errorCode: string;
  errorMessage: string;
  responseData: string;
  correlationId: string;
  requestID: number;
  isDataError: boolean;
  isAPISuccess: boolean;
}

export interface IValidateHayyaAppCreateEligibilityResponse extends BaseResponse {
  data: IValidateHayyaAppCreateEligibilityResponseData;
}

export interface PaymentDetailsByFanIdResponse extends BaseResponse {
  data: PaymentDetailsByFanIdResponseData;
}

export interface PaymentDetailsByFanIdResponseData {
  id: number
  isActive: boolean
  system_RowVersion: string
  system_CreatedOn: string
  system_CreatedBy: string
  system_ModifiedOn: string
  system_ModifiedBy: string
  entityFirstState: any
  amount: number
  pun: string
  status: number
  statusMessage: string
  requestData: string
  responseData: string
  email: string
  reason: string
  transactionType: number
  transactionRequestType: number
  fanIdNo: string
  refApplication_Id: number
  liferayUserId: string
  transactionTime: string
  language: string
  isAnonymousUser: boolean
  serviceCallsCount: number
  referenceNo: string
  customerName: string
  channel: number
  cardType: number
  transactionId: string
  isRefunded: boolean
  refundedDate: string
  extendedData: string
  correlationId: string
  bulkGroupName: string
  applicationIdList: string
  isB2BPayment: boolean
  requestUserId: number
  refOrganizationId: number
}
