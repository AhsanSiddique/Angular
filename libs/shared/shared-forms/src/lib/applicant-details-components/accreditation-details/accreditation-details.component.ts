import { Component, OnInit } from '@angular/core';
import { ApplicantDataInput } from '../../base-classes';
import { BehaviorSubject, of } from 'rxjs';
import { ActiveConferenceEventListResponse, ConferencesByCodeResponse, OrganizationService } from '@fan-id/api/server';
import { catchError, map } from 'rxjs/operators';
import { convertCsvLineToArray } from '@fan-id/shared/utils/common';

@Component({
  selector: 'fan-id-accreditation-details',
  templateUrl: './accreditation-details.component.html',
  styleUrls: ['./accreditation-details.component.scss']
})
export class AccreditationDetailsComponent extends ApplicantDataInput implements OnInit {
  private _accreditationData = null;
  accreditationData$ = new BehaviorSubject<any>(null);

  constructor(private organizationService: OrganizationService) {
    super();
  }

  ngOnInit() {
    const conferenceId = this.applicant_data?.refConferenceEvent_Id;
    const conferenceProfileId = this.applicant_data?.refCustomerComapanyProfileIds;
    console.log({ conferenceId, conferenceProfileId });
    this.setAccreditationData({conferenceId, conferenceProfileId});
  }

  get accreditationData() {
    return this._accreditationData;
  }

  set accreditationData(value) {
    this._accreditationData = value;
    this.accreditationData$.next(value);
  }

  async setAccreditationData({ conferenceId, conferenceProfileId }) {
    if (!conferenceId || !conferenceProfileId) return;
    const conference = (await this.getConferenceEventList().toPromise())
      .find(({ confrenceId }) => confrenceId === conferenceId);
    const conferenceProfileList = await this.getConferenceProfileList(conference?.code).toPromise();
    const conferenceProfile = conferenceProfileList
      .find((profile) => profile?.profileId === conferenceProfileId);
    const conference_belongings = convertCsvLineToArray({ csv: this.applicant_data?.refCustomerBelongingsIds, returnStringIfOnlyOne: false }) as string[];
    const conference_zones = convertCsvLineToArray({ csv: this.applicant_data?.refCustomerzonesIds, returnStringIfOnlyOne: false }) as string[];
    const conference_venues = convertCsvLineToArray({ csv: this.applicant_data?.refEventsCustomerVenuesIds, returnStringIfOnlyOne: false }) as string[];
    const conference_organizations = convertCsvLineToArray({ csv: this.applicant_data?.refCustomerAccreditationOrganizationsIds, returnStringIfOnlyOne: false }) as string[];
    const belongings = conference_belongings?.map(id => conferenceProfile?.belongings?.belonging?.find((belonging) => belonging?.id === id)?.enDesc);
    const zones = conference_zones?.map(id => conferenceProfile?.zones?.zone?.find((zone) => zone?.id === id)?.enDesc);
    const venues = conference_venues?.map(id => conferenceProfile?.venues?.venue?.find((venue) => venue?.id === id)?.enDesc);
    const organizations = conference_organizations?.map(id => conferenceProfile?.organizations?.organization?.find((organization) => organization?.id === id)?.englishName);
    const otherProfession = this.applicant_data?.otherProfession;
    const otherProfessionAR = this.applicant_data?.otherProfessionAR;
    const organizationEnName = this.applicant_data?.organizationEnName;
    const organizationArName = this.applicant_data?.organizationArName;
    this.accreditationData = {
      belongings: belongings?.join(','),
      zones: zones?.join(','),
      venues: venues?.join(','),
      organizations: organizations?.join(','),
      otherProfession,
      otherProfessionAR,
      organizationEnName,
      organizationArName,
    }
  }

  getConferenceEventList() {
    return this.organizationService.getActiveConferenceEventList().pipe(
      catchError((error) => { return of({} as ActiveConferenceEventListResponse) }),
      map((response) => response?.data?.conferenceEventLists ?? [])
    )
  }

  getConferenceProfileList(code: string) {
    return this.organizationService.getConferencesByCode(code).pipe(
      catchError((error) => { return of({} as ConferencesByCodeResponse) }),
      map((response) => response?.data?.profileResponse ?? [])
    )
  }


}
