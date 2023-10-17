import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDetailsBrComponent } from './contact-details-br.component';

describe('ContactDetailsBrComponent', () => {
  let component: ContactDetailsBrComponent;
  let fixture: ComponentFixture<ContactDetailsBrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactDetailsBrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailsBrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
