import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkPaymentComponent } from './bulk-payment.component';

describe('BulkPaymentComponent', () => {
  let component: BulkPaymentComponent;
  let fixture: ComponentFixture<BulkPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
