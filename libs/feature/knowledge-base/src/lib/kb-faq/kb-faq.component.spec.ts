import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbFaqComponent } from './kb-faq.component';

describe('KbFaqComponent', () => {
  let component: KbFaqComponent;
  let fixture: ComponentFixture<KbFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbFaqComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KbFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
