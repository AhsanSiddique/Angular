import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInformationFormLocalComponent } from './personal-information-form-local.component';

describe('PersonalInformationFormLocalComponent', () => {
  let component: PersonalInformationFormLocalComponent;
  let fixture: ComponentFixture<PersonalInformationFormLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalInformationFormLocalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalInformationFormLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
