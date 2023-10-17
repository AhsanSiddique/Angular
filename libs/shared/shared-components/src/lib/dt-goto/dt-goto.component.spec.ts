import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DtGotoComponent } from './dt-goto.component';

describe('DtGotoComponent', () => {
  let component: DtGotoComponent;
  let fixture: ComponentFixture<DtGotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DtGotoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DtGotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
