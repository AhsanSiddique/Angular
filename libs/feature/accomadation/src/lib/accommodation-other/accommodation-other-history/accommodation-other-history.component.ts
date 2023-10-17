import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccommodationOtherHistoryGetListItem, AccommodationOtherHistoryGetListRequest } from '@fan-id/api/server';
import { FanIDConfig, Environment } from '@fan-id/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'fan-id-accommodation-other-history',
  templateUrl: './accommodation-other-history.component.html',
  styleUrls: ['./accommodation-other-history.component.scss']
})
export class AccommodationOtherHistoryComponent implements OnInit {
  // @ViewChild(DataTableDirective, { static: false })
  // dtElement!: DataTableDirective;

  pageConfig = {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 99,
  };
  // dtTrigger = new Subject<any>();
  filter: AccommodationOtherHistoryGetListRequest = {};
  // dtOptions!: DataTables.Settings;
  dtProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // indexSaveBool = true;
  // indexSave = 0;
  private apiUrl: string;
  dataList: AccommodationOtherHistoryGetListItem[] = [];
  dtColumns: any[] = [
    {
      title: "Created Date",
      data: "system_CreatedOn",
    },
    {
      title: "Accommodation Status",
      data: "otherAccommodationStatus",
    },
    {
      title: "Updated By",
      data: "system_CreatedBy",
    },
    {
      title: "Comments",
      data: "rejectReason",
    }
  ]

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  ngOnInit() {
    try {
      const fanIdNo = this.route.snapshot.queryParamMap.get('fanid');
      this.filter.orderByModel = [{ fieldName: "id", sortType: 1 }];
      this.filter.pageSize = this.pageConfig.itemsPerPage;
      this.filter.pageIndex = this.pageConfig.currentPage - 1;
      this.filter.countRequired = true;
      this.filter.filter = { fanIdNo };
      this.getDataList();

      // this.dtOptions = {
      //   paging: false,
      //   stateSave: true,
      //   pagingType: 'full_numbers',
      //   pageLength: 10,
      //   searching: false,
      //   ordering: false,
      //   processing: false,
      //   info: false,
      //   lengthChange: false,
      //   serverSide: true,
      //   language: {
      //     emptyTable: '',
      //     zeroRecords: '',
      //   },
      //   ajax: (dataTablesParameters: any, callback) => {
      //     if (this.indexSaveBool) {
      //       dataTablesParameters.start = this.indexSave;
      //     }
      //     this.indexSave = dataTablesParameters.start;
      //     this.http.post<any>(
      //         this.apiUrl + '/api/Accommodation/OtherAccommodationLogGetListByFanIdNo',
      //         {
      //           ...this.filter,
      //           pageIndex: dataTablesParameters.start / dataTablesParameters.length,
      //         }
      //       )
      //       .pipe(catchError(() => {
      //         return of({
      //           dataList: [],
      //           totalCount: 0
      //         })
      //       }))
      //       .subscribe((resp) => {
      //         console.log({ resp })
      //         this.dataList = resp?.dataList ?? [];
      //         callback({
      //           recordsTotal: resp.totalCount,
      //           recordsFiltered: resp.totalCount,
      //           data: [],
      //         });
      //       });
      //       this.indexSaveBool = false;
      //   },
      //   columns: this.dtColumns,
      //   initComplete: function (settings, json) {
      //     $("#historydatatable").wrap("<div class='fan-id-tablewrap'></div>");
      //   },
      //   preDrawCallback: () => {
      //     this.dtProcessing$.next(true);
      //   },
      //   drawCallback: () => {
      //     this.dtProcessing$.next(false);
      //   }
      // }
    } catch (error) {
      console.log(error);
    }
  }

  // ngAfterViewInit() {
  //   this.dtTrigger.next();
  // }

  // ngOnDestroy() {
  //   this.dtTrigger.unsubscribe();
  // }

  getDataList() {
    this.dtProcessing$.next(true);
    this.http.post<any>(
      this.apiUrl + '/api/Accommodation/OtherAccommodationLogGetListByFanIdNo',
      this.filter
    ).pipe(
      catchError(() => {
        return of({
          dataList: [],
          totalCount: 0
        })
      })
    ).subscribe({
      next: (response) => {
        this.dataList = response?.dataList ?? [];
        this.pageConfig.totalItems = response.totalCount;
        this.dtProcessing$.next(false);
      }
    })
  }

  // async getDataList({ clearState = true } = {}) {
  //   this.filter.pageSize = this.pageConfig.itemsPerPage;
  //   this.filter.countRequired = true;
  //   this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
  //   this.filter.pageIndex = 0;
  //   if (this.indexSaveBool) {
  //     (await this.dtElement.dtInstance).ajax.reload(undefined, false);
  //   } else {
  //     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //       clearState && dtInstance.state.clear();
  //       // Destroy the table first
  //       dtInstance.destroy();
  //       this.dtTrigger.next();
  //     });
  //   }
  // }

}
