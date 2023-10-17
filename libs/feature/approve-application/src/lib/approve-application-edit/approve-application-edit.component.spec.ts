import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveApplicationEditComponent } from './approve-application-edit.component';

describe('ApproveApplicationEditComponent', () => {
  let component: ApproveApplicationEditComponent;
  let fixture: ComponentFixture<ApproveApplicationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveApplicationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveApplicationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
