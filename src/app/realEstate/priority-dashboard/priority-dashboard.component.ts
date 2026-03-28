import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MandateService } from '../mandate-service.service';
import { IonContent, IonModal } from '@ionic/angular';
import { catchError, forkJoin, of } from 'rxjs';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-priority-dashboard',
  templateUrl: './priority-dashboard.component.html',
  styleUrls: ['./priority-dashboard.component.scss'],
})
export class PriorityDashboardComponent implements OnInit {
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('onCallDetailsPage') onCallDetailsPage;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  showInfiniteScroll = true;
  isOnCallDetailsPage = false;
  propertyLists;
  filteredParams = {
    roleId: '',
    team: '',
    teamlead: '',
    fromDate: new Date().toLocaleDateString('en-CA'),
    toDate: new Date().toLocaleDateString('en-CA'),
    executid: '',
    leads: '',
    source: '',
    status: 'active',
    stage: '',
    propid: '',
    priority: '1',
    stagestatus: '',
    isDateFilter: 'today',
    activeCardKey: '',
    activeExec: '1',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  roleid: string;
  roletype: string;
  userid: string;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  showFromDateError = false;
  teamNames = [
    { name: 'All', value: '' },
    { name: 'RM Executives', value: '50002' },
    { name: 'CS Executives', value: '50014' },
  ];
  executiveNames;
  leads_count = {
    hotLeads: '',
    warmLeads: '',
    coldLeads: '',
    hotVisits: '',
    warmVisits: '',
    coldVisits: '',
  };
  showSpinner: boolean;
  leads: any;
  todaysDate: Date;
  lead: any;
  isRM: boolean;
  count = 0;
  page: any;
  sourceList: any;

  constructor(
    private activeRoute: ActivatedRoute,
    public router: Router,
    private mandateService: MandateService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.roleid = localStorage.getItem('Role');
    this.roletype = localStorage.getItem('RoleType');
    this.userid = localStorage.getItem('UserId');
    this.isRM =
      localStorage.getItem('Role') == '50001' ||
      localStorage.getItem('Role') == '50002' ||
      localStorage.getItem('Role') == '50009' ||
      localStorage.getItem('Role') == '50010';
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.getqueryParam();
      this.getSource();
      this.fetchPropertyLists();
      this.fetchexecutives();

      this.todaysDate = this.getTodayDate();

      if (this.sharedService.hasState) {
        this.showSpinner = false;
        this.leads = this.sharedService.enquiries;
        this.page = this.sharedService.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this.sharedService.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this.sharedService.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCout();
      }
    });
  }
  onFilterSelection(data, value) {
    this.resetInfiniteScroll();
    switch (data) {
      case 'property':
        this.filteredParams.propid = value.property_idfk;
        break;
      case 'exec':
        console.log(value);
        this.filteredParams.executid = value.value;
        break;
      case 'leadsPriority':
        this.filteredParams.priority = value;
        this.filteredParams.status = 'active';
        break;
      case 'visitsPriority':
        this.filteredParams.priority = value;
        this.filteredParams.status = 'allvisits';
        this.filteredParams.stagestatus = '3';
        break;
      case 'team':
        this.filteredParams.roleId = value.value;
        console.log(value);
        break;
      case 'source':
        this.filteredParams.source = value.value;
        console.log(value);
        break;

      default:
        break;
    }
    this.addQueryParams();
  }
  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  getqueryParam() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (
        key !== 'loginid' &&
        key !== 'limit' &&
        key !== 'limitrows' &&
        key != 'priority' &&
        key != 'status'
      ) {
        this.filteredParams[key] = '';
      }
    });

    this.filteredParams.teamlead = this.roletype == '1' ? this.userid : '';
  }

  dateFilter(dateType) {
    this.resetInfiniteScroll();
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];

    if (
      dateType != 'custom' &&
      dateType != 'customfromDate' &&
      dateType != 'customtoDate'
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.isDateFilter = dateType;
    }

    if (dateType === 'today') {
      this.filteredParams.fromDate = format(today);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromDate = format(y);
      this.filteredParams.toDate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'custom') {
      this.filteredParams.isDateFilter = dateType;
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      this.filteredParams.isDateFilter = 'custom';
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.toDate = '';
        this.dateRange.todate = null;
      } else {
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();
      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
      this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    } else if (dateType == 'allTime') {
      this.filteredParams.isDateFilter = 'allTime';
      this.filteredParams.fromDate = '';
      this.filteredParams.toDate = '';
    } else if (dateType == 'last3days') {
      const from = new Date(today);
      from.setDate(from.getDate() - 2);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(today);
    }
    this.addQueryParams();
  }

  reset() {
    this.resetInfiniteScroll();
    this.filteredParams = {
      roleId: '',
      team: '',
      fromDate: '',
      toDate: '',
      isDateFilter: 'allTime',
      executid: '',
      teamlead: '',
      status: 'active',
      leads: '',
      source: '',
      stagestatus: '3',
      propid: '',
      activeExec: '1',
      priority: '1',
      loginid: localStorage.getItem('UserId'),
      stage: '',
      activeCardKey: 'hotleads_card',
      limit: 0,
      limitrows: 5,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
  }
  //To get the property lists
  fetchPropertyLists() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .getmandateprojects1(localStorage.getItem('UserId'))
        .subscribe(
          (response) => {
            if (response['status'] === 'True') {
              this.propertyLists = response['Properties'];
              resolve(true);
            } else {
              reject('Failed to fetch project names');
            }
          },
          (error) => {
            console.error('Error fetching project names:', error);
            reject(error);
          }
        );
    });
  }

  fetchexecutives() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .fetchmandateexecutives1(
          this.filteredParams.propid,
          this.filteredParams.team,
          this.filteredParams.activeExec,
          this.filteredParams.roleId,
          this.roletype == '1' ? this.userid : ''
        )
        .subscribe((response) => {
          this.executiveNames = response['mandateexecutives'];
          this.executiveNames = [
            { name: 'All', executid: '' },
            ...(response['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];
          resolve(true);
        });
    });
  }
  getLeadsCout() {
    this.showSpinner = true;
    const requests = [];
    const leadsPriority = ['1', '2', '3'];
    leadsPriority.forEach((priority) => {
      const params = {
        ...this.filteredParams,
        priority: priority,
        stagestatus: 3,
        status: 'active',
      };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${status}`, error);
            return of(null);
          })
        )
      );
    });
    const coldPriority = ['1', '2', '3'];
    coldPriority.forEach((priority) => {
      const params = {
        ...this.filteredParams,
        priority: priority,
        stagestatus: 3,
        status: 'allvisits',
      };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${status}`, error);
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.leads_count.hotLeads =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.leads_count.warmLeads =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.leads_count.coldLeads =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 3:
            this.leads_count.hotVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 4:
            this.leads_count.warmVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 5:
            this.leads_count.coldVisits =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }
      });
      this.getLeadDetails(false);
    });
  }

  getLeadDetails(isLoadmore) {
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.mandateService
        .getAssignedLeadsDetail(this.filteredParams)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.leads = isLoadmore
              ? this.leads.concat(response['AssignedLeads'])
              : response['AssignedLeads'];

            this.showSpinner = false;
            resolve(true);
          } else {
            isLoadmore ? '' : (this.leads = []);
            this.showSpinner = false;
            resolve(false);
          }
        });
    });
  }

  getSource() {
    this.sharedService.sourcelist().subscribe((resp) => {
      this.sourceList = resp['Sources'];
    });
  }
  // Convert API date string to Date object
  toDate(dateStr: string): Date {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0); // remove time part
    return d;
  }

  calculateDiff(dateStr: string): number {
    if (!dateStr) return 0;

    const nextDate = this.toDate(dateStr);
    const diffTime = nextDate.getTime() - this.todaysDate.getTime();
    return Math.ceil(Math.abs(diffTime / (1000 * 60 * 60 * 24)));
  }
  getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }
  outboundCall(lead) {
    this.sliding.close();
    this.showSpinner = true;
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;

      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.LeadID,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-mandate',
        leadtype: 'mandate',
        assignee: this.lead.ExecId,
      };
      console.log(param);

      this.callConfirmationModal.dismiss();
      this.sharedService.outboundCall(param).subscribe((resp) => {
        if (resp['status'] == 'success') {
          this.showSpinner = false;
        } else {
          this.showSpinner = false;
        }
        //  this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.leadid
            ? this.lead.leadid
            : this.lead.lead_id
            ? this.lead.lead_id
            : this.lead.LeadID,
          execid: this.lead.Exec_IDFK
            ? this.lead.Exec_IDFK
            : this.lead.exec_id
            ? this.lead.exec_id
            : this.lead.ExecId,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: 'mandate',
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;

      this.showSpinner = false;
      this.callConfirmationModal.present();
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(
        `https://wa.me/+91 ${
          lead?.number
            ? lead?.number
            : lead.callto
            ? lead.callto
            : lead.cust_number
        }`,
        '_system'
      );
      // this.navigateToWhatsApp(lead.number);
    } else {
      this.outboundCall(lead);
    }
    this.sliding.close();
  }
  onCustomDateModalDismiss(event) {
    if (
      !(this.dateRange.fromdate && this.dateRange.todate) ||
      (this.dateRange.fromdate && !this.dateRange.todate)
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.isDateFilter = 'today';
      this.filteredParams.fromDate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.toDate = new Date().toLocaleDateString('en-CA');
      this.addQueryParams();
    }
  }
  // To open from date modal
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
  }
  // To open to date modal
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
  }
  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  loadData(event) {
    this.getLeadDetails(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }
  navigateToMandateCustomerPage(leadId, execid, lead) {
    this.sharedService.enquiries = this.leads;
    this.sharedService.page = this.page;
    this.sharedService.hasState = true;
    let propid;
    lead.suggestedprop.forEach((prop) => {
      if (lead.propertyname == prop.name) {
        propid = prop.propid;
      }
    });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        leadId: leadId,
        execid: execid,
        status: 'info',
        propid: propid,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  canScroll;
  onScroll(event: CustomEvent) {
    this.sharedService.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}
