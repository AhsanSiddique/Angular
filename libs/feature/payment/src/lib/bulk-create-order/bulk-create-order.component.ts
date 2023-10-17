import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateBulkOrderRequest, CreateBulkOrderResponse, MetadataService, PaymentRedirectionBody, PaymentService } from '@fan-id/api/server';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'fan-id-bulk-create-order',
  templateUrl: './bulk-create-order.component.html',
  styleUrls: ['./bulk-create-order.component.scss']
})
export class BulkCreateOrderComponent implements OnInit {

  fanIdObject:any;



  createOrderForm = this.fb.group({
    amount: ['', Validators.required],
    paymentMode: [null, Validators.required],
  })
  paymentModeList$: Observable<{id: number, name: string}[]> = of([]);

  payoutFormData: any[] = [];
  // checkoutForm: FormGroup;
  paymentUrl!: string;
  paymentRedirectionBody!: PaymentRedirectionBody;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private metadataService: MetadataService,


  ) {


    //this.fanIdNo = this.route.snapshot.queryParamMap.get('fanid') ?? '';
  }

  ngOnInit() {
      this.fanIdObject = history.state?.body;

     const totalApplication=this.fanIdObject.totalApplication;

    if (!this.fanIdObject) {
      this.redirectToAllApplications();
      return;
    };
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
    const body: CreateBulkOrderRequest = {
      fanIdNo: this.fanIdObject.fanIdNo,
      cardType: 1,
      language: '1',
      transactionType: this.f.paymentMode.value || 2,
      transactionRequestType: 2,
      isAnonymousUser: true,
      customer_ip_address: '127.0.0.1',
      refOrganization_Id : this.fanIdObject.refOrganization_Id,
      bulkGroupName : this.fanIdObject.bulkGroupName

    }
    this.paymentService.bulkCreateOrder(body).subscribe({
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

  checkoutPayment(response: CreateBulkOrderResponse) {
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

