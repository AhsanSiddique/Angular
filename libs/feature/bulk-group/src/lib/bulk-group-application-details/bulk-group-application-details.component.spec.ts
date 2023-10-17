import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupApplicationDetailsComponent } from './bulk-group-application-details.component';

describe('BulkGroupApplicationDetailsComponent', () => {
  let component: BulkGroupApplicationDetailsComponent;
  let fixture: ComponentFixture<BulkGroupApplicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupApplicationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
