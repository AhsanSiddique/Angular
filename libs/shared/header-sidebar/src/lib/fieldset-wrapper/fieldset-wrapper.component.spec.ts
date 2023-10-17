import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsetWrapperComponent } from './fieldset-wrapper.component';

describe('FieldsetWrapperComponent', () => {
  let component: FieldsetWrapperComponent;
  let fixture: ComponentFixture<FieldsetWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FieldsetWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldsetWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
