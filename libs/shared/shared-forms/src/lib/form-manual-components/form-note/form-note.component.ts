import { Component, Input } from '@angular/core';
import { TournamentType } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-form-note',
  template: `
    <div class="form-note" *ngIf="parent === 'application-form'">
      <p class="form-note-title">{{ translateKey + '.PleaseNote' | translate }}:</p>
      <!-- <p class="form-note-item" *ngIf="eventTournamentType === 1">{{ translateKey + '.note3' | translate }}</p> -->
      <p class="form-note-item">{{ translateKey + '.note3' | translate }}</p>
      <!-- <ol *ngIf="eventTournamentType === 2">
        <li>
          {{ translateKey + '.note1' | translate }}
        </li>
        <li>
          {{ translateKey + '.note2' | translate }}
        </li>
      </ol> -->
    </div>

    <div class="form-note" *ngIf="parent === 'personal-form'">
      <p class="form-note-title">{{ translateKey + '.PleaseNote' | translate }}:</p>
      <p class="form-note-item">{{ translateKey + '.note4' | translate }}</p>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .form-note {
        background-color: #E2D1E6;
        padding: 1rem 1.5rem;
        color: #550065;
        font-size: 12px;
      }

      p.form-note-title {
        font-weight: 500;
        margin-bottom: 0.8rem;
      }

      ol {
        padding-inline: unset;
        list-style-position: inside;
      }

      li {
        font-size: 14px;
        margin-bottom: 0.8rem;
        list-style-position: outside;
        margin-left: 1rem;
      }

      p.form-note-item {
        margin-bottom: 0;
      }
    `,
  ],
})
export class FormNoteComponent {
  @Input() parent? = 'application-form'
  @Input() eventTournamentType?: TournamentType = 2
  translateKey = 'formNote';
}
