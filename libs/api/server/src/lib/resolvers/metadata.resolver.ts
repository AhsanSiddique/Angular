import { Injectable } from '@angular/core';
import { Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetaDataLookup, NationalityDropDownResponse, NationalityLookup } from '../models/metadata.model';
import { MetadataParams, MetadataService } from '../services/metadata.service';

export interface MetadataResolve {
  application_types: MetaDataLookup[];
  // gcc_countries: NationalityLookup[];
  fancategories: MetaDataLookup[];
  countries: NationalityLookup[];
  titles: MetaDataLookup[];
  phonecodes: NationalityDropDownResponse[];
  // medicals: MetaDataLookup[];
  user_categories: MetaDataLookup[];
  genders: MetaDataLookup[];
  purpose_of_visit: MetaDataLookup[];
  profession: MetaDataLookup[];
}

export type TMetadataResolveKeys = keyof MetadataResolve;
export type TMetaDataLookupKeys = keyof MetaDataLookup;
export type TNationalityLookupKeys = keyof NationalityLookup;

@Injectable({
  providedIn: 'root'
})
export class MetadataResolver implements Resolve<MetadataResolve> {
  constructor(private metadataService: MetadataService) {}

  metaDataLookupParam: MetadataParams = {};

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MetadataResolve> {
    const endpoint = route.routeConfig.path;
    const isEdit = endpoint.includes('edit');
    console.log({endpoint, isEdit})
    return forkJoin({
      application_types: this.metadataService.getApplicationTypes(this.metaDataLookupParam),
      // gcc_countries: this.metadataService.getNationalities({...this.metaDataLookupParam, code:'GCC'}),
      fancategories: this.metadataService.getCustomerCategories({...this.metaDataLookupParam, filter: !isEdit}),
      countries: this.metadataService.getNationalities(this.metaDataLookupParam),
      titles: this.metadataService.getTitles(this.metaDataLookupParam),
      phonecodes: this.metadataService.getDialingCodes(),
      // medicals: this.metadataService.getMedicalInformations(this.metaDataLookupParam),
      user_categories: this.metadataService.getRegUserCategories(this.metaDataLookupParam),
      delivery_types: this.metadataService.getDeliveryTypes(this.metaDataLookupParam),
      service_centres: this.metadataService.getServiceCentres(this.metaDataLookupParam),
      passportType: this.metadataService.getPassportTypes(this.metaDataLookupParam),
      genders: this.metadataService.getGenders(this.metaDataLookupParam),
      purpose_of_visit: this.metadataService.getPurposeOfVisit(this.metaDataLookupParam),
      profession: this.metadataService.getProfession(this.metaDataLookupParam),
    }).pipe(catchError(err => {
      console.log({err})
      return EMPTY
    }))
  }
}
