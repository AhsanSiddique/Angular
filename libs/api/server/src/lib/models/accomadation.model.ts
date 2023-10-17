import { BaseResponse, OrderByModel } from "./api.model";

export type TFilterColumnMap<T extends string> = Partial<{
  [key in T]: { title: string, type?: string, filter?: boolean, viewInTable?: boolean, nameKey?: T }
}>;

export type TAccommodationType = 1 | 2 | 3;
export type TOtherAccommodationStatus = 1 | 2 | 3;

export type IAccommodationCancellationListResponseObjectKey = keyof IAccommodationCancellationListResponseObject;
export type TPropertyGuestObjectKey = keyof IPropertyGuestObject;
export type IAccommodationAlternateObjectKey = keyof IAccommodationAlternateObject;
export type TAccommodationOtherGetListItemKey = keyof IAccommodationOtherGetListItem;


export interface IPropertyGuestGetListRequest {
  filter?: IPropertyGuestGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;

  /** @format int32 */
  timeZone?: number;
}

export interface IPropertyGuestGetListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: IPropertyGuestObject[] | null;
}

export interface IPropertyGuestObject {
  hostQID?: string | null;

  /** @format date-time */
  hostQIDExpiryDate?: string | null;

  /** @format int64 */
  hostId?: number | null;
  hostEmail?: string | null;
  hostFullName?: string | null;

  /** @format int64 */
  addressId?: number | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  address4?: string | null;
  property_Name?: string | null;
  guestDocumentNumber?: string | null;
  fanIdNo?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  isAccommodationVerified?: boolean | null;

  /** @format date-time */
  accommodationVerificationDate?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  guestNationality_Name?: string | null;
  guestNationality_Code?: string | null;
  guestId?: number | null;
}

export interface IPropertyGuestGetListRequestFilter {
  hostQID?: string | null;
  hostQIDExpiryDate?: string | null;

  /** @format int64 */
  hostId?: number | null;
  hostEmail?: string | null;
  hostFullName?: string | null;

  /** @format int64 */
  addressId?: number | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  address4?: string | null;
  property_Name?: string | null;
  guestDocumentNumber?: string | null;
  fanIdNo?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  isAccommodationVerified?: boolean | null;
  accommodationVerificationDate?: string | null;
}

export interface IAccommodationCancellationGetListRequest {
  filter?: IAccommodationCancellationGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;

  /** @format int32 */
  timeZone?: number;
}

export interface IAccommodationCancellationGetListRequestFilter {
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;
  expectedCheckInDate?: string | null;
  expectedCheckOutDate?: string | null;
  bookingStatus?: string | null;
  bookingCancellationDate?: string | null;
  mainGuest?: boolean | null;
  emailAddress?: string | null;
  cancellationType?: TAccommodationType;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  accommodationType_Name?: string | null;
}

export interface IAccommodationCancellationListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: IAccommodationCancellationListResponseObject[] | null;
}

export interface IAccommodationCancellationListResponseObject {
  /** @format int64 */
  id?: number;
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;

  /** @format date-time */
  expectedCheckInDate?: string | null;

  /** @format date-time */
  expectedCheckOutDate?: string | null;
  bookingStatus?: string | null;

  /** @format date-time */
  bookingCancellationDate?: string | null;
  mainGuest?: boolean | null;
  emailAddress?: string | null;
  accommodationType?: TAccommodationType;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  hayyaNo?: string | null;

  /** @format byte */
  system_RowVersion?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  accommodationType_Name?: string | null;
}

export interface IAccommodationAlternateGetListRequest {
  filter?: IAccommodationAlternateGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;

  /** @format int32 */
  timeZone?: number;
}

export interface IAccommodationAlternateGetListRequestFilter {
  /** @format int64 */
  id?: number | null;
  accommodationType?: TAccommodationType;
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;
  bookingStatus?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  expectedCheckInDate?: string | null;
  expectedCheckOutDate?: string | null;
  bookingCancellationDate?: string | null;
  mainGuest?: boolean | null;
  emailAddress?: string | null;
  cancellationDate?: string | null;
  riskStatus?: string | null;
  accommodationType_Name?: string | null;
  guestEmail?: string | null;
  fullName?: string | null;
  liferayUserId?: string | null;
}

export interface IAccommodationAlternateGetListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: IAccommodationAlternateObject[] | null;
}

export interface IAccommodationAlternateObject {
  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  accommodationType?: TAccommodationType;
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;
  bookingStatus?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  hayyaNo?: string | null;

  /** @format date-time */
  expectedCheckInDate?: string | null;

  /** @format date-time */
  expectedCheckOutDate?: string | null;

  /** @format date-time */
  bookingCancellationDate?: string | null;
  mainGuest?: boolean;
  emailAddress?: string | null;

  /** @format date-time */
  cancellationDate?: string | null;
  riskStatus?: string | null;
  accommodationType_Name?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  customer_Email?: string | null;
  customer_FirstName?: string | null;
  customer_LastName?: string | null;
  customer_FullName?: string | null;

  /** @format date-time */
  accommodationVerificationDate?: string | null;
  address1?: string | null;
  address2?: string | null;
  address3?: string | null;
  address4?: string | null;
  property?: string | null;

  /** @format int64 */
  hostId?: number;

  /** @format int64 */
  guestId?: number;
  guestEmail?: string | null;

  /** @format int64 */
  addressId?: number;
  hostQID?: string | null;
  fullName?: string | null;
  liferayUserId?: string | null;
  aA_Address1?: string | null;
  aA_Address2?: string | null;
  aA_Address3?: string | null;
  aA_Address4?: string | null;
  property_Name?: string | null;
  propertyImageId?: string | null;
  propertyImageLocalPath?: string | null;

}

export interface IAccommodationOtherGetListRequest {
  filter?: IAccommodationOtherGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;

  /** @format int32 */
  timeZone?: number;

  /** @format int32 */
  maxRecordsLimit?: number;
}

export interface IAccommodationOtherGetListRequestFilter {
  accommodationType?: TAccommodationType;
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;
  bookingStatus?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  emailAddress?: string | null;
  accommodationType_Name?: string | null;
  customer_Email?: string | null;
  customer_FullName?: string | null;
  customer_FirstName?: string | null;
  customer_LastName?: string | null;
  accommodationVerificationDate?: string | null;
  accommodationVerificationDateBegin?: string | null;
  accommodationVerificationDateEnd?: string | null;
  address?: string | null;
  accommodationFileId?: string | null;
  localFilePath_Accommodation?: string | null;
  accommodation_FileName?: string | null;
  accommodation_FileSize?: string | null;
  otherAccommodationStatus?: TOtherAccommodationStatus;
  documentIdNo?: string | null;
  rejectReason?: string | null;
  departureCountry_Name?: string | null;
  departureCountryCode?: string | null;

  /** @format date-time */
  accommodationStartDate?: string | null;

  /** @format date-time */
  accommodationEndDate?: string | null;
  accommodationName?: string | null;
}

export interface IAccommodationOtherGetListResponse {
  message?: string | null;
  resultCode?: number;
  resulCodeType?: string | null;
  status?: number;
  userErrorCode?: string | null;
  userPod?: string | null;
  apiqResponseTime?: string | null;

  /** @format int64 */
  totalCount?: number;
  dataList?: IAccommodationOtherGetListItem[] | null;
}

export interface IAccommodationOtherGetListItem {
  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  accommodationType?: TAccommodationType;
  bookingRefNumber?: string | null;
  bookingRefDoumentNumber?: string | null;
  bookingStatus?: string | null;

  /** @format int64 */
  refApplication_Id?: number | null;
  fanIdNo?: string | null;
  hayyaNo?: string | null;

  /** @format date-time */
  expectedCheckInDate?: string | null;

  /** @format date-time */
  expectedCheckOutDate?: string | null;
  accommodationType_Name?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  customer_Email?: string | null;
  customer_FirstName?: string | null;
  customer_LastName?: string | null;
  customer_FullName?: string | null;

  /** @format date-time */
  accommodationVerificationDate?: string | null;
  accommodationFileId?: string | null;
  localFilePath_Accommodation?: string | null;
  accommodation_FileName?: string | null;
  accommodation_FileSize?: string | null;
  otherAccommodationStatus?: TOtherAccommodationStatus;
  otherAccommodationStatus_Name?: string | null;
  accommodationFilePdfBase64?: string | null;
  documentIdNo?: string | null;
  rejectReason?: string | null;
  departureCountry_Name?: string | null;
  address?: string | null;
  departureCountryCode?: string | null;

  /** @format date-time */
  accommodationStartDate?: string | null;

  /** @format date-time */
  accommodationEndDate?: string | null;
  accommodationName?: string | null;
  otherAccommodationCategory_Name?: string | null;
  otherAccommodationCategory?: number | null;
}

export interface IUpdateGuestDetailsRequest {
  id: number;
  guestDocumentNumber: string;
  guestNationality_Code: string;
}

export interface IUpdateHostEmailRequest {
  hostId: number;
  applicationEmail: string;
}

export type AccommodationOtherHistoryGetListRequest = IAccommodationOtherGetListRequest;

export interface AccommodationOtherHistoryGetListItem {
  liferayUserID?: string | null;
  msadguid?: string | null;
  fanIdNo?: string | null;
  address?: string | null;
  accommodationFileId?: string | null;
  accommodation_FileName?: string | null;
  accommodation_FileSize?: string | null;
  otherAccommodationCategory?: number;
  departureCountryCode?: string | null;

  /** @format date-time */
  accommodationStartDate?: string | null;

  /** @format date-time */
  accommodationEndDate?: string | null;
  accommodationName?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  rejectReason?: string | null;
  otherAccommodationStatus?: number;
  otherAccommodationStatus_Name?: string | null;
  localFilePath_Accommodation?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  /** @format date-time */
  dateofBirth?: string | null;
  applicationStatus_Name?: string | null;
  applicationStatus?: number;
  refNationality_Code?: string | null;
  nationality_Name?: string | null;
  applicationNo?: string | null;

  /** @format int64 */
  refDocType_Id?: number | null;
  documentIdNo?: string | null;
  docType_Name?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  otherAccommodationCategory_Name?: string | null;
  departureCountry_Name?: string | null;
  hayyaNo?: string | null;
  isFromOterAcc?: boolean;

  /** @format date-time */
  dateOfSubmitted?: string | null;
  customer_Email?: string | null;
  customer_FullName?: string | null;

  /** @format date-time */
  accommodationVerificationDate?: string | null;
}
