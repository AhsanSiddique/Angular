import { Directive, Input } from '@angular/core';
import { CardGetByApplicationId } from '@fan-id/api/server';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class CardDataInput {
  @Input()
  card_data: CardGetByApplicationId;
}
