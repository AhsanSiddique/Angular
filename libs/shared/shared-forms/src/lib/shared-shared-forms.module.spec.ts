import { async, TestBed } from '@angular/core/testing';
import { SharedSharedFormsModule } from './shared-shared-forms.module';

describe('SharedSharedFormsModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedSharedFormsModule],
    }).compileComponents();
  }));

  // TODO: Add real tests here.
  //
  // NB: This particular test does not do anything useful.
  //     It does NOT check for correct instantiation of the module.
  it('should have a module definition', () => {
    expect(SharedSharedFormsModule).toBeDefined();
  });
});
