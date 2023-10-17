import { Directive, EventEmitter, Output } from '@angular/core';
import { EFilterState } from './accommodation.common';
import { BehaviorSubject } from 'rxjs';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class AccommodationTableBase {
  @Output() filterBooleans = new EventEmitter<any>();
  private _filterState: EFilterState = EFilterState.NONE;
  dtOptions!: DataTables.Settings;
  dtProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get filterState() {
    return this._filterState;
  }

  set filterState(state: EFilterState) {
    this._filterState = state;
    this.filterBooleans.emit({
      normal: state === EFilterState.NORMAL,
      advanced: state === EFilterState.ADVANCED,
    });
  }

  clearFilter() {
    console.log("clearFilter");
  }

  advancedFilterClick() {
    document.getElementById('toggleAdvFilter')?.click();
  }

  showExportModal() {
    console.log("showExportModal");
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }
}
