import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyApplicationReturnCorrectionComponent } from './verify-application-return-correction.component';

describe('VerifyApplicationReturnCorrectionComponent', () => {
  let component: VerifyApplicationReturnCorrectionComponent;
  let fixture: ComponentFixture<VerifyApplicationReturnCorrectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyApplicationReturnCorrectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyApplicationReturnCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
