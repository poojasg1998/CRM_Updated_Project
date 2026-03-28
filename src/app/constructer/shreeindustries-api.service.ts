import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShreeindustriesApiService {
  url = 'https://superadmin-azure.right2shout.in/shreeindustriesController';
  callurl = 'https://chat.right2shout.in/calls/shree';

  constructor(private http: HttpClient, private router: Router) {}

  login(username, password) {
    let params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('deviceid', 'Mobile')
      .set('browser', 'Android');
    return this.http.post(this.url + '/login', params);
  }

  getVersionCode(execid: string, session_id: string) {
    const body = new URLSearchParams();
    body.set('X-Session-Id', session_id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const postUrl =
      this.url +
      `/get_ionic_version/?ExecId=${execid}&X-Session-Id=${session_id}`;
    return this.http.post(postUrl, body.toString(), {
      headers: headers,
    });
  }

  getLeadsCount(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('materials', param.materials);
    return this.http.get(this.url + '/count_leads_listing', {
      params,
    });
  }

  getLeadsListing(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('status', param.status)
      .set('materials', param.materials);
    return this.http.get(this.url + '/leads_listing', {
      params,
    });
  }

  getMaterial() {
    return this.http.get(this.url + '/material_listing');
  }

  addNewLead(param) {
    let params = new HttpParams()
      .set('name', param.name)
      .set('phone', param.phone)
      .set('message', param.message)
      .set('materials', param.materials);
    return this.http.post(this.url + '/push_newlead', params);
  }

  outboundCall(param) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('execid', param.execid);
    urlSearchParams.append('callto', param.callto);
    urlSearchParams.append('leadid', param.leadid);
    urlSearchParams.append('starttime', param.starttime);
    urlSearchParams.append('modeofcall', param.modeofcall);
    urlSearchParams.append('leadtype', param.leadtype);
    urlSearchParams.append('assignee', param.assignee);
    urlSearchParams.append('tabid', param.tabid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.callurl + '/trgrcls', body, { headers: headers })
      .pipe(map((response) => response));
  }

  onCallDisconnected(number) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('emp_phone', number);

    var body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );

    return this.http
      .post<any>(this.callurl + '/mnltrgr', body, { headers: headers })
      .pipe(map((response) => response));
  }

  fetchLiveCall(loginid, tabid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('loginid', loginid);
    urlSearchParams.append('tabid', tabid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.callurl + '/lvecls', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getLeadsDetail(leadid, tabid) {
    let params = new HttpParams().set('leadid', leadid).set('tabid', tabid);

    return this.http.get(this.url + '/get_leaddetails', {
      params,
    });
  }

  updateLeadStatus(param, tabid) {
    if (tabid == '2') {
      let params = new HttpParams()
        .set('leadid', param.leadid ?? '')
        .set('name', param.name ?? '')
        .set('email', param.email ?? '')
        .set('jobid', param.jobid ?? '')
        .set('message', param.message ?? '')
        .set('status', param.status ?? '');
      return this.http.post(this.url + '/job_status_update', params);
    } else {
      let params = new HttpParams()
        .set('leadid', param.leadid ?? '')
        .set('status', param.status ?? '')
        .set('message', param.message ?? '')
        .set('materials', param.materials ?? '');
      return this.http.post(this.url + '/leads_status_update', params);
    }
  }

  getCallRecords(param) {
    let params = new HttpParams()
      .set('loginid', param.loginid)
      .set('execid', param.execid)
      .set('clientnum', param.clientnum)
      .set('tabid', param.tabid)
      .set('execid', localStorage.getItem('UserId'));
    return this.http.post(this.callurl + '/alcls', params);
  }

  getjobLeadsCount(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('jobid', param.jobid);
    return this.http.get(this.url + '/count_careers_leads_listing', {
      params,
    });
  }

  getjobRoles() {
    return this.http.get(this.url + '/jobrole_listing');
  }

  getJobLeadsList(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('status', param.status)
      .set('jobid', param.jobid);
    return this.http.get(this.url + '/careers_leads_listing', {
      params,
    });
  }

  addJobRole(param) {
    let params = new HttpParams()
      .set('name', param.name)
      .set('phone', param.phone)
      .set('jobrole', param.jobrole)
      .set('message', param.message)
      .set('email', param.email);
    return this.http.post(this.url + '/add_careerleads', params);
  }

  logOut(sessionid, userid) {
    let urlSearchParams = new URLSearchParams();
    urlSearchParams.append('X-Session-Id', sessionid);
    urlSearchParams.append('User_Id', userid);
    let body = urlSearchParams.toString();
    let headers = new HttpHeaders().set(
      'Content-Type',
      'application/x-www-form-urlencoded'
    );
    return this.http
      .post<any>(this.url + '/logout', body, { headers: headers })
      .pipe(map((response) => response));
  }

  getMarketingCalls(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('limit', param.limit)
      .set('limitrows', param.limitrows)
      .set('execid', param.execid)
      .set('status', param.status);
    return this.http.get(this.url + '/marketing_getcall', {
      params,
    });
  }
  getMarketingCallsCount(param) {
    let params = new HttpParams()
      .set('fromdate', param.fromDate)
      .set('todate', param.toDate)
      .set('execid', param.execid)
      .set('status', param.status);
    return this.http.get(this.url + '/count_marketing_getcall', {
      params,
    });
  }
  getMarketingCallStatus() {
    return this.http.get(this.url + '/market_callstatus_list');
  }
  getMarketingExecutiveList() {
    return this.http.get(this.url + '/market_executives_list');
  }

  isActiveRoute(url) {
    return this.router.url.indexOf(url) == 1;
  }
}
