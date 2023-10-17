import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmirCupLayoutComponent } from './amir-cup-layout.component';

describe('AmirCupLayoutComponent', () => {
  let component: AmirCupLayoutComponent;
  let fixture: ComponentFixture<AmirCupLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmirCupLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmirCupLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
