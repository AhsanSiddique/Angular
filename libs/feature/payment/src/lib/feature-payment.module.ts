import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { CreateOrderComponent } from './create-order/create-order.component';
import { AuthGuard } from '@fan-id/feature/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentConfirmComponent } from './payment-confirm/payment-confirm.component';
import { BulkCreateOrderComponent } from './bulk-create-order/bulk-create-order.component';

const routes: Route[] = [
  {
    path: '',
    children: [
      {
        path: 'create-order',
        component: CreateOrderComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'bulk-create-order',
        component: BulkCreateOrderComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'confirm',
        component: PaymentConfirmComponent,
      }
    ]
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  declarations: [
    CreateOrderComponent,
    PaymentConfirmComponent,
    BulkCreateOrderComponent
  ],
})
export class FeaturePaymentModule {}
