import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: "dateformatpipe" })
export class DateFormatPipe implements PipeTransform {
  // adding a default value in case you don't want to pass the format then 'yyyy-MM-dd' will be used
  transform(incomingDate: any): string {
    const date = new Date(incomingDate);
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    let dt = date.getDate().toString();

    if (parseInt(dt) < 10) {
      dt = "0" + dt;
    }
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    return dt + "-" + month + "-" + year;
  }
}
