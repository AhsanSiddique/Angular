import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketInformationFormComponent } from './ticket-information-form.component';

describe('TicketInformationFormComponent', () => {
  let component: TicketInformationFormComponent;
  let fixture: ComponentFixture<TicketInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketInformationFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
