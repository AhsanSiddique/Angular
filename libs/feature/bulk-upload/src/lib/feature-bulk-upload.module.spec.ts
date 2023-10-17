import { async, TestBed } from '@angular/core/testing';
import { FeatureBulkUploadModule } from './feature-bulk-upload.module';

describe('FeatureBulkUploadModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureBulkUploadModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureBulkUploadModule).toBeDefined();
  });
});
