import { async, TestBed } from '@angular/core/testing';
import { FeatureServiceCenterModule } from './feature-service-center.module';

describe('FeatureServiceCenterModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FeatureServiceCenterModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(FeatureServiceCenterModule).toBeDefined();
  });
});
