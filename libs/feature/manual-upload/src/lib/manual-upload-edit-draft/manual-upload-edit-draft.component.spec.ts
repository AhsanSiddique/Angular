import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualUploadEditDraftComponent } from './manual-upload-edit-draft.component';

describe('ManualUploadEditDraftComponent', () => {
  let component: ManualUploadEditDraftComponent;
  let fixture: ComponentFixture<ManualUploadEditDraftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualUploadEditDraftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualUploadEditDraftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
