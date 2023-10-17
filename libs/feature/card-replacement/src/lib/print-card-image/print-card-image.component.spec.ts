import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintCardImageComponent } from './print-card-image.component';

describe('PrintCardImageComponent', () => {
  let component: PrintCardImageComponent;
  let fixture: ComponentFixture<PrintCardImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintCardImageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintCardImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
