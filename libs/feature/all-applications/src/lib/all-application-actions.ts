export const EDIT_ACTIONS = [
  {
    name: 'Update Info',
    submitReasonType: 3,
    validate: validateUpdateInfo,
  },
  {
    name: 'Re-Submit',
    submitReasonType: 2,
    validate: validateReSubmit,
  },
  {
    name: 'Re-Apply',
    submitReasonType: 6,
  },
];

enum PermissionRole {
  AllowUpdateUnlimited = "Allow Update Unlimited",
  AllowResubmitUnlimited = "Allow Resubmit Unlimited",
}

const ACTION_ERROR_MESSAGES = {
  NO_ERROR: { errorMessage: '' },
  MAX_UPDATE_INFO_REACHED: { errorMessage: 'You have reached the maximum limit of Update Info' },
  MAX_RESUBMIT_REACHED: { errorMessage: 'You have reached the maximum limit of Resubmit' },
};

function getPermissionList() {
  return JSON.parse(localStorage.getItem('PermissionList'));
}

function userHasFullAccess(): boolean {
  const permissionList = getPermissionList();
  return permissionList?.fullAccess;
}

function unlimitedActionAllowed(role: PermissionRole): boolean {
  if(userHasFullAccess()) return true;
  const permissionList = getPermissionList();
  return permissionList?.roles?.find(
    (element) => element?.key === role
  )?.value?.allow;
}

function validateUpdateInfo(data): { errorMessage: string } {
  if(unlimitedActionAllowed(PermissionRole.AllowUpdateUnlimited)) {
    return ACTION_ERROR_MESSAGES.NO_ERROR;
  }
  if(data?.remainingUpdateCount <= 0) {
    return ACTION_ERROR_MESSAGES.MAX_UPDATE_INFO_REACHED;
  }
  return ACTION_ERROR_MESSAGES.NO_ERROR;
}

function validateReSubmit(data): { errorMessage: string } {
  if(unlimitedActionAllowed(PermissionRole.AllowResubmitUnlimited)) {
    return ACTION_ERROR_MESSAGES.NO_ERROR;
  }
  if(data?.remainingResubmitCount <= 0) {
    return ACTION_ERROR_MESSAGES.MAX_RESUBMIT_REACHED;
  }
  return ACTION_ERROR_MESSAGES.NO_ERROR;
}