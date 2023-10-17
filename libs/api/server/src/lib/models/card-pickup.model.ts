import { OrderByModel } from "./api.model";

export class CancelPrintRequest{
  refApplication_Id:number;
  status:number;
  updateForFirstRequest:boolean;
  force:boolean;
}

export interface ICustomerCardActionGetListRequestFilter {
  /** @format int32 */
  actionType?: number | null;

  /** @format int64 */
  refApplication_Id?: number | null;

  /** @format int32 */
  status?: number | null;
  description?: string | null;
  requestData?: string | null;
  responseData?: string | null;
  statusMessage?: string | null;

  /** @format int64 */
  refCustomerCard_Id?: number | null;
  documentNumber?: string | null;
  fanIdNumber?: string | null;
  status_Name?: string | null;
  tournament_Name?: string | null;
  actionType_Name?: string | null;
  refEvent_Code?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  /** @format date-time */
  applicationDate?: string | null;
  requestPrinterName?: string | null;
  responsePrinterName?: string | null;
  agent_Name?: string | null;
  system_CreatedBy?: string | null;
  system_ModifiedBy?: string | null;
}

export interface ICustomerCardActionGetListRequest {
  filter?: ICustomerCardActionGetListRequestFilter;

  /** @format int32 */
  pageSize?: number | null;

  /** @format int32 */
  pageIndex?: number | null;
  orderByModel?: OrderByModel[] | null;
  countRequired?: boolean;

  /** @format int32 */
  timeZone?: number;
}
export interface ICustomerCardActionGetListItem {
  /** @format int32 */
  actionType: number;

  /** @format int64 */
  refApplication_Id: number;

  /** @format int32 */
  status: number;
  description?: string | null;
  requestData?: string | null;
  responseData?: string | null;
  statusMessage?: string | null;

  /** @format int64 */
  refCustomerCard_Id: number;
  reasonType?: number;
  refSerivceCenter_Code?: string | null;
  requestPrinterName?: string | null;
  responsePrinterName?: string | null;

  /** @format int64 */
  id?: number;

  /** @format byte */
  system_RowVersion?: string | null;
  actionType_Name?: string | null;
  customerCardActionStatus_Name?: string | null;
  applicationNo?: string | null;
  fanIdNo?: string | null;
  isChildApplication?: boolean;
  refParentFanIdNo?: string | null;
  applicationStatus?: number;
  applicationStatus_Name?: string | null;

  /** @format int64 */
  refDocType_Id?: number | null;
  documentIdNo?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  refTicketNo?: string | null;
  ticketOrderId?: string | null;
  secondName?: string | null;
  thirdName?: string | null;
  fourthName?: string | null;

  /** @format date-time */
  dateofBirth?: string | null;

  /** @format date-time */
  applicationDate?: string | null;
  phoneAreaCode?: string | null;
  phone?: string | null;
  tournament_Name?: string | null;
  refEvent_Code?: string | null;

  /** @format date-time */
  system_CreatedOn?: string | null;
  system_CreatedBy?: string | null;

  /** @format date-time */
  system_ModifiedOn?: string | null;
  system_ModifiedBy?: string | null;
  reasonType_Name?: string | null;
  customerCardAction_RefSerivceCenter_Code_Name?: string | null;
  event_Name?: string | null;
  agent_Name?: string | null;
  isProxyCollection?: boolean | null;
  proxyDetails ? : string | null;
}

export type TCustomerCardActionGetListItemKey = keyof ICustomerCardActionGetListItem;
