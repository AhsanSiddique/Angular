import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'fan-id-knowledge-base-fab',
  templateUrl: './knowledge-base-fab.component.html',
  styleUrls: ['./knowledge-base-fab.component.scss']
})
export class KnowledgeBaseFabComponent {
  @Input() fabState: 'open' | 'closed' = 'closed';

  constructor(private router: Router) {}

  showInfo() {
    this.fabState = 'open';
  }

  hideInfo() {
    this.fabState = 'closed';
  }

  redirectToKnowledgeBase() {
    this.router.navigate(['main/knowledge-base']);
  }
}