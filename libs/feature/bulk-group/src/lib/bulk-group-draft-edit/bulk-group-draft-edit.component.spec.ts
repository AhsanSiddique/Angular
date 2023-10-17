import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupDraftEditComponent } from './bulk-group-draft-edit.component';

describe('BulkGroupDraftEditComponent', () => {
  let component: BulkGroupDraftEditComponent;
  let fixture: ComponentFixture<BulkGroupDraftEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupDraftEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupDraftEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
