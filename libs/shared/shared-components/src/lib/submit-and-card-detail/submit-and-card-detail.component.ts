import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AllApplicationsService } from '@fan-id/api/server';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-submit-and-card-detail',
  templateUrl: './submit-and-card-detail.component.html',
  styleUrls: ['./submit-and-card-detail.component.scss'],
})
export class SubmitAndCardDetailComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() status: any;
  @Input() type: any;
  @Input() cardDetails: any;
  @Input() status_switch_visible? = true;

  card_toggle_loading = false;
  constructor(private allApplicationService: AllApplicationsService) {}

  ngOnInit(): void {
    if (this.type.toLowerCase() == 'carddetail') {
      console.log({ cardDetails: this.cardDetails });
    }
  }

  checkStatus(id: number) {
    this.cardDetails = this.cardDetails.map(_c => {
      if(_c.id === id) {
        _c.isCardActive = !_c.isCardActive;
      }
      return _c;
    })
    const card = this.cardDetails.find(c => c.id === id);
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
          this.cardDetails = this.cardDetails.map(_c => {
            if(_c.id === id) {
              _c.isCardActive = !_c.isCardActive;
            }
            return _c;
          })
          console.log({ err });
          this.card_toggle_loading = false;
        }
      );
  }
}
