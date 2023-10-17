import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { EMPTY, Observable, combineLatest } from 'rxjs';
import { catchError, map, startWith, take } from 'rxjs/operators';
import { checkPassportDateOfBirthBelowYear, isNgbDateGreaterThanToday, validateDateOfExpiry } from "@fan-id/shared/utils/date";
import {
  ActiveConferenceEvent,
  ActiveConferenceEventListResponse,
  ConferenceServiceFieldName,
  MetadataCustomerCategory,
  MetadataResolve,
  TMetaDataLookupKeys,
  TMetadataResolveKeys,
  TNationalityLookupKeys
} from '@fan-id/api/server';
import { getFromLocalStorage, parseJSON } from '@fan-id/shared/utils/common';

export enum EPassportCategory {
  TRAVELDOCUMENT = 'TRAVEL DOCUMENT',
}
export const passportOCR_Category_MAP = {
  PR: EPassportCategory.TRAVELDOCUMENT
}

export function fileTypeValidator(allowedTypes: string[], errorMessage: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const file = control.value;
    const fileType = file.type;
    return allowedTypes.includes(fileType) ? null : { invalidFileType: {
      allowedTypes,
      fileType,
      errorMessage,
    } };
  };
}

export function fileSizeValidator(maxSize: number, errorMessage: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const file = control.value;
    const fileSize = file.size;
    return fileSize <= maxSize ? null : { invalidFileSize: {
      maxSize,
      fileSize,
      errorMessage,
    } };
  };
}

export function fileNamePatternValidator(pattern: RegExp, errorMessage: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const file = control.value;
    const fileName = file.name;
    return pattern.test(fileName) ? null : { invalidFileNamePattern: {
      errorMessage,
      fileName,
    } };
  };
}

function matchTicketHolderValidation(group: AbstractControl): ValidationErrors | null {
  const applicationForm = group.get('applicationForm');
  const personalInfoForm = group.get('personalInfoForm');
  const fan_category = applicationForm.get('fan_category').value;
  if(fan_category !== 'MTH') return null;
  const match_ticket_holder_fields = ['ticket_reference_number', 'order_id'];

  for(const field of match_ticket_holder_fields) {
    if(personalInfoForm.get(field).value) {
      return null;
    }
  }

  return { MTHRequired: true }
}

function voucherValidation(group: AbstractControl): ValidationErrors | null {
  const applicationForm = group.get('applicationForm');
  const personalInfoForm = group.get('personalInfoForm');
  const fan_category = applicationForm.get('fan_category').value;
  const voucher_code = personalInfoForm.get('voucher_code').value;
  if(fan_category !== 'MIH' || voucher_code) return null;
  return { VoucherRequired: true }
}

export function emergencyContactValidation(group: AbstractControl): ValidationErrors | null {
  const phonecode = group.get('phonecode').value;
  const mobile = group.get('mobile').value;
  const contactcode = group.get('contactcode').value;
  const contactnumber = group.get('contactnumber').value;
  if(!mobile || !contactnumber || (((phonecode ?? '') + mobile) !== ((contactcode ?? '') + contactnumber)))
    return null;
  return { invalidContactNumber: true }
}

export function patchOCRfield({value, field, disable = true}: {value: any, field: AbstractControl, disable?: boolean}): void {
  field.patchValue(value ?? null);
  field.markAsTouched();
  disable && field.disable();
}

export function resetPatchedOCRfield(field: AbstractControl) {
  field.patchValue(null);
  field.markAsUntouched();
  field.enable();
}

export function onUniqueFieldBlur(control: AbstractControl, service$: Observable<any>, errorCode = 'notUnique') {
  service$
    .pipe(take(1), catchError(err => {
      console.log({err})
      control.setErrors({ [errorCode]:true });
      return EMPTY
    }))
    .subscribe({
      next: response => {
        if (control.hasError(errorCode)) return;
        if (response?.status !== 200) {
          control.setErrors({ [errorCode]:true });
        }
      }
    })
}

export function onUniqueFieldFocus(control: AbstractControl) {
  if ( control.hasError('notUnique') ) {
    const { notUnique, ...errors } = control.errors;
    control.setErrors(errors);
    control.updateValueAndValidity();
  }
}

export function removeControlError(control: AbstractControl, error: string) {
  if ( control.hasError(error) ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [error]: _error, ...errors } = control.errors;
    control.setErrors(errors);
    control.updateValueAndValidity();
  }
}

function doc_expiry(doc_type: number,app_type:string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if(!control.value) return null;
    const isDocExpiryValid = doc_type === 3 ? validateDateOfExpiry(control.value) : isNgbDateGreaterThanToday(control.value,app_type)
    if(isDocExpiryValid) return null;
    return { invalidDocExpiry: true }
  }
}

export function getPassportOCRCategory(passport_type: string): string {
  return passportOCR_Category_MAP[passport_type]
}

interface IFilterFromMetadataResolveParams {
  list_key: TMetadataResolveKeys,
  key: TMetaDataLookupKeys | TNationalityLookupKeys,
  values: any[],
  filter_out: boolean
}
export function filterFromMetadataResolve({list_key, key, values, filter_out}: IFilterFromMetadataResolveParams) {
  const predicate = (obj) => {
    const isIncluded = values.includes(obj[key]);
    return filter_out ? !isIncluded : isIncluded;
  };
  return (metadata: MetadataResolve) => {
    const { [list_key]: list, ...rest } = metadata;
    const filtered_list = list.filter(predicate);
    return { ...rest, [list_key]: filtered_list } as MetadataResolve;
  }
}

export function maxLinesValidator(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
      const exceeded = control.value.length && control.value.split('\n').length > limit;
      return exceeded ? { maxLines: limit } : null;
  };
}

export function getICAOTableData({
  icaoAndOcrError,
  docTypeId,
  faceIDScore,
  dateofBirth,
  applicationDate
}) {
  const isBelow10 = checkPassportDateOfBirthBelowYear(dateofBirth, 10, applicationDate);
  const isFaceMatchNotAvailable = docTypeId === 1 || isBelow10;

  let _icaoAndOcrError = icaoAndOcrError ? parseJSON(icaoAndOcrError) : null;
  const faceMatchScoreRow = {
    message: "Face Match Score",
    score: !isFaceMatchNotAvailable ? faceIDScore : 'N/A',
    criteria: !isFaceMatchNotAvailable ? `${MIN_FACE_MATCH_SCORE}-100`: 'N/A',
    Status: '0'
  }
  if (!isFaceMatchNotAvailable) {
    if (faceIDScore >= MIN_FACE_MATCH_SCORE) {
      faceMatchScoreRow.Status = '1';
    }
  } else {
    faceMatchScoreRow.Status = '-1';
  }
  if (_icaoAndOcrError?.icao) {
    _icaoAndOcrError.icao = _icaoAndOcrError.icao.sort((a, b) => +(a.Status) - +(b.Status));
    _icaoAndOcrError.icao.unshift(faceMatchScoreRow);
  } else {
    _icaoAndOcrError = {icao: [faceMatchScoreRow]};
  }
  return _icaoAndOcrError;
}

export function getAllowedUserCategories(): {id: number, code: string}[] {
  const _categories = localStorage.getItem('organizationRegUserCategoryIdAndCode');
  if (!_categories) return [];
  try {
    return JSON.parse(_categories);
  } catch (error) {
    console.log(error);
    return [];
  }
}
interface IGetMetadataFilteredByUserCategoryParams {
  metadata$: Observable<MetadataResolve>,
  // filterYTH?: boolean,
  filterDefaults?: string[] | null
  userCategoryCodes?: string[],
  filter_out?: boolean
}

export function getMetadataFilteredByUserCategory({
  metadata$,
  filterDefaults = ['YTH', 'SFP'],
  userCategoryCodes,
  filter_out = false
}: IGetMetadataFilteredByUserCategoryParams) {
  let allowedUserCategoryCodes = getAllowedUserCategories()
    .map(({ code }) => code);
  if (filterDefaults?.length) {
    allowedUserCategoryCodes = allowedUserCategoryCodes.filter(code => !filterDefaults.includes(code));
  }
  const values = userCategoryCodes ?? allowedUserCategoryCodes;
  return metadata$.pipe(map(
    filterFromMetadataResolve({
      list_key: 'user_categories',
      key: 'code',
      values,
      filter_out
    })
  ));
}

export const registrationFormValidators = { doc_expiry }
export const personalInfoValidators: ValidatorFn[] = [matchTicketHolderValidation, voucherValidation];
export const FORM_PLACEHOLDERS = {
  phonecode: "+974",
  mobile: '777777'
}
// #region ticket-information
export enum EValidateAPIType {
  TICKET = 'ticket',
  VOUCHER = 'voucher',
  HAYYA_VOUCHER = 'hayyaVoucher',
  MATCH_HOSPITALITY ='hospitality_number'
}
export enum ETicketField {
  TICKET_ORDER_ID = 'ticketOrderId',
  VOUCHER_CODE = 'voucherCode',
  MATCH_HOSPITALITY = 'matchHospitality',
}
export interface ITicketType {
  name: string;
  code: string;
  ticketRequired?: boolean;
  validateAPIType?: EValidateAPIType;
  ticketField?: ETicketField;
  ticketLabel?: string;
  isVisaType?: boolean;
  isGCC?: boolean;
  visaCopyRequired?: boolean;
  jobTitleRequired?: boolean;
  purposeOfVisitExcluded?: boolean;
  removeGCC?: boolean;
}

export const TicketTypes: ITicketType[] = [
  {
    name: "Client Group Guest",
    code: "CG",
  },
  {
    name: "Match Ticket Holder",
    code: "MTH",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.TICKET,
    ticketField: ETicketField.TICKET_ORDER_ID,
    ticketLabel: "Application Number"
  },
  {
    name: "Match Voucher Holder",
    code: "MIH",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.VOUCHER,
    ticketField: ETicketField.VOUCHER_CODE,
    ticketLabel: "Voucher Code"
  },
  {
    name: "IFES Registration Only",
    code: "IFESRO",
  },
  {
    name: "IFES Full Service",
    code: "IFESFS",
  },
  {
    name: "HH Name",
    code: "HHH",
  },
  {
    name: "VIP",
    code: "VIP",
  },
  {
    name: "LO",
    code: "LOI",
  },
  {
    name: "Match Hospitality",
    code: "MHO",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.TICKET,
    ticketField: ETicketField.MATCH_HOSPITALITY,
    ticketLabel: "Match Hospitality Order Number"
  },
  {
    name: "Accredited Personnel (FIFA)",
    code: "ACP",
  },
  {
    name: "Accredited Personnel (HC)",
    code: "APH",
  },
  {
    name: "VMC",
    code: "VMC",
  },
  {
    name: "Voucher (Entourage)",
    code: "MVEH",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.VOUCHER,
    ticketField: ETicketField.VOUCHER_CODE,
    ticketLabel: "Voucher Code"
  },
  {
    name: "Lusail Super Cup",
    code: "LSC",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.TICKET,
    ticketField: ETicketField.TICKET_ORDER_ID,
    ticketLabel: "Application Number"
  },
  {
    name: "Hayya with Me Voucher",
    code: "HWM",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.HAYYA_VOUCHER,
    ticketField: ETicketField.VOUCHER_CODE,
    ticketLabel: "Voucher Code"
  },
  {
    name: "Early December Hayya (Non Ticketed)",
    code: "NMTH"
  },
  {
    name: "Hayya with Me (C)",
    code: "NHWM",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.HAYYA_VOUCHER,
    ticketField: ETicketField.VOUCHER_CODE,
    ticketLabel: "Voucher Code",
    isVisaType: true,
    purposeOfVisitExcluded: true,
  },
  {
    name: "Conferences and Events Visa (B)",
    code: "CNF",
    ticketRequired: true,
    validateAPIType: EValidateAPIType.HAYYA_VOUCHER,
    ticketField: ETicketField.VOUCHER_CODE,
    ticketLabel: "Voucher Code",
    isVisaType: true,
    purposeOfVisitExcluded: true,
  },
  {
    name: "Tourist Visa (A1)",
    code: "GNT",
    isVisaType: true,
    removeGCC: true
  },
  {
    name: "Visa with ETA (A3)",
    code: "WVE",
    isVisaType: true,
    visaCopyRequired: true,
  },
  {
    name: "GCC Resident Visa (A2)",
    code: "GCCR",
    isVisaType: true,
    isGCC: true,
    jobTitleRequired: true,
  },
  {
    name: "Visa for Companion of the GCC Citizen (A4)",
    code: "GCCN",
    isVisaType: true,
    isGCC: true,
  }
]
export const HiddenTicketTypeCodes = ['CG', 'LSC', 'APH', 'HHH', 'VIP', 'LOI', 'VMC', 'IFESRO', 'IFESFS','MTH','MVEH','MHO','ACP','NMTH','HWM','MIH'];
export const TICKETTYPE_FANCATEGORY_MAP = {
  voucher_code: 'MIH',
  hospitality_number: 'MHO',
  order_id: 'MTH',
  // ticket_number: 'MTH',
  acc_person_fifa: 'ACP',
  acc_person_host: 'APH',
  lsc: 'LSC',
  vip: 'VIP',
  IFESFS: 'IFESFS',
  IFESRO: 'IFESRO',
} as const;
export type TicketCode = keyof typeof TICKETTYPE_FANCATEGORY_MAP;
export type TTicketCustomerCategory = typeof TICKETTYPE_FANCATEGORY_MAP[TicketCode];
export const TICKET_CUSTOMER_CATEGORIES_WITH_NO_TICKETS: TTicketCustomerCategory[] = [
  'ACP', 'APH', 'IFESFS', 'IFESRO'
];
//#endregion
export const MIN_FACE_MATCH_SCORE = 35;
export const ACCOMMODATION_DETAILS_VALIDATORS = [
  Validators.required,
  Validators.maxLength(120),
  maxLinesValidator(5)
]
export const INVALID_USER_CATEGORIES_CODE_FOR_QID = [];
export const INVALID_USER_CATEGORIES_CODE_FOR_NON_QID_PACKAGE_UPLOAD = ['SFP'];
export const EXCEL_USER_CATEGORIES_CODE_FOR_PACKAGE_UPLOAD = ['SFP', 'LSC'];
export const TICKET_FORM_DISABLED_CHANNELS = [64, 512, 1024, 2048];

export interface IFormExtras {
  applicationType?: TApplicationType;
  manualUpload?: boolean;
  b2bVisaType?: B2BVisaType;
  conferenceType?: ConferenceType;
  accreditationPersonalTitleHasServiceRule?: boolean;
  accreditationPersonalTitleRequired?: boolean;
}

export type B2BVisaType = ReturnType<typeof getB2BVisaType>;
export type ConferenceType = ReturnType<typeof getConferenceType>;

export function getFormExtras(form: FormGroup): IFormExtras {
  return form?.value.extras || {};
}

export function updateFormExtras(form: FormGroup, extras: Partial<IFormExtras>) {
  form.patchValue({ extras: { ...getFormExtras(form), ...extras } });
}

export function isCountryGCC(countryCode: string) {
  return ['SA', 'BH', 'KW', 'OM', 'AE'].includes(countryCode);
}

export const oldCategories = [
  "MTH",
  "CG",
  "MIH",
  "IFESFS",
  "IFESRO",
  "MHO",
  "VMC",
  "LSC",
  "MVEH",
  "ACP",
  "APH",
  "VIP",
  "HWM",
  "NMTH",
  'NHWM'
] as const;

export type TApplicationType = 'FWC' | 'VISA';

export function getApplicationType(category: string) {
  if (!category) return null;
  if ((oldCategories as unknown as string[]).includes(category)) return 'FWC';
  return 'VISA';
}

export const SchengenCountries = [
  "AT", // Austria
  "BE", // Belgium
  "HR", // Croatia
  "CZ", // Czech Republic
  "DK", // Denmark
  "EE", // Estonia
  "FI", // Finland
  "FR", // France
  "DE", // Germany
  "GR", // Greece
  "HU", // Hungary
  "IS", // Iceland
  "IT", // Italy
  "LV", // Latvia
  "LI", // Liechtenstein
  "LT", // Lithuania
  "LU", // Luxembourg
  "MT", // Malta
  "NL", // Netherlands
  "NO", // Norway
  "PL", // Poland
  "PT", // Portugal
  "SK", // Slovakia
  "SI", // Slovenia
  "ES", // Spain
  "SE", // Sweden
  "CH", // Switzerland
] as const;

export const invalidNationalitiesForA3Visa = [
  "US", // United States
  "GB", // United Kingdom
  "AU", // Australia
  "CA", // Canada
  "NZ", // New Zealand
  ...SchengenCountries
] as const;

export const hayyaCategoriesBR = [
  {
    name: "Conference Guest",
    code: "CFG",
    conferenceNameRequired: true,
  },
  {
    name: "Conference Organizer",
    code: "CFO",
    conferenceNameRequired: true,
  },
  // {
  //   name: "Private Conference Special Organizer",
  //   code: "PCFSO",
  //   conferenceNameRequired: true,
  // },
  {
    name: "Transit",
    code: "TRV",
    conferenceNameRequired: false,
  }
];

export type HayyaCategoryBR = typeof hayyaCategoriesBR[number];
export type HayyaCategoryCodeBR = HayyaCategoryBR['code'];

export function getB2BVisaType(category: HayyaCategoryCodeBR) {
  console.log({ category })
  if (!category) return null;
  if (category === 'TRV') return 'TRANSIT';
  if (category === 'NCNF') return 'CONFERENCE';
  return 'VISA';
}

export function getConferenceType(conference: ActiveConferenceEvent) {
  if (conference?.isAccreditation) return 'PUBLIC';
  switch (conference?.conferenceType) {
    case 1:
      return 'NONE';
    case 2:
      return 'PRIVATE';
    default:
      return 'NONE';
  }
}

export const CATEGORIES_WITH_GCC_PERMIT_SC = ['GCCN', 'GCCR'] as const;

export interface JobTitle {
  code: string;
  name: string;
  nationalities: string;
}

export function setContactFormInitialValidators(f: FormGroup) {
  f.controls.phonecode.setValidators([Validators.required]);
  f.controls.mobile.setValidators([Validators.required, Validators.maxLength(15)]);
  f.controls.emergencyPhoneCode.setValidators([Validators.required]);
  f.controls.emergencyPhoneNumber.setValidators([Validators.required, Validators.maxLength(15)]);
}

export function getControlListValid$(controls: AbstractControl[]) {
  const sources = controls.map(c => c.statusChanges.pipe(startWith(c.status)))
  return combineLatest(sources).pipe(
    map(() => controls.every(c => c.valid || c.disabled))
  )
}

export function filterConferenceEventListByOrganization(response: ActiveConferenceEventListResponse) {
  const conferenceEventList = response?.data?.conferenceEventLists ?? [];
  const organizationConferenceList: { id: number, code: string }[] = getFromLocalStorage({
    key: "organizationConferenceEventIdAndCode",
    parse: true
  }) ?? [];
  return conferenceEventList.filter(conference => {
    return organizationConferenceList.map(({ id }) => id)
      .includes(conference.confrenceId);
  });
}

export function filterHayyaVisitCategoryByOrganization(response: MetadataCustomerCategory[]) {
  const customerCategoryList = response ?? [];
  const organizationCustomerCategoryList: { id: number, code: string }[] = getFromLocalStorage({
    key: "organizationCustomerCategoryIdAndCode",
    parse: true
  }) ?? [];
  return customerCategoryList.filter(category => {
    return organizationCustomerCategoryList.map(({ code }) => code)
      .includes(category.code);
  });
}

export const AccreditationProfileKeys = [
  'belongings',
  'categories',
  'functions',
  'function',
  'functionAr',
  'organizations',
  'organization',
  'organizationAr',
  'service_rules',
  'venues',
  'zones',
  'representing_country',
  'personal_title'
] as const;

export type AccreditationControlKey = `conference_${typeof AccreditationProfileKeys[number]}`;

export type AccreditationFormControls = Record<AccreditationControlKey, AbstractControl>;

export const ServiceFieldNameControlKeyMap: Partial<Record<ConferenceServiceFieldName, AccreditationControlKey>> = {
  belongings: 'conference_belongings',
  category: 'conference_categories',
  organizationCode: 'conference_organizations',
  organization: 'conference_organization',
  organizationAr: 'conference_organizationAr',
  zones: 'conference_zones',
  venues: 'conference_venues',
  functionCode: 'conference_functions',
  function: 'conference_function',
  functionAr: 'conference_functionAr',
  representingCountryCode: 'conference_representing_country',
  titleEN: 'conference_personal_title',
}

export function getAccreditationFormControls() {
  return AccreditationProfileKeys.reduce((acc, key) => {
    acc['conference_' + key] = new FormControl(null);
    return acc;
  }, {} as AccreditationFormControls)
}

export const RestrictedNationalitiesForHWM = [
  "EG", // Egypt
  "PK", // Pakistan
  "YE", // Yemen
  "SD", // Sudan
  "VN", // Vietnam
  "NG", // Nigeria
  "IN", // India
  "PS", // Palestine
  "JO"  // Jordan
] as const;


const SPECIAL_CHAR1_AR = '¦';
const QUESTION_MARK_EN = '?';
const QUESTION_MARK_AR = '؟';
const AR_NAME_MATCHER = /^[\u0621-\u064A\040]+$/;

function isNotValidArabicNamePattern(name: string) {
  const isValidArabicName =
  !name.includes(SPECIAL_CHAR1_AR) &&
  !name.includes(QUESTION_MARK_EN) &&
  !name.includes(QUESTION_MARK_AR) &&
  name.match(AR_NAME_MATCHER);

  return !isValidArabicName;
}

export function arabicNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const name = control.value;
    if (name && isNotValidArabicNamePattern(name)) {
      return { invalidArabicName: true };
    }
    return null;
  }
}

export const MASK_PATTERNS = {
  Arabic: { '0': { pattern: /[\u0621-\u064A]/ } },
  English: { '0': { pattern: /[a-zA-Z]/ } },
  ArabicWithSpaces: { '0': { pattern: /[ \u0621-\u064A\040]/ } },
  EnglishWithSpaces: { '0': { pattern: /[a-zA-Z ]/ } },
}
