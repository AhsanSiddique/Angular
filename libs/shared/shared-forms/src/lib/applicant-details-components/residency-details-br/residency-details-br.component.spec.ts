import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidencyDetailsBrComponent } from './residency-details-br.component';

describe('ResidencyDetailsBrComponent', () => {
  let component: ResidencyDetailsBrComponent;
  let fixture: ComponentFixture<ResidencyDetailsBrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidencyDetailsBrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidencyDetailsBrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
