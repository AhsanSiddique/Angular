import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetadataResolve } from '@fan-id/api/server';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'fan-id-bulk-group-draft-edit',
  template: `
    <fan-id-manual-upload-edit-draft
    [feature]="feature"
    [_draftId]="draftId"
    [_metadata$]="metadata$"
    ></fan-id-manual-upload-edit-draft>
  `,
  styles: [
  ]
})
export class BulkGroupDraftEditComponent {
  draftId: string;
  metadata$: Observable<MetadataResolve>
  feature = 'bulk-group-continue';
  constructor(private route: ActivatedRoute) {
    this.draftId = this.route.snapshot.queryParamMap.get('id');
    this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.feature =  this.route.snapshot.queryParamMap.get('feature') ?? 'bulk-group-continue' ;
  }

}
