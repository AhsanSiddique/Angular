import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferredCollectionDetailsComponent } from './preferred-collection-details.component';

describe('PreferredCollectionDetailsComponent', () => {
  let component: PreferredCollectionDetailsComponent;
  let fixture: ComponentFixture<PreferredCollectionDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferredCollectionDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredCollectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
