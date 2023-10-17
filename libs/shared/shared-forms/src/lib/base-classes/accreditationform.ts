import { Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConferenceEventProfileResponse } from '@fan-id/api/server';
import { convertCsvLineToArray } from '@fan-id/shared/utils/common';
import { getAccreditationFormControls } from '@fan-id/shared/utils/form';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class AccreditationForm {
  accreditationForm: FormGroup;

  initializeAccreditationForm(parentForm: FormGroup) {
    const accreditationForm = {
      ...getAccreditationFormControls(),
    }
    parentForm.addControl('accreditationForm', new FormGroup(accreditationForm));
    this.accreditationForm = parentForm.get('accreditationForm') as FormGroup;
  }

  getAccreditationInsertBody(parentForm: FormGroup) {
    const formValue = this.accreditationForm.getRawValue();
    const applicationForm = parentForm.get('applicationForm') as FormGroup;
    const personalInfoForm = parentForm.get('personalInfoForm') as FormGroup;
    const applicationFormValue = applicationForm.getRawValue();
    const personalInfoFormValue = personalInfoForm.getRawValue();
    const profileId = applicationFormValue.conference_profile?.profileId;
    const serviceId = applicationFormValue.conference_profile?.services?.service?.[0]?.id;
    const visaOnlyDefaultValues = this.getVisaOnlyDefaultValues(applicationFormValue.conference_profile);
    const body = {
      RefCustomerComapanyProfileIds: profileId,
      RefCustomerServicesIds: serviceId,
      RefCustomerBelongingsIds: formValue.conference_belongings?.toString?.(),
      RefRegUserCategory_Code: formValue.conference_categories?.toString?.(),
      RefCustomerzonesIds: formValue.conference_zones?.toString?.(),
      // profession fields
      RefProfession_Code: formValue.conference_functions?.toString?.(),
      otherProfession: formValue.conference_function?.toString?.(),
      otherProfessionAR: formValue.conference_functionAr?.toString?.(),
      // organization fields
      RefCustomerAccreditationOrganizationsIds: formValue.conference_organizations?.toString?.(),
      OrganizationEnName: formValue.conference_organization?.toString?.(),
      OrganizationArName: formValue.conference_organizationAr?.toString?.(),
      RefEventsCustomerVenuesIds: formValue.conference_venues?.toString?.(),
      isNewRegisterationFromAccreditation: true,
      RepresentingCountryCode: formValue.conference_representing_country?.toString?.(),
      RefTitle_Code: personalInfoFormValue.title,
      MOFATitleEN: personalInfoFormValue.titleEN,
      MOFATitleAR: personalInfoFormValue.titleAR,
      ...visaOnlyDefaultValues
    }
    // delete if value undefined
    Object.keys(body).forEach((key) => {
      if (!body[key]) delete body[key];
    })
    //
    if (body.otherProfession || body.otherProfessionAR) {
      body.RefProfession_Code = 'OTHR';
    }
    console.log({ AccreditationInsertBody: body });
    return body;
  }

  getAccreditationFormValueFromApplicantData(applicantData: any) {
    const conference_belongings = convertCsvLineToArray({ csv: applicantData?.refCustomerBelongingsIds });
    const conference_zones = convertCsvLineToArray({ csv: applicantData?.refCustomerzonesIds });
    const conference_venues = convertCsvLineToArray({ csv: applicantData?.refEventsCustomerVenuesIds });
    const conference_organizations = convertCsvLineToArray({ csv: applicantData?.refCustomerAccreditationOrganizationsIds });
    const accreditationFormValue = {
      conference_categories: applicantData?.userCategoryCode,
      conference_functions: applicantData?.professionCode,
      conference_function: applicantData?.otherProfession,
      conference_functionAr: applicantData?.otherProfessionAR,
      conference_representing_country: applicantData?.representingCountryCode,
      conference_belongings,
      conference_zones,
      conference_venues,
      conference_organizations,
      conference_organization: applicantData?.organizationEnName,
      conference_organizationAr: applicantData?.organizationArName,
    }
    console.log({ accreditationFormValue });
    return accreditationFormValue;
  }

  getVisaOnlyDefaultValues(conference_profile: ConferenceEventProfileResponse) {
    if (!conference_profile?.visaOnly) return {};
    return {
      RefCustomerBelongingsIds: conference_profile?.belongings?.belonging?.[0]?.id,
      RefCustomerzonesIds: conference_profile?.zones?.zone?.[0]?.id,
      RefProfession_Code: conference_profile?.categories?.category?.[0]?.functionsList?.function?.[0]?.code,
      RefCustomerAccreditationOrganizationsIds: conference_profile?.organizations?.organization?.[0]?.id,
      RefEventsCustomerVenuesIds: conference_profile?.venues?.venue?.[0]?.id,
    }
  }
}
