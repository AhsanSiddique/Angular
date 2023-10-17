import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmirCupCookieConsentComponent } from './amir-cup-cookie-consent.component';

describe('AmirCupCookieConsentComponent', () => {
  let component: AmirCupCookieConsentComponent;
  let fixture: ComponentFixture<AmirCupCookieConsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmirCupCookieConsentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmirCupCookieConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
