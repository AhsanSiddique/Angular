import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadNewApplicationComponent } from './manual-upload-new-application.component';

describe('ManualUploadNewApplicationComponent', () => {
  let component: ManualUploadNewApplicationComponent;
  let fixture: ComponentFixture<ManualUploadNewApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadNewApplicationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadNewApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
