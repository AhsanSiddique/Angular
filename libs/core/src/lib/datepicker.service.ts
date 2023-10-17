import { Injectable } from '@angular/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

function addZeroPrefixDate(val: number) {
  return (val < 10 ? '0' : '') + val;
}

@Injectable({
  providedIn: 'root',
})
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '-';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? addZeroPrefixDate(date.day) +
          this.DELIMITER +
          addZeroPrefixDate(date.month) +
          this.DELIMITER +
          date.year
      : '';
  }
}

@Injectable({
  providedIn: 'root',
})
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    console.log(value);
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date
      ? addZeroPrefixDate(date.day) +
          this.DELIMITER +
          addZeroPrefixDate(date.month) +
          this.DELIMITER +
          date.year
      : null;
  }
}
