import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidencyInformationComponent } from './residency-information.component';

describe('ResidencyInformationComponent', () => {
  let component: ResidencyInformationComponent;
  let fixture: ComponentFixture<ResidencyInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidencyInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidencyInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
