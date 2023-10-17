import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCardDetailsComponent } from './view-card-details.component';

describe('ViewCardDetailsComponent', () => {
  let component: ViewCardDetailsComponent;
  let fixture: ComponentFixture<ViewCardDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewCardDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCardDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
