import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'fan-id-card-history',
  templateUrl: './card-history.page.html',
  styleUrls: ['./card-history.page.scss']
})
export class CardHistoryPageComponent implements OnInit {
  active = 1;
  applicationId!: number;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.applicationId = +this.route.snapshot.queryParamMap.get('id');
  }

}
