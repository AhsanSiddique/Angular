export interface IVerifyAccommodationItem {
  liferayUserID: string
  msadguid: string
  fanIdNo: string
  address: string
  accommodationFileId: string
  accommodation_FileName: string
  accommodation_FileSize: string
  accommodationFilePdfBase64: string
  id: number
  system_RowVersion: string
  otherAccommodationStatus_Name: string
  localFilePath_Accommodation: string
  firstName: string
  lastName: string
  dateofBirth: string
  applicationStatus_Name: string
  refNationality_Code: string
  nationality_Name: string
  applicationNo: string
  documentIdNo: string
  docType_Name: string
  system_CreatedOn: string
  system_CreatedBy: string
  system_ModifiedOn: string
  system_ModifiedBy: string
  otherAccommodationCategory_Name: string
  accommodationName: string
  accommodationStartDate: string
  accommodationEndDate: string
  departureCountryCode: string
  departureCountry_Name: string
  dateOfSubmitted: string
}

export enum EAccommodationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3
}

export interface IUpdateAccommodationStatusRequest {
  fanIdNo: string
  OtherAccommodationStatus: EAccommodationStatus
  rejectReason?: string
}
