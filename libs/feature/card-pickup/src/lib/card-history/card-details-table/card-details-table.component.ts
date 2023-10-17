import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AllApplicationsService, ApplicantService } from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-card-details-table',
  templateUrl: './card-details-table.component.html',
  styleUrls: ['./card-details-table.component.scss'],
})
export class CardDetailsTableComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @Input() applicationId: number;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings | undefined;
  card_details_error = '';
  card_details_modal: any;
  dtTrigger = new Subject<any>();
  card_toggle_loading = false;

  constructor(
    private applicantService: ApplicantService,
    private allApplicationService: AllApplicationsService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,
      serverSide: false,
      paging: false,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      // columns: this.tableColumns,
      initComplete: function (settings, json) {
        $('#carddetails-datatable').wrap(
          "<div class='fan-id-tablewrap'></div>"
        );
      },
    };
    this.applicantService
      .getCustomerCardList(this.applicationId.toString())
      .pipe(take(1))
      .subscribe(
        (response) => {
          const cardList = response?.dataList ?? [];

          // if(!cardList?.length) {
          //   this.card_details_error = 'Records not Found'
          //   return;
          // }

          cardList.sort(
            (cardA, cardB) => cardB?.customerCardId - cardA?.customerCardId
          );

          this.card_details_modal = cardList.map((card) => {
            const {
              id,
              isCardActive: status,
              refApplication_Id,
              cardStatus_Name,
              cardSerialNo,
              ...rest
            } = card;
            const _status = status;
            return {
              id,
              isCardActive: _status,
              status: _status,
              refApplication_Id,
              cardStatus_Name,
              cardSerialNo,
              ...rest,
            };
          });
          // this.card_details_open = true;
          console.log(this.card_details_modal);
        },
        (err) => {
          console.log({ err });
          this.card_details_error =
            err?.error?.message || 'Something went wrong!';
        }
      );
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
  checkStatus(id: number) {
    this.card_details_modal = this.card_details_modal.map((_c) => {
      if (_c.id === id) {
        _c.isCardActive = !_c.isCardActive;
      }
      return _c;
    });
    const card = this.card_details_modal.find((c) => c.id === id);
    this.card_toggle_loading = true;
    const { id: cardId, refApplication_Id: applicationId } = card;
    const body = { cardId, applicationId, status: card.isCardActive };

    // [temperory] remove after when api-integration is complete in card-pickup and card-replacement
    // if (!cardId) {
    //   this.card_toggle_loading = false;
    //   return;
    // }

    this.allApplicationService
      .toggleCardStatus(body)
      .pipe(take(1))
      .subscribe(
        (response) => {
          console.log({ response });
          this.card_toggle_loading = false;
        },
        (err) => {
          alert('Error!');
          this.card_details_modal = this.card_details_modal.map((_c) => {
            if (_c.id === id) {
              _c.isCardActive = !_c.isCardActive;
            }
            return _c;
          });
          console.log({ err });
          this.card_toggle_loading = false;
        }
      );
  }
  gotoPage() {}
}
