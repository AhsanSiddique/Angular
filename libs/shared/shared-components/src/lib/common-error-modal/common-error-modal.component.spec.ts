import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonErrorModalComponent } from './common-error-modal.component';

describe('CommonErrorModalComponent', () => {
  let component: CommonErrorModalComponent;
  let fixture: ComponentFixture<CommonErrorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonErrorModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
