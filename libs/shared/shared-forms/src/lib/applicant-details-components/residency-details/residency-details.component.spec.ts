import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidencyDetailsComponent } from './residency-details.component';

describe('ResidencyDetailsComponent', () => {
  let component: ResidencyDetailsComponent;
  let fixture: ComponentFixture<ResidencyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidencyDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResidencyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
