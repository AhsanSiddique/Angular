import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseHeaderComponent } from './knowledge-base-header.component';

describe('KnowledgeBaseHeaderComponent', () => {
  let component: KnowledgeBaseHeaderComponent;
  let fixture: ComponentFixture<KnowledgeBaseHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeBaseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
