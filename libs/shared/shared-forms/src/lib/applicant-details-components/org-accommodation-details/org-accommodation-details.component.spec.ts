import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgAccommodationDetailsComponent } from './org-accommodation-details.component';

describe('OrgAccommodationDetailsComponent', () => {
  let component: OrgAccommodationDetailsComponent;
  let fixture: ComponentFixture<OrgAccommodationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgAccommodationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgAccommodationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
