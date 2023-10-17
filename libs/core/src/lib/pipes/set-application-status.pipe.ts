import { Pipe, PipeTransform } from '@angular/core';
import { ApplicationStatus } from '@fan-id/api/server';

@Pipe({
  name: 'setApplicationStatus'
})
export class SetApplicationStatusPipe implements PipeTransform {

  transform(value: any, status: number) {
    const finalValue = status === ApplicationStatus.Pending_Verification ? 'Pending (Verification Check)' : value;
    return finalValue ?? 'NA';
  }

}
