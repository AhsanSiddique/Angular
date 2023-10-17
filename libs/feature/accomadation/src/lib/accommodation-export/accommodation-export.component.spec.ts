import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationExportComponent } from './accommodation-export.component';

describe('AccommodationExportComponent', () => {
  let component: AccommodationExportComponent;
  let fixture: ComponentFixture<AccommodationExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationExportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
