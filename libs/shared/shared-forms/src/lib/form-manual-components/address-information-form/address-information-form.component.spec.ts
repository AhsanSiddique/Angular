import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressInformationFormComponent } from './address-information-form.component';

describe('AddressInformationFormComponent', () => {
  let component: AddressInformationFormComponent;
  let fixture: ComponentFixture<AddressInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressInformationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
