import { TestBed } from '@angular/core/testing';

import { PackageUploadService } from './package-upload.service';

describe('PackageUploadService', () => {
  let service: PackageUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackageUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
