import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGroupUpdateAccommodationComponent } from './bulk-group-update-accommodation.component';

describe('BulkGroupUpdateAccommodationComponent', () => {
  let component: BulkGroupUpdateAccommodationComponent;
  let fixture: ComponentFixture<BulkGroupUpdateAccommodationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkGroupUpdateAccommodationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkGroupUpdateAccommodationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
