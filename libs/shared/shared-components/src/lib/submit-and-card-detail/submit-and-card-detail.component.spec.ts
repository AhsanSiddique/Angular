import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitAndCardDetailComponent } from './submit-and-card-detail.component';

describe('SubmitAndCardDetailComponent', () => {
  let component: SubmitAndCardDetailComponent;
  let fixture: ComponentFixture<SubmitAndCardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitAndCardDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitAndCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
