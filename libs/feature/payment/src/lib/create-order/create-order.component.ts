import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateOrderRequest, CreateOrderResponse, MetadataService, PaymentRedirectionBody, PaymentService } from '@fan-id/api/server';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'fan-id-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.scss']
})
export class CreateOrderComponent implements OnInit {
  fanIdNo: string;
  createOrderForm = this.fb.group({
    amount: ['', Validators.required],
    paymentMode: [null, Validators.required],
  })
  paymentModeList$: Observable<{id: number, name: string}[]> = of([]);
  payoutFormData: any[] = [];
  paymentUrl!: string;
  paymentRedirectionBody!: PaymentRedirectionBody;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private metadataService: MetadataService
  ) {
    this.fanIdNo = this.route.snapshot.queryParamMap.get('fanid') ?? '';
  }

  ngOnInit() {
    if (!this.fanIdNo) {
      this.redirectToAllApplications();
      return;
    };
    this.f.amount.disable();
    this.f.paymentMode.disable();
  }

  get f() {
    return this.createOrderForm.controls;
  }

  redirectToAllApplications() {
    this.router.navigate(['main', 'all-applications', 'list']);
  }

  cancel() {
    this.redirectToAllApplications();
  }

  proceed() {
    const body: CreateOrderRequest = {
      fanIdNo: this.fanIdNo,
      cardType: 1,
      language: '1',
      transactionType: this.f.paymentMode.value || 2,
      transactionRequestType: 2,
      isAnonymousUser: true,
      customer_ip_address: '127.0.0.1',
    }
    this.paymentService.createOrder(body).subscribe({
      next: (response) => {
        const data = response?.data ?? {paymentRedirectionURL: '', paymentRedirectionBody: {}};
        this.paymentUrl = data?.paymentRedirectionURL as string;
        this.paymentRedirectionBody = data?.paymentRedirectionBody as PaymentRedirectionBody;
        this.checkoutPayment(response);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  checkoutPayment(response: CreateOrderResponse) {
    if (response?.data) {
      this.paymentUrl = response.data.paymentRedirectionURL;
      // let PaymentBodyObj;
      // if (topupToCard?.paymentCard != "DebitCard") {
      //   if (response?.data?.paymentRedirectionBody?.bill_to_address_country === undefined) {
      //     response.data.paymentRedirectionBody.bill_to_address_country = ''
      //   }
      //   if (response?.data?.paymentRedirectionBody?.bill_to_forename === undefined) {
      //     response.data.paymentRedirectionBody.bill_to_forename = ''
      //   }
      //   if (response?.data?.paymentRedirectionBody?.bill_to_phone === undefined) {
      //     response.data.paymentRedirectionBody.bill_to_phone = ''
      //   }
      //   if (response?.data?.paymentRedirectionBody?.bill_to_surname === undefined) {
      //     response.data.paymentRedirectionBody.bill_to_surname = ''
      //   }
      // }
      // const paymentMethodKeys = Object.keys(response.data.paymentRedirectionBody) as (keyof PaymentRedirectionBody)[];
      // for (const key of paymentMethodKeys) {
      //   PaymentBodyObj = {
      //     key: key,
      //     value: response.data.paymentRedirectionBody[key]
      //   }
      //   if (PaymentBodyObj.key) {
      //     this.payoutFormData = [...this.payoutFormData, PaymentBodyObj];
      //   }
      // }

      this.payoutFormData = Object.entries(response.data.paymentRedirectionBody ?? {})
        .map(([key, value]) => ({ key, value }))
        .filter(entry => entry.key);

      console.log({ payoutFormData: this.payoutFormData})
      setTimeout(() => {
        document.getElementById('checkoutFormBtn')?.click()
      }, 1000)
    }

  }

}
