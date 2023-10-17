export class Events {
    id: string;
    name: string;
}
export class Organizations {
    id: string;
    name: string;
}
export class ServieCentres {
    id: string;
    name: string;
}
export class UploadExcelwithData {
  RefEvent_Code: string;
  RefCardDeliveryType_Code :string;
  RefSerivceCenter_Code:string;
  DocSubType:string;
  RefOrganization_Id :number;
  BulkGroupName:string;
  Channel:number;
  DeliveryAddress:string;
  RefSystemUser_Id:string;
  file:File;
  OrgGroupAccommodationAddress:string;
}
export class ImportHeaderInfo {
    eventname: string;
    organizationname: string;
    bulkgroupname: string;
    uploadzipfile: File;
    deliverytype: string;
    servicecentre: string;
}
export class BulkImportData {
    id: number;
    uploadstatus: string;
    firstName: string;
    lastName: string;
    profilepic: string;
    idtype: string;
    document: string;
    expirydate: Date;
    expirystatus: string;
    email: string;
    countrycode: number;
    contactno: number;
    gender: string;

}

export class SubmissionStatus{
    submittedRecords:number;
    failedRecords:number
}

export interface BulkGroupsRequest {
  /** @format int64 */
  refOrganization_Id?: number;
  bulkGroupName?: string | null;
  refTournament_Code?: string | null;
}

export enum EPackageUploadZip {
    PackageQid = 1,
    PackagePassport = 2,
    PackageQidYouth = 3,
    PackagePassportYouth = 4
}
