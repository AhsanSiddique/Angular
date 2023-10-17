import { async, TestBed } from '@angular/core/testing';
import { FeatureBulkRegistrationModule } from './feature-bulk-registration.module';

describe('FeatureBulkRegistrationModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureBulkRegistrationModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureBulkRegistrationModule).toBeDefined();
  });
});
