import { async, TestBed } from '@angular/core/testing';
import { FeatureManualUploadModule } from './feature-manual-upload.module';

describe('FeatureManualUploadModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureManualUploadModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureManualUploadModule).toBeDefined();
  });
});
