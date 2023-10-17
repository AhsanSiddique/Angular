import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FanIDConfig, Environment } from '@fan-id/core';
import { CreateOrderRequest, CreateOrderResponse, GetPaymentAmountRequest, GetPaymentAmountResponse,GetBulkPaymentAmountRequest,GetBulkPaymentAmountResponse,CreateBulkOrderRequest,CreateBulkOrderResponse } from '../models/payment.model';
import { ApiUrls } from '../bulk-registration-urls';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  apiUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  getPaymentAmount(body: GetPaymentAmountRequest) {
    const url = this.apiUrl + ApiUrls.GetPaymentAmount;
    return this.http.post<GetPaymentAmountResponse>(url, body);
  }

  createOrder(body: CreateOrderRequest) {
    const url = this.apiUrl + ApiUrls.CreateOrder;
    return this.http.post<CreateOrderResponse>(url, body);
  }
  getBulkPaymentAmount(body: GetBulkPaymentAmountRequest) {
    const url = this.apiUrl + ApiUrls.GetBulkPaymentAmount;
    return this.http.post<GetBulkPaymentAmountResponse>(url, body);
  }
  bulkCreateOrder(body: CreateBulkOrderRequest) {
    const url = this.apiUrl + ApiUrls.BulkCreateOrder;
    return this.http.post<CreateBulkOrderResponse>(url, body);
  }

}
 