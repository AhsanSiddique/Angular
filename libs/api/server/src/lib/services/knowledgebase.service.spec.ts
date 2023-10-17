import { TestBed } from '@angular/core/testing';

import { KnowledgebaseService } from './knowledgebase.service';

describe('KnowledgebaseService', () => {
  let service: KnowledgebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KnowledgebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
