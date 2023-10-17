import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllApplicationsListComponent } from './all-applications-list.component';

describe('AllApplicationsListComponent', () => {
  let component: AllApplicationsListComponent;
  let fixture: ComponentFixture<AllApplicationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllApplicationsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllApplicationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
