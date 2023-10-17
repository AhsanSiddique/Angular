import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateVoucherCodeComponent } from './generate-voucher-code.component';

describe('GenerateVoucherCodeComponent', () => {
  let component: GenerateVoucherCodeComponent;
  let fixture: ComponentFixture<GenerateVoucherCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateVoucherCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateVoucherCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
