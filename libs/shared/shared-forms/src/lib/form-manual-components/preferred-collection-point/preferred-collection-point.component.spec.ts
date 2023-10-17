import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferredCollectionPointComponent } from './preferred-collection-point.component';

describe('PreferredCollectionPointComponent', () => {
  let component: PreferredCollectionPointComponent;
  let fixture: ComponentFixture<PreferredCollectionPointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferredCollectionPointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreferredCollectionPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
