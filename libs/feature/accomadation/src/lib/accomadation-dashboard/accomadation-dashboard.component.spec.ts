import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccomadationDashboardComponent } from './accomadation-dashboard.component';

describe('AccomadationDashboardComponent', () => {
  let component: AccomadationDashboardComponent;
  let fixture: ComponentFixture<AccomadationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccomadationDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccomadationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
