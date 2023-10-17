import { Component, Input } from '@angular/core';
import {
  ApplicantService,
  CustomerCardApplicationActionGetListRequest,
  CustomerCardApplicationActionGetListRequestPagingRequest,
  CustomerCardApplicationActionGetListResponse
} from '@fan-id/api/server';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-application-history',
  templateUrl: './application-history.component.html',
  styleUrls: ['./application-history.component.scss']
})
export class ApplicationHistoryComponent {
  @Input() _open = false;
  @Input() filter: CustomerCardApplicationActionGetListRequest = {}

  loading = false;
  request: CustomerCardApplicationActionGetListRequestPagingRequest = {
    pageIndex: 0,
    pageSize: 0,
    countRequired: true,
    orderByModel: [{
      fieldName: 'id',
      sortType: 2
    }]
  }
  applicationHistoryList: CustomerCardApplicationActionGetListResponse[] = [];

  constructor(private applicantService: ApplicantService) {
  }

  getList() {
    this.loading = true;
    this.request.filter = this.filter;
    this.applicantService.getCustomerCardApplicationActionList(this.request)
    .pipe(take(1))
    .subscribe(
      (res) => {
        const dataList = res?.dataList ?? [];
        this.applicationHistoryList = dataList.slice(0,5);
        this.loading = false;
      },
      (err) => {
        console.log(err);
        this.applicationHistoryList = [];
        this.loading = false;
      }
    );
  }

  open() {
    this._open = true;
    this.getList();
  }

  close() {
    this._open = false;
  }

}
