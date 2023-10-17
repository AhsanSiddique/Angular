import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCardApplicantDetailsComponent } from './edit-card-applicant-details.component';

describe('EditCardApplicantDetailsComponent', () => {
  let component: EditCardApplicantDetailsComponent;
  let fixture: ComponentFixture<EditCardApplicantDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCardApplicantDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCardApplicantDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
