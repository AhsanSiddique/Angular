import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllApplicationsExportComponent } from './all-applications-export.component';

describe('AllApplicationsExportComponent', () => {
  let component: AllApplicationsExportComponent;
  let fixture: ComponentFixture<AllApplicationsExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllApplicationsExportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllApplicationsExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
