import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationAlternateComponent } from './accommodation-alternate.component';

describe('AccommodationAlternateComponent', () => {
  let component: AccommodationAlternateComponent;
  let fixture: ComponentFixture<AccommodationAlternateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationAlternateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationAlternateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
