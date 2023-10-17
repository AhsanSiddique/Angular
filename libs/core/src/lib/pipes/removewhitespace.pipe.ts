import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "removewhitespace",
})
export class RemovewhitespacePipe implements PipeTransform {
  transform(value: string): unknown {
    return value?.replace(/ /g, "");
  }
}
