import { async, TestBed } from '@angular/core/testing';
import { FeatureAllApplicationsModule } from './feature-all-applications.module';

describe('FeatureAllApplicationsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureAllApplicationsModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureAllApplicationsModule).toBeDefined();
  });
});
