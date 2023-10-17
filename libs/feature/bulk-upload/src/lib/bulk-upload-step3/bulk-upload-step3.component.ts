import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MetadataResolve } from '@fan-id/api/server';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'fan-id-bulk-upload-step3',
  templateUrl: './bulk-upload-step3.component.html',
  styleUrls: ['./bulk-upload-step3.component.scss'],
})
export class BulkUploadStep3Component {
  draftId: string;
  metadata$: Observable<MetadataResolve>
  feature:string ='bulk-group-continue';
  constructor(private route: ActivatedRoute) {
    this.draftId = this.route.snapshot.queryParamMap.get('id');
    this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.feature =  this.route.snapshot.queryParamMap.get('feature') ?? 'bulk-group-continue' ;
  }
}
