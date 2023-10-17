import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { DataTableDirective } from 'angular-datatables';
import { ICustomerCardActionGetListItem, ICustomerCardActionGetListRequest } from '@fan-id/api/server';
import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { dataColumns, tableColumns } from './card-action-columns';

@Component({
  selector: 'fan-id-card-action-list',
  templateUrl: './card-action-list.component.html',
  styleUrls: ['./card-action-list.component.scss']
})
export class CardActionListComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() applicationId: number;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings | undefined;

  pageConfig = {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  }
  dtTrigger = new Subject<any>();
  filter: ICustomerCardActionGetListRequest = {};
  dataList: ICustomerCardActionGetListItem[] | null = [];
  dataColumns = dataColumns;
  tableColumns = tableColumns;
  private apiUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
  ) { 
    this.apiUrl = this.config.apiUrl;
  }

  ngOnInit() {
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.filter = { refApplication_Id: this.applicationId }
    this.dtOptions = {
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,
      serverSide: true,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.http
          .post<any>(
            this.apiUrl+'/api/CustomerCardAction/getList',
            {
              ...this.filter,
              pageIndex:
                dataTablesParameters.start / dataTablesParameters.length,
            }
          )
          .pipe(catchError(() => {
            return of({
              dataList: [],
              totalCount: 0
            })
          }))
          .subscribe((resp) => {
            if(resp.dataList){
             this.dataList = resp.dataList
            }
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
      },
      columns: this.tableColumns,
      initComplete: function (settings, json) {
        $('#cardaction-datatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  gotoPage(page: number) {
    const index = page - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

}
