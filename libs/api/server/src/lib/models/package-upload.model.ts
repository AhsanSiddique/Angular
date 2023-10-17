export class PackageUploadRegistrationData {
  RefEvent_Code: string;
  RefRegUserCategory_Code?: string;
  RefApplicationType_Code: string;
  BulkGroupName: string;
  RefOrganization_Id: number;
  RefSystemUser_Id: number;
  file: File;
  IsTermsAndConditions: boolean;
  OptInMarketing: boolean;
  RefParentFanIdNo?: string;
  OrgGroupAccommodationAddress: string;
  RefCustomerCategory_Code?: string;
}

export class RequestFMandOCR{
  bulkGroupName: string;
  refEvent_Code: string;
  applicationNo: string;
  draftID: number;
}

export interface ResponseFMandOCR{
  importStatus?: boolean;
  customerCardApplication?: {
      firstName?:string;
      lastName?:string;
      profilePic?:string;
      docType_Name?:string;
      docSubType?:string;
      docImageFront?:string;
      docExpiryDate?:string;
  }
}

export interface ICAOFaceDetectionResponse {
  message: string,
  resultCode: number,
  resulCodeType: string,
  status: number,
  userErrorCode: string
}

export class QIDPersonalDetailsRequest {
  qid: string;
  birthDate: string;
  applicationNo: string;
  draftID: number;
}

export interface IPackageUploadExcelRegistrationRequest {
  RefEvent_Code: string;
  RefOrganization_Id: number;
  BulkGroupName: string;
  Channel?: number;
  DeliveryAddress?: string;
  RefSystemUser_Id?: number;
  file: File;
  OrgGroupAccommodationAddress?: string;
  RefRegUserCategory_Code: string;
}
