import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryInformationFormComponent } from './delivery-information-form.component';

describe('DeliveryInformationFormComponent', () => {
  let component: DeliveryInformationFormComponent;
  let fixture: ComponentFixture<DeliveryInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryInformationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
