import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupImportComponent } from './bulk-group-import.component';

describe('BulkGroupImportComponent', () => {
  let component: BulkGroupImportComponent;
  let fixture: ComponentFixture<BulkGroupImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
