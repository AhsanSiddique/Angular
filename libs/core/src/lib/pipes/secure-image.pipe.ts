import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'secureImage'
})
export class SecureImagePipe implements PipeTransform {

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  transform(url: string) {
    if (!url) return of('');
    return this.http.get(url, { responseType: 'blob' })
    .pipe(
      map(res => {
        return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res))
      }));
  }

}
