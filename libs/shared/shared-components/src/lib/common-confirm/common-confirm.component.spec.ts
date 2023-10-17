import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonConfirmComponent } from './common-confirm.component';

describe('CommonConfirmComponent', () => {
  let component: CommonConfirmComponent;
  let fixture: ComponentFixture<CommonConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonConfirmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
