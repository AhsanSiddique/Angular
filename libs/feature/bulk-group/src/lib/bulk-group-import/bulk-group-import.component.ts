import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'fan-id-bulk-group-import',
  template: `
    <fan-id-manual-upload-step3
    feature="bulk-group-continue"
    [_bulkgroupname]="bulkgroupname"
    >
    </fan-id-manual-upload-step3>
  `,
  styles: [
  ]
})
export class BulkGroupImportComponent {

  bulkgroupname: string;
  constructor(private route: ActivatedRoute) {
    this.bulkgroupname =  this.route.snapshot.queryParamMap.get('bulkgroupname');
   }

}
