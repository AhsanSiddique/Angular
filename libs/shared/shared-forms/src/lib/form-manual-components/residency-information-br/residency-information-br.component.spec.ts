import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidencyInformationBrComponent } from './residency-information-br.component';

describe('ResidencyInformationBrComponent', () => {
  let component: ResidencyInformationBrComponent;
  let fixture: ComponentFixture<ResidencyInformationBrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidencyInformationBrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidencyInformationBrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
