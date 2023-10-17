import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadStep4Component } from './manual-upload-step4.component';

describe('ManualUploadStep4Component', () => {
  let component: ManualUploadStep4Component;
  let fixture: ComponentFixture<ManualUploadStep4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadStep4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadStep4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
