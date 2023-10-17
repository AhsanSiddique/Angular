import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryPermitHistoryComponent } from './entry-permit-history.component';

describe('EntryPermitHistoryComponent', () => {
  let component: EntryPermitHistoryComponent;
  let fixture: ComponentFixture<EntryPermitHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntryPermitHistoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryPermitHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
