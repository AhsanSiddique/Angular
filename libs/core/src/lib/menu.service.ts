import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  eventSubject = new BehaviorSubject('');

  constructor() {
    const event = this.getSelectedEvent();
    this.eventSubject.next(event);
  }
  public setEvent(event) {
    localStorage.setItem('event', event.name);
    localStorage.setItem('eventCode', event.code);
    localStorage.setItem('eventType',event.tournamentType);
    localStorage.setItem('eventStartDate', event.startDate);
    this.eventSubject.next(event.name);
  }
  public setDisplayEvent(event){
    localStorage.setItem('displayEvent',event);
  }
  public getSelectedEvent() {
    return localStorage.getItem('event');
  }
  public getSelectedEventCode() {
    return localStorage.getItem('eventCode');
  }
  public getSelectedEventStartDate() {
    return localStorage.getItem('eventStartDate');
  }
  public removeEvent() {
    this.eventSubject.next(null);
    return localStorage.removeItem('event');
  }
  public getTerminal() {
    return JSON.parse(localStorage.getItem('Terminal'));
  }
  public getTerminalCode() {
    return this.getTerminal()?.code;
  }
  public getTerminalName() {
    return this.getTerminal()?.name;
  }
  public getOrganizationId() {
    return localStorage.getItem('organizationId');
  }
  public getUserTypeBR() {
    return localStorage.getItem('brUserType');
  }

  get isUserTypeAgent() {
    return this.getUserTypeBR() === 'Admin' || this.getUserTypeBR() === 'Superuser';
  }
}
