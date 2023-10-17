import { BaseResponse } from "./api.model";

export interface CreateOrderRequest {
  transactionType: number;
  transactionRequestType: number;
  fanIdNo: string;
  language?: string | null;
  isAnonymousUser?: boolean | null;
  cardType: number;
  customer_ip_address?: string;
}
export interface CreateOrderRequest {
  transactionType: number;
  transactionRequestType: number;
  fanIdNo: string;
  language?: string | null;
  isAnonymousUser?: boolean | null;
  cardType: number;
  customer_ip_address?: string;
}
export interface CreateBulkOrderRequest {
  transactionType: number;
  transactionRequestType: number;
  fanIdNo: string;
  language?: string | null;
  isAnonymousUser?: boolean | null;
  cardType: number;
  customer_ip_address?: string;
  refOrganization_Id?:string;
  bulkGroupName?: string;
}

export interface CreateOrderResponse extends BaseResponse {
  data?: CreateOrderResponseData;
}
export interface CreateBulkOrderResponse extends BaseResponse {
  data?: CreateOrderResponseData;
}

export interface CreateOrderResponseData {
  paymentRedirectionURL: string;
  paymentRedirectionBody: PaymentRedirectionBody;
}

export interface CreateBulkOrderResponseData {
  paymentRedirectionURL: string;
  paymentRedirectionBody: PaymentRedirectionBody;
}

 

export interface PaymentRedirectionBody {
  unsigned_field_names: string
  amount: string
  bill_to_address_postal_code: string
  signed_field_names: string
  transaction_type: string
  bill_to_email: string
  reference_number: string
  bill_to_address_country: string
  bill_to_surname: string
  bill_to_address_line2: string
  bill_to_address_line1: string
  profile_id: string
  access_key: string
  bill_to_phone: string
  bill_to_address_city: string
  currency: string
  bill_to_forename: string
  signed_date_time: string
  merchant_defined_data1: string
  merchant_defined_data2: boolean
  merchant_defined_data4: string
  customer_ip_address: string
  override_custom_receipt_page: string
  override_custom_cancel_page: string
  signature: string
}

export interface GetPaymentAmountRequest {
  fanIdNo: string;
 
  
}
export interface GetBulkPaymentAmountRequest{
  fanIdNo: string;
  bulkGroupName: string;
  refOrganization_Id: string,
}

export interface GetPaymentAmountResponse extends BaseResponse {
  data?: GetPaymentAmountResponseData;
}
export interface GetBulkPaymentAmountResponse extends BaseResponse {
  data?: GetBulkPaymentAmountResponseData;
}

export interface GetPaymentAmountResponseData {
  /** @format double */
  amount?: number;
}
export interface GetBulkPaymentAmountResponseData {
  /** @format double */
  amount?: number;
}
