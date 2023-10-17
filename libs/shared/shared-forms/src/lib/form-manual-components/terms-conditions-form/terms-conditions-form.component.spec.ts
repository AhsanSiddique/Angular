import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsConditionsFormComponent } from './terms-conditions-form.component';

describe('TermsConditionsFormComponent', () => {
  let component: TermsConditionsFormComponent;
  let fixture: ComponentFixture<TermsConditionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsConditionsFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsConditionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
