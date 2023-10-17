import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from '@fan-id/core';

interface PaymentStatus {
  decision: 'ACCEPT' | 'DECLINE';
  reasonCode: string;
  message: string;
  status: string;
  bankTransaction_id: string;
  orderNumber: string;
  paymentUUID: string;
  gatewayType: string;
}

@Component({
  selector: 'fan-id-payment-confirm',
  templateUrl: './payment-confirm.component.html',
  styleUrls: ['./payment-confirm.component.scss']
})
export class PaymentConfirmComponent implements OnInit {
  paymentStatus!: PaymentStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coreService: CoreService
  ) { }

  ngOnInit() {
    try {
      let info = this.route.snapshot.queryParamMap.get('info') ?? '';
      info = encodeURI(info).replace(/%20/g, "+");
      const decryptedInfo = this.coreService.decryptPaymentConfirm(info);
      this.paymentStatus = JSON.parse(atob(decryptedInfo));
      console.log(this.paymentStatus);
    } catch (error) {
      console.log(error);
    }
  }

  redirectToAllApplications() {
    this.router.navigate(['main', 'all-applications', 'list']);
  }
}
