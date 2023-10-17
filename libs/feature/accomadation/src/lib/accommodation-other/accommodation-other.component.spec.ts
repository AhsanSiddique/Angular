import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationOtherComponent } from './accommodation-other.component';

describe('AccommodationOtherComponent', () => {
  let component: AccommodationOtherComponent;
  let fixture: ComponentFixture<AccommodationOtherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccommodationOtherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationOtherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
