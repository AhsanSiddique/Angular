import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateEmailidComponent } from './update-emailid.component';

describe('UpdateEmailidComponent', () => {
  let component: UpdateEmailidComponent;
  let fixture: ComponentFixture<UpdateEmailidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateEmailidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateEmailidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
