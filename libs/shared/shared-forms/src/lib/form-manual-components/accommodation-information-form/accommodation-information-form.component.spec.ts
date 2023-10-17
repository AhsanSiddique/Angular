import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationInformationFormComponent } from './accommodation-information-form.component';

describe('AccommodationInformationFormComponent', () => {
  let component: AccommodationInformationFormComponent;
  let fixture: ComponentFixture<AccommodationInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationInformationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
