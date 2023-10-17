import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadStep3Component } from './manual-upload-step3.component';

describe('ManualUploadStep3Component', () => {
  let component: ManualUploadStep3Component;
  let fixture: ComponentFixture<ManualUploadStep3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadStep3Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadStep3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
