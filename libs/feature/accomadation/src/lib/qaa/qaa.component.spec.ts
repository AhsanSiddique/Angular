import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaaComponent } from './qaa.component';

describe('QaaComponent', () => {
  let component: QaaComponent;
  let fixture: ComponentFixture<QaaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QaaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QaaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
