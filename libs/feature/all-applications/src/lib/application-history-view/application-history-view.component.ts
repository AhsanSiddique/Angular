import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicationHistoryService,
  CustomerCardApplicationActionGetListResponse,
} from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'fan-id-application-history-view',
  templateUrl: './application-history-view.component.html',
  styleUrls: ['./application-history-view.component.scss'],
})
export class ApplicationHistoryViewComponent implements OnInit {
  applicationHistoryList: CustomerCardApplicationActionGetListResponse[] = [];
  applicationActionsList: CustomerCardApplicationActionGetListResponse[] = [];
  applicationStatusList: CustomerCardApplicationActionGetListResponse[] = [];
  applicationHistoryListPage = 1;
  applicationHistoryListTotal = 0;
  applicationActionsListPage = 1;
  applicationActionsListTotal = 0;
  applicationStatusListPage = 1;
  applicationStatusListTotal = 0;
  globalPageSize = 10;
  loading = false;
  active = 1;
  historyRequest = {
    pageIndex: 0,
    pageSize: this.globalPageSize,
    countRequired: true,
    orderByModel: [
      {
        fieldName: 'System_CreatedOn',
        sortType: 1,
      },
    ],
    filter: {},
  };
  statusRequest = {
    pageIndex: 0,
    pageSize: this.globalPageSize,
    countRequired: true,
    orderByModel: [
      {
        fieldName: 'id',
        sortType: 1,
      },
    ],
    filter: {},
  };
  actionRequest = {
    pageIndex: 0,
    pageSize: this.globalPageSize,
    countRequired: true,
    orderByModel: [
      {
        fieldName: 'id',
        sortType: 1,
      },
    ],
    filter: {},
  };

  dtOptions: DataTables.Settings | undefined;

  dtTrigger: Subject<any> = new Subject<any>();
  fanId: string;
  refApplication_Id: number;
  isServiceCenter = false;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private ahs: ApplicationHistoryService,
    private route: ActivatedRoute
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
  }

  ngOnInit(): void {
    this.fanId = this.route.snapshot.queryParamMap.get('fanId');
    this.refApplication_Id = parseInt(
      this.route.snapshot.queryParamMap.get('id')
    );
    this.getHistoryList();
    this.getActionList();
    this.getStatusList();
  }

  getHistoryList(fromPagination = false) {
    this.historyRequest.filter = { fanIdNo: this.fanId };
    this.ahs
      .getCustomerCardApplicationHistoryList(this.historyRequest)
      .subscribe(
        (res) => {
          this.applicationHistoryListTotal = res?.totalCount ?? 0;
          this.loading = false;
          if (!fromPagination) {
            this.changedNav();
          }
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
  }

  getActionList() {
    this.actionRequest.filter = { refApplication_Id: this.refApplication_Id };
    this.ahs
      .getApplicationActions(this.actionRequest)
      .subscribe(
        (res) => {
          this.applicationActionsListTotal = res?.totalCount ?? 0;
          this.loading = false;
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
  }

  getStatusList() {
    this.statusRequest.filter = { refApplication_Id: this.refApplication_Id };
    this.ahs
      .getApplicationStatus(this.statusRequest)
      .subscribe(
        (res) => {
          this.applicationStatusListTotal = res?.totalCount ?? 0;
          this.loading = false;
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
  }

  changedNav() {
    this.dtOptions = {
      // select:'multiple',
      // displayStart:this.displayStart,
      // stateSave:true,
      paging: false,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,
      //************** */
      // serverSide: true,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
        $('#importdatatablestatus').wrap(
          "<div class='fan-id-tablewrap'></div>"
        );
        $('#importdatatableaction').wrap(
          "<div class='fan-id-tablewrap'></div>"
        );
      },
    };
  }

  checkChanges(dataarray: string[], data: string) {
    if (dataarray != null) {
      const changedItems = dataarray.map((item) => item.toLowerCase());
      if (changedItems && changedItems.indexOf(data.toLowerCase()) !== -1) {
        return true;
      }
    }
    return false;
  }

  onApplicationHistoryPageChange(page: number) {
    this.historyRequest.pageIndex = page - 1;
    this.getHistoryList(true);
  }

  onApplicationActionPageChange(page: number) {
    this.actionRequest.pageIndex = page - 1;
    this.getActionList();
  }

  onApplicationStatusPageChange(page: number) {
    this.statusRequest.pageIndex = page - 1;
    this.getStatusList();
  }
}
