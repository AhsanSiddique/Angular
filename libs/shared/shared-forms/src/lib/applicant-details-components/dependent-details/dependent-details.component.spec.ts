import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependentDetailsComponent } from './dependent-details.component';

describe('DependentDetailsComponent', () => {
  let component: DependentDetailsComponent;
  let fixture: ComponentFixture<DependentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DependentDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DependentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
