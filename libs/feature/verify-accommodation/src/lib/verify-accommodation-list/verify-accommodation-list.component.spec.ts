import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAccommodationListComponent } from './verify-accommodation-list.component';

describe('VerifyAccommodationListComponent', () => {
  let component: VerifyAccommodationListComponent;
  let fixture: ComponentFixture<VerifyAccommodationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyAccommodationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyAccommodationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
