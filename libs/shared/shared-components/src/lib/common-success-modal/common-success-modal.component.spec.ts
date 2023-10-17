import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSuccessModalComponent } from './common-success-modal.component';

describe('CommonSuccessModalComponent', () => {
  let component: CommonSuccessModalComponent;
  let fixture: ComponentFixture<CommonSuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonSuccessModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
