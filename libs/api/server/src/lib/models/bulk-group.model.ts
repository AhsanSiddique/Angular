import { ApiResultCode, HttpStatusCode } from "./api.model";

export class BulkGroupOrg {
    id: string;
    name: string;
}
export class BulkGroupName {
    id: string;
    name: string;
}
export class BulkGroupFilter {
    organizationname: string;
    bulkgroupname: string;
}
export class BulkGroupData {
    organizationname: string;
    bulkgroupname: string;
    organizationid: number;
    address: string;
    telephoneno: number;
    email: string;
}
export class AllApplicationFilter {
    columnName: string;
    filteTxt: string;
}
export class AllApplicationData {
    applicationnumber: string;
    applicationstatus: string;
    approvalcomments: string;
    fanidnumber: string;
    documenttype: string;
    documentnumber: string;
    nationality: string;
    firstname: string;
    lastname: string;
    mobilenumber: string;
    gender: string;
    dateofbirth: string;
    profession: string;
    salary: string;
    submissiontype: string;
    fanidcarddetails: string;
}
export class columnName {
    id: number;
    name: string;
}

export interface CustomerCardApplicationGetListRequestByOrganization {
  eventCode: string;

  /** @format int64 */
  organizationId?: number | null;
  bulkGroupName?: string | null;
}

export interface EventGetStatisticsResponeDataResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;
  data?: EventGetStatisticsRespone;
}

export interface EventGetStatisticsRespone {
  /** @format int64 */
  total_Applied?: number;

  /** @format int64 */
  approved?: number;

  /** @format int64 */
  pending?: number;

  /** @format int64 */
  declined?: number;
}

export interface OrganizationGetByIdResponse {
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
  contactName?: string | null;

  /** @format int32 */
  maximumVoucherCount?: number | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
}

export interface OrganizationGetByIdResponseDataResponse {
  message?: string | null;
  resultCode?: ApiResultCode;
  resulCodeType?: string | null;
  status?: HttpStatusCode;
  data?: OrganizationGetByIdResponse;
}

export interface UpdateBulkGroupAccommodationDetailsRequest {
  bulkGroupName: string,
  refTournament_Code: string,
  orgGroupAccommodationAddress: string
}

export interface IGetListByBulkGroupNameResponseObject {
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

  /** @format int32 */
  maximumVoucherCount?: number | null;
  isVoucherGenerationEnabled?: boolean | null;
  contactName?: string | null;
  contactLastName?: string | null;

  /** @format int32 */
  maximumApplicantCount?: number | null;

  /** @format int64 */
  refCountry_Id?: number | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  bulkGroupName?: string | null;
  isBulkRegistrationDraft?: boolean;
  refSerivceCenter_Code?: string | null;
  serviceCenter_Name?: string | null;
  refRegUserCategory_Code?: string | null;
  refApplicationType_Code?: string | null;
  refParentFanIdNo?: string | null;

  /** @format int64 */
  maxNumberApplication?: number;

  /** @format date-time */
  bulkGroup_System_CreatedOn?: string | null;

  /** @format int64 */
  totalApplication?: number;
  submissionType_Name?: string | null;

  /** @format int64 */
  submissionType?: number;

  /** @format int64 */
  submittedToLiferayCount?: number;

  /** @format int64 */
  draftCount?: number;
  bgJobStatus_Name?: string | null;

  /** @format int64 */
  bgJobStatus?: number | null;
  orgGroupAccommodationAddress?: string | null;
  refCustomerCategory_Code?: string | null;
  refConferenceEvent_Id?: number | null;
}
