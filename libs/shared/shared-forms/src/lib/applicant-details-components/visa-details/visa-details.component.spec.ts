import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisaDetailsComponent } from './visa-details.component';

describe('VisaDetailsComponent', () => {
  let component: VisaDetailsComponent;
  let fixture: ComponentFixture<VisaDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisaDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
