import { Component, OnInit } from '@angular/core';
import { ApplicantDataInput } from '../../base-classes';
import { ActivatedRoute } from '@angular/router';
import { ApplicantService, PaymentDetailsByFanIdResponseData } from '@fan-id/api/server';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'fan-id-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent extends ApplicantDataInput implements OnInit {
  fanId: string;
  paymentDetails$ = new BehaviorSubject<PaymentDetailsByFanIdResponseData>(null);

  constructor(private route: ActivatedRoute, private applicantService: ApplicantService) {
    super();
    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
  }

  ngOnInit() {
    this.getPaymentDetails();
  }

  getPaymentDetails() {
    if (!this.fanId) return;
    this.applicantService.getPaymentDetailsByFanId(this.fanId).subscribe({
      next: response => {
        this.paymentDetails$.next(response?.data);
      },
      error: error => {
        console.log(error);
      }
    });
  }
}
