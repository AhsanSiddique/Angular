import { BaseResponse, OrderByModel } from "./api.model";

export interface OrganizationGetListRequest {
  filter?: OrganizationGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;
}

export interface OrganizationGetListRequestFilter {
  organizationId?: string | null;
  name?: string | null;
  email?: string | null;
  phoneAreaCode?: string | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  zipCode?: string | null;
  description?: string | null;

  /** @format int32 */
  maximumVoucherCount?: number | null;
  isVoucherGenerationEnabled?: boolean | null;
  contactName?: string | null;
}

export interface OrganizationGetListResponseData {
  organizationId?: string | null;
  name?: string | null;
  email?: string | null;
  phoneAreaCode?: string | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  addressLine3?: string | null;
  zipCode?: string | null;
  description?: string | null;
  organizationLogoImageBlob?: string | null;
  requesterEmailId?: string | null;
  voucherCategoryName?: string | null
  /** @format int32 */
  maximumVoucherCount?: number | null;
  isVoucherGenerationEnabled?: boolean | null;
  contactName?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  countryName?: string | null;
  maximumApplicantCount?: number | null;
  remainingApplicant?: number | null;
  status?: string | null;
  statusValue?: number | null;
  organizationCategory?: string;
  regUserCategories?: string;
  signupId?: number | null;
  refVoucherCategory_Id?: number | null;
  conferenceEvents?:string;
  customerCategories?:string;
}

export interface OrganizationGetListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: OrganizationGetListResponseData[] | null;
}

export interface OrganizationUserGetListRequest {
  filter?: OrganizationUserGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;
}

export interface OrganizationUserGetListRequestFilter {
  firstNameOrLastName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  email?: string | null;
  dialingCode?: string | null;
  mobilePhone?: string | null;
  organizationName?: string | null;
  userType?: string | null;
  refOrganization_Id?: number | null;
}

export interface OrganizationUserGetListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: OrganizationUserGetListResponseData[] | null;
}

export interface OrganizationUserGetListResponseData {
  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userName?: string | null;
  email?: string | null;
  dialingCode?: string | null;
  mobilePhone?: string | null;
  organizationName?: string | null;
  userType?: string | null;
}

export interface IOrgSignupOrgAddUserInvitationRequest {
  orgId: number;
  email: string;
  accessType: number;
  newAccessType?: number;
}

export interface ActiveConferenceEventListResponse extends BaseResponse {
  data: ActiveConferenceEventListResponseData;
}

export interface ActiveConferenceEventListResponseData {
  conferenceEventLists: ActiveConferenceEvent[];
}

export interface ActiveConferenceEvent {
  code: string;
  confrenceId: number;
  name_EN: string;
  isEnabled: boolean;
  categories: string;
  conferenceType: EConferenceType | null;
  isAccreditation: boolean;
  moi_ServiceId: string;
}

enum EConferenceType {
  Public = 1,
  Private = 2
}

export interface OrganizationConferenceEvent {
  id: number,
  isActive: boolean,
  refConferenceEvent_Id: number,
  system_RowVersion: string,
}

export interface OrganizationCustomerCategory {
  id: number,
  isActive: boolean,
  refCustomerCategory_Id: number,
  system_RowVersion: string,
}

export interface MetadataCustomerCategoryListResponse extends BaseResponse {
  data: MetadataCustomerCategoryListResponseData;
}

export interface MetadataCustomerCategoryListResponseData {
  customerCategory: MetadataCustomerCategory[];
}

export interface MetadataCustomerCategory {
  code: string,
  id: number,
  name: string,
  isEnabled: boolean,
}

export interface ConferencesByCodeResponse extends BaseResponse {
  data: ConferencesByCodeResponseData;
}

export interface ConferencesByCodeResponseData {
  profileResponse?: ConferenceEventProfileResponse[] | null;
}

export interface ConferenceEventProfileResponse {
  belongings?: ConferenceEventBelongings;
  companyARName?: string | null;
  companyBranchNumber?: string | null;
  companyENName?: string | null;
  companyNumber?: string | null;
  companyType?: string | null;
  zones?: ConferenceEventZones;
  categories?: ConferenceEventCategories;
  profileId?: string | null;
  profileArName?: string | null;
  profileEnName?: string | null;
  services?: ConferenceEventServices;
  organizations: ConferenceEventOrganizations;
  venues: ConferenceEventVenues;
  visaOnly?: boolean;
}

export interface ConferenceEventBelongings {
  belonging?: ConferenceEventBelonging[];
}

export interface ConferenceEventBelonging {
  arDesc?: string | null;
  enDesc?: string | null;
  id?: string | null;
}

export interface ConferenceEventZone {
  arDesc?: string | null;
  arShortDesc?: string | null;
  enDesc?: string | null;
  enShortDesc?: string | null;
  id?: string | null;
}

export interface ConferenceEventZones {
  zone?: ConferenceEventZone[] | null;
}

export interface ConferenceEventCategories {
  category?: ConferenceEventCategory[] | null;
}

export interface ConferenceEventCategory {
  arDesc?: string | null;
  enDesc?: string | null;
  id?: string | null;
  code?: string | null;
  functionsList?: ConferenceEventCategoryFunctionsList
}

export interface ConferenceEventCategoryFunctionsList {
  function: ConferenceEventCategoryFunction[]
}

export interface ConferenceEventCategoryFunction {
  arDesc: string;
  enDesc: string;
  id: string;
  code: string;
}

export interface ConferenceEventService {
  arDesc?: string | null;
  enDesc?: string | null;
  id?: string | null;
}

export interface ConferenceEventServices {
  service?: ConferenceEventService[] | null;
}

export interface ConferenceEventOrganizations {
  organization: ConferenceEventOrganization[]
}

export interface ConferenceEventOrganization {
  englishName: string
  id: string
}

export interface ConferenceEventVenues {
  venue: ConferenceEventVenue[]
}

export interface ConferenceEventVenue {
  arDesc?: string | null;
  enDesc?: string | null;
  id?: string | null;
}

export interface ConferenceApplicationRulesListResponse extends BaseResponse {
  data?: ConferenceApplicationRulesListResponseData;
}

export interface ConferenceApplicationRulesListResponseData {
  responseData?: ConferenceApplicationRules[] | null;
}

export interface ConferenceApplicationRules {
  /** @format int64 */
  id?: number;
  isActive?: boolean;

  /** @format byte */
  system_RowVersion?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  serviceBusinessRules?: string | null;
  serviceFieldDataTypeDesc?: string | null;
  serviceFieldDisplayTypeDesc?: ServiceFieldDisplayTypeDesc;
  serviceFieldMandatoryDesc?: ServiceFieldMandatoryDesc;
  serviceFieldNameDesc?: ConferenceServiceFieldName;
  serviceFieldSelectionTypeDesc?: ServiceFieldSelectionTypeDesc;

  /** @format int64 */
  refConfrenceId?: number;
  refMoiServiceId?: string | null;
  status?: boolean;
}

const ConferenceServiceFieldNames = [
  'zones',
  'belongings',
  'category',
  'organizationCode',
  'organization',
  'organizationAr',
  'functionCode',
  'function',
  'functionAr',
  'venues',
  'representingCountryCode',
  'titleEN',
  'titleAR',
] as const;

export type ConferenceServiceFieldName = typeof ConferenceServiceFieldNames[number];

export enum ServiceFieldSelectionTypeDesc {
  Empty = "",
  MultiSelection = "Multi Selection",
  SingleSelection = "Single Selection",
}

export type ServiceFieldDisplayTypeDesc = 'Input' | 'List';
export type ServiceFieldMandatoryDesc = 'Mandatory' | 'Optional';
