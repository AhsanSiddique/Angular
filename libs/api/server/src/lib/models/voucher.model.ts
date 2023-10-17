import { BaseResponse } from "./api.model";

export class VouchersList {
  id?: any;
  date?: any;
}

export interface VoucherCodeListRequest {
  applicationDateBegin?: string | null;
  applicationDateEnd?: string | null;
  organization_Name?: string | null;
}
export class VoucherExcelData {
  RefOrganization_OrganizationId: number;
  file: File;
  RefEvent_Code: string;
  bulkGroupName?: string;
  isNewGroupName?: boolean;
}

export interface IVoucherCategoryListItem {
  code: string,
  sortorder: number,
  showinHCEP: boolean,
  isEnabled: boolean,
  id: number,
  name: string,
  system_RowVersion: string,
  voucherCategory_Translation_Name: string
}

export interface IVoucherCategoryListResponse extends BaseResponse {
  dataList?: IVoucherCategoryListItem[];
}
