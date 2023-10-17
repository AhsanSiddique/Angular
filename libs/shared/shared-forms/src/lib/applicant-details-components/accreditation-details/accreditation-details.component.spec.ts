import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccreditationDetailsComponent } from './accreditation-details.component';

describe('AccreditationDetailsComponent', () => {
  let component: AccreditationDetailsComponent;
  let fixture: ComponentFixture<AccreditationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccreditationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccreditationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
