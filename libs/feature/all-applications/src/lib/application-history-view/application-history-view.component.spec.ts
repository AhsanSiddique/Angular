import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationHistoryViewComponent } from './application-history-view.component';

describe('ApplicationHistoryViewComponent', () => {
  let component: ApplicationHistoryViewComponent;
  let fixture: ComponentFixture<ApplicationHistoryViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationHistoryViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationHistoryViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
