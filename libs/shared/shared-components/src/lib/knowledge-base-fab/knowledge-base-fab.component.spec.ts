import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseFabComponent } from './knowledge-base-fab.component';

describe('KnowledgeBaseFabComponent', () => {
  let component: KnowledgeBaseFabComponent;
  let fixture: ComponentFixture<KnowledgeBaseFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseFabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
