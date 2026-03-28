import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonCheckbox, IonContent, MenuController } from '@ionic/angular';
import { MandateService } from '../mandate-service.service';
import { SharedService } from '../shared.service';
import { formatDate, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { IonModal } from '@ionic/angular';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-feedback-dashboard',
  templateUrl: './feedback-dashboard.component.html',
  styleUrls: ['./feedback-dashboard.component.scss'],
})
export class FeedbackDashboardComponent implements OnInit {
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('filterModal') filterModal;
  @ViewChild('propInfo') propInfo!: ElementRef;
  @ViewChild('visitedRMScrollContent', { static: false })
  visitedRMScrollContent!: IonContent;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  stages = ['USV', 'SV', 'RSV', 'FN'];
  selectedStageStatus: { [key: string]: string } = {};
  minDate;
  sourceSearchTerm;
  showFromDateError = false;
  isProgrammaticScroll = false;
  localStorage = localStorage;
  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  canScroll;
  isOnCallDetailsPage: boolean = false;
  leads_detail: any;
  isCheckbox = false;
  isManual = false;
  temporaryLeadIds = [];
  page = 1;
  isRM: boolean;
  checkedLeadsDetail: any[];
  fromExecids: any = [];
  isDemo;
  showInfiniteScroll = true;
  filteredParams = {
    fromDate: '',
    toDate: '',
    status: '',
    stage: '',
    stagestatus: '',
    rmid: '',
    tcid:
      localStorage.getItem('Role') === '1'
        ? ''
        : localStorage.getItem('UserId'),
    source: '',
    propid: '',
    receivedfromdate: '',
    receivedtodate: '',
    visitedfromdate: '',
    visitedtodate: '',
    activityfromdate: '',
    activitytodate: '',
    suggestedprop: '',
    visitedprop: '',
    counter: '',
    assignedfromdate: '',
    assignedtodate: '',
    FromTime: '',
    activeCardKey: '',
    ToTime: '',
    isDateFilter: '',
    visitedPropertyName: '',
    team: '',
    fromTime: '',
    toTime: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    active: '1',
    receivedToDate: '',
    limit: 0,
    limitrows: 5,
  };
  roleid: string;
  lead: any;
  count: number = 0;
  showSpinner: boolean;

  feedbackCount = {
    untouched: '',
    usvCount: '',
    svCount: '',
    rsvCount: '',
    fnCount: '',
    junkCount: '',
    ncCount: '',
  };
  propertyLists: any;
  roleType: string;
  tempFilteredValues: any = {
    fromDate: '',
    toDate: '',
    status: 'pending',
    stage: '',
    stagestatus: '',
    rmid: '',
    tcid: '',
    source: '',
    propid: '',
    receivedfromdate: '',
    receivedtodate: '',
    visitedfromdate: '',
    visitedtodate: '',
    activityfromdate: '',
    activitytodate: '',
    suggestedprop: '',
    visitedprop: '',
    counter: '',
    assignedfromdate: '',
    assignedtodate: '',
    FromTime: '',
    activeCardKey: 'untouched-card',
    ToTime: '',
    isDateFilter: '',
    visitedPropertyName: '',
    team: '',
    fromTime: '',
    toTime: '',
    executid: '',
    loginid: localStorage.getItem('UserId'),
    active: '',
    receivedToDate: '',
    limit: 0,
    limitrows: 5,
  };
  isLeftFilterActive: string;
  propertySearchedName: any;
  propertyList1: any;
  propertyList: any;
  executiveSearchedName;
  mandateExecutives: any[];
  mandateExecutives1: any[];
  mandateCSExecutives1: any;
  showSpinner1: boolean;
  mandateCSExecutives: any[];
  feedbackAssignSearchTerm: any;
  // selectedVisitedRM: any;

  constructor(
    private _location: Location,
    private menuCtrl: MenuController,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private mandateService: MandateService,
    public _sharedservice: SharedService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.isRM =
        localStorage.getItem('Role') == '50001' ||
        localStorage.getItem('Role') == '50002' ||
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010';
      this.isDemo = localStorage.getItem('Name') == 'demo';
      this.roleid = localStorage.getItem('Role');
      this.roleType = localStorage.getItem('RoleType');
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.getQueryParams();
      this.fetchPropertyLists();
      this.getExecutives();
      if (this._sharedservice.hasState) {
        this.showSpinner = false;
        this.leads_detail = this._sharedservice.enquiries;
        this.page = this._sharedservice.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this._sharedservice.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this._sharedservice.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.fetchFeedbackLeadsCount();
      }
    });
  }
  //TO GET THE LEADS COUNT
  fetchFeedbackLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const status = ['pending', 'junkvisits'];
    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stage:
          (this.filteredParams.status === 'pending' ||
            this.filteredParams.status === 'junkvisits') &&
          this.filteredParams.stage != ''
            ? this.filteredParams.stage
            : '',
      };
      requests.push(this.mandateService.getFeedbackLeadsCount(params));
    });
    const stage = ['NC', 'USV', 'RSV', 'Final Negotiation'];
    stage.forEach((stage) => {
      const params = { ...this.filteredParams, stage: stage, status: '' };
      requests.push(this.mandateService.getFeedbackLeadsCount(params));
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.feedbackCount.untouched =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 1:
            this.feedbackCount.junkCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 2:
            this.feedbackCount.ncCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 3:
            this.feedbackCount.usvCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 4:
            this.feedbackCount.rsvCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 5:
            this.feedbackCount.fnCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
        }
      });
    });
    this.fetchFeedbackLeadsDetail(false, 0);
  }

  onScroll(event: CustomEvent) {
    this._sharedservice.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10;

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  navigateToDetailsPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.leads_detail;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
    let propid;
    lead.suggestedprop.forEach((prop) => {
      if (lead.propertyname == prop.name) {
        propid = prop.propid;
      }
    });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        allVisits: null,
        leadId: leadId,
        execid: execid,
        feedback: '1',
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        propid: propid,
      },
    });
  }
  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.leads_detail[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map((lead) => lead.LeadID);
    this.checkedLeadsDetail.forEach((element) => {
      this.fromExecids.push(element.RMID);
    });
  }
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    this.sliding.close();
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

      this._sharedservice.outboundCall(param).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.LeadID,
          feedbackId: '1',
          execid: this.lead.RMID,
          leadTabData: 'status',
          callStatus: 'Call Connected',
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
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
  onplayButton(lead) {
    this.router.navigate(['./all-and-live-call-details'], {
      queryParams: {
        execid: lead.ExecId,
        isAllCallLogs: false,
        callRecord: true,
        clientnum: lead.number,
        lastUpdate: lead.lastupdated,
        leadName: lead.CustomerName,
      },
    });
  }
  sendWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.number;
    // const phoneNumber = '917090080306';
    if (lead.suggestedprop[0].propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    } else if (lead.suggestedprop[0].propid === '1830') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/3dvi23Sd6PPqvM91A';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Samskruthi%20Brochure%20New..pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    }

    const message = encodeURIComponent(`${url}`);
    const whatsappUrl = `https://wa.me/+91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
  loadData(event) {
    this.fetchFeedbackLeadsDetail(true, 0).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }
  fetchFeedbackLeadsDetail(isLoadmore, selectedCount) {
    var filteredParam = { ...this.filteredParams };

    if (selectedCount != 0 && !isLoadmore) {
      filteredParam.limit = 0;
      filteredParam.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      filteredParam.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .getFeedbackLeadsDetail(filteredParam)
        .subscribe((response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['AssignedLeads'])
                : response['AssignedLeads'];
              this.showSpinner = false;
              resolve(true);
            } else {
              this.leads_detail =
                isLoadmore || selectedCount ? this.leads_detail : [];
              this.showSpinner = false;
              resolve(false);
            }
          });
        });
    });
  }
  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
    } else {
      this.outboundCall(lead);
    }
    this.sliding.close();
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // Handle multiple query params (like executid=40119&executid=40200)
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      if (queryParams[key]) {
        // If already present, make it an array
        if (Array.isArray(queryParams[key])) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = [queryParams[key], value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    //  Assign values
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        // if (key === 'executid') {
        //   const val = queryParams[key];
        //   if (Array.isArray(val)) {
        //     this.filteredParams[key] = val;
        //   } else if (typeof val === 'string' && val.includes(',')) {
        //     this.filteredParams[key] = val.split(',');
        //   } else {
        //     this.filteredParams[key] = [val];
        //   }
        // } else {
        //   this.filteredParams[key] = queryParams[key];
        // }

        const val = queryParams[key];

        if (!val) {
          this.filteredParams[key] = key === 'executid' ? [] : null;
        } else if (Array.isArray(val)) {
          this.filteredParams[key] =
            key === 'executid' ? val.map((v) => Number(v)) : Number(val[0]); // just in case
        } else {
          if (key === 'executid') {
            // ✅ ONLY executid should be split
            this.filteredParams[key] = val.split(',').map((v) => Number(v));
          } else if (key === 'tcid') {
            // ✅ tcid should be single number
            this.filteredParams[key] = String(val);
          } else {
            // other fields remain as-is
            this.filteredParams[key] = val;
          }
        }
        // this.filteredParams[key] = queryParams[key];
      } else if (key === 'propid' && localStorage.getItem('ranavPropId')) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
  }

  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  onBackicon() {
    this.isCheckbox = false;
    this.showSpinner = false;
  }

  onStage(value, element) {
    this.filteredParams.activeCardKey = element;
    this.resetInfiniteScroll();
    if (value == 'pending' || value == '' || value == 'junkvisits') {
      this.filteredParams.status = value;
      this.filteredParams.stage = '';
    } else {
      this.filteredParams.stage = value;
      this.filteredParams.status = '';
    }
    this.addQueryParams();
  }
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
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

  onFilterSelection(data, value) {
    switch (data) {
      case 'source':
        this.tempFilteredValues.source = value == 'all' ? '' : value;
        break;
      case 'property':
        console.log(value);
        this.tempFilteredValues.propid = value.property_idfk;
        this.getExecutives();
        break;
      case 'visitedRM':
        console.log(value);
        // if (!Array.isArray(this.tempFilteredValues.executid)) {
        //   this.tempFilteredValues.executid = [];
        // }

        // if (value === 'all') {
        //   this.tempFilteredValues.executid = [];
        // } else {
        //   const index = this.tempFilteredValues.executid.indexOf(value);
        //   if (index > -1) {
        //     // already selected → remove it
        //     this.tempFilteredValues.executid.splice(index, 1);
        //   } else {
        //     // not selected → add it
        //     this.tempFilteredValues.executid.push(value);
        //   }
        // }

        this.tempFilteredValues.executid = value;
        // this.tempFilteredValues.executid.join(',');
        break;
      case 'feedbackAssign':
        console.log(value);
        this.tempFilteredValues.tcid = value ? Number(value) : null;
        console.log(value, typeof value);
        console.log(this.filteredParams.tcid, typeof this.filteredParams.tcid);
        console.log(this.mandateCSExecutives);
        break;
      case 'stage':
        Object.entries(this.selectedStageStatus).forEach(([key, value1]) => {
          if (key == this.tempFilteredValues.stage) {
            this.selectedStageStatus[key] = this.tempFilteredValues.stagestatus;
          } else {
            this.selectedStageStatus[key] = '';
          }
        });
        this.tempFilteredValues.stage = value;
        break;
      case 'stagestatus':
        this.tempFilteredValues.stagestatus = value.detail.value;
        break;
      case 'assignedDate':
        if (this.assignedDateRange?.length === 2) {
          const start = formatDate(
            this.assignedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.assignedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.assignedfromdate = start;

          this.tempFilteredValues.assignedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.assignedtodate != '' &&
            this.tempFilteredValues.assignedtodate != '1970-01-01'
              ? true
              : false;
        }
        break;
      case 'visitedDate':
        if (this.visitedDateRange?.length === 2) {
          const start = formatDate(
            this.visitedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.visitedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.visitedfromdate = start;

          this.tempFilteredValues.visitedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.visitedtodate != '' &&
            this.tempFilteredValues.visitedtodate != '1970-01-01'
              ? true
              : false;
        }

        this.tempFilteredValues.fromDate = '';
        this.tempFilteredValues.toDate = '';
        this.tempFilteredValues.fromTime = '';
        this.tempFilteredValues.toTime = '';
        break;
      case 'fromdate':
        const selectedfromDate = new Date(value).getHours();
        const currentfromDate = new Date().getHours();

        if (selectedfromDate === currentfromDate) {
          value.setHours(0, 0, 0, 0);
        }
        const fromdate1 = new Date(value);
        this.nextActionFromDate = fromdate1;
        this.tempFilteredValues.fromDate =
          fromdate1.toLocaleDateString('en-CA');
        this.tempFilteredValues.fromTime = fromdate1
          .toTimeString()
          .split(' ')[0];
        this.tempFilteredValues.toDate = '';
        this.nextActionToDate = null;
        if (this.tempFilteredValues.toDate == '') {
          this.isenabled = false;
        } else {
          this.isenabled = true;
        }
        this.minDate = fromdate1;
        break;
      case 'todate':
        const selectedtoDate = new Date(value).getHours();
        const currenttoDate = new Date().getHours();

        if (selectedtoDate === currenttoDate) {
          value.setHours(23, 59, 0, 0);
        }
        const todate = new Date(value);
        this.nextActionToDate = todate;
        this.tempFilteredValues.toDate = todate.toLocaleDateString('en-CA');
        this.tempFilteredValues.toTime = todate.toTimeString().split(' ')[0];
        this.isenabled = true;
        break;

      default:
        break;
    }

    const {
      assignedfromdate,
      assignedtodate,
      visitedfromdate,
      visitedtodate,
      fromDate,
      toDate,
    } = this.tempFilteredValues;

    const isAssignedValid = !(
      assignedfromdate &&
      (!assignedtodate || assignedtodate === '1970-01-01')
    );
    const isVisitedValid = !(
      visitedfromdate &&
      (!visitedtodate || visitedtodate === '1970-01-01')
    );
    const isGeneralValid = !(fromDate && (!toDate || toDate === '1970-01-01'));

    this.isenabled = isAssignedValid && isVisitedValid && isGeneralValid;
  }
  reset() {
    this.filteredParams = {
      fromDate: '',
      toDate: '',
      status: '',
      stage: '',
      stagestatus: '',
      rmid: '',
      tcid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      source: '',
      propid: '',
      receivedfromdate: '',
      receivedtodate: '',
      visitedfromdate: '',
      visitedtodate: '',
      activityfromdate: '',
      activitytodate: '',
      suggestedprop: '',
      visitedprop: '',
      counter: '',
      assignedfromdate: '',
      assignedtodate: '',
      FromTime: '',
      activeCardKey: '',
      ToTime: '',
      isDateFilter: '',
      visitedPropertyName: '',
      team: '',
      fromTime: '',
      toTime: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? []
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      active: '1',
      receivedToDate: '',
      limit: 0,
      limitrows: 5,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
  }
  isenabled = true;
  navigateToFilter() {
    this.isenabled = true;
    this.tempFilteredValues = { ...this.filteredParams };
    this.isLeftFilterActive = 'stage';
    // this.scrollToSelectedSource();
    // this.settingSelectedDate();
    this.filterModal.present();
  }

  assignedDateRange = null;
  visitedDateRange = null;
  nextActionFromDate = null;
  nextActionToDate = null;
  closeFilterModal() {
    this.assignedDateRange = null;
    this.visitedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;

    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.dismiss();
  }
  onFilterValues(value) {
    this.isLeftFilterActive = value; // Set the active filter section
    // If the 'source' filter section is selected, scroll to the selected source
    if (value == 'visitedRM') {
      this.scrollToSelectedVisitedRM();
    }
  }
  async scrollToSelectedVisitedRM(): Promise<void> {
    const visitedRM = this.tempFilteredValues.executid;
    if (!visitedRM) {
      return;
    }
    const elementId = `${visitedRM}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.visitedRMScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }
  reset_filter() {
    this.tempFilteredValues = {
      fromDate: '',
      toDate: '',
      status: 'pending',
      stage: '',
      stagestatus: '',
      rmid: '',
      tcid: '',
      source: '',
      propid: '',
      receivedfromdate: '',
      receivedtodate: '',
      visitedfromdate: '',
      visitedtodate: '',
      activityfromdate: '',
      activitytodate: '',
      suggestedprop: '',
      visitedprop: '',
      counter: '',
      assignedfromdate: '',
      assignedtodate: '',
      FromTime: '',
      activeCardKey: 'untouched-card',
      ToTime: '',
      isDateFilter: '',
      visitedPropertyName: '',
      team: '',
      fromTime: '',
      toTime: '',
      executid: '',
      loginid: localStorage.getItem('UserId'),
      active: '',
      receivedToDate: '',
      limit: 0,
      limitrows: 5,
    };
    (this.assignedDateRange = null), (this.visitedDateRange = null);
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.isLeftFilterActive = 'stage';
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchedName.toLowerCase());
    });
  }

  getProperty() {
    this.mandateService.getmandateprojects().subscribe((response) => {
      this.propertyList = response['Properties'];
      this.propertyList1 = this.propertyList;
    });
  }
  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchedName.toLowerCase());
    });
  }

  getExecutives() {
    const propid = this.filteredParams.propid
      ? this.filteredParams.propid
      : this.tempFilteredValues?.propid
      ? this.tempFilteredValues?.propid
      : '';
    this.mandateService
      .fetchmandateexecutives1(propid, '', this.filteredParams.active)
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          // (this.mandateExecutives = executives['mandateexecutives'].filter(
          //   (x) => {
          //     return x.name != 'Test RM' && x.name != 'Test CS';
          //   }
          // )),
          this.mandateExecutives = executives['mandateexecutives'].filter(
            (rm) => {
              return rm.roleid == '50002';
            }
          );
          this.mandateExecutives1 = this.mandateExecutives;
          this.mandateCSExecutives = executives['mandateexecutives'].filter(
            (cs) => {
              return cs.roleid == '50014';
            }
          );
          this.mandateCSExecutives1 = this.mandateCSExecutives;
          this.showSpinner1 = false;
        } else {
          this.showSpinner1 = false;
        }

        console.log(this.mandateCSExecutives1);
        console.log(this.mandateExecutives1);
      });
  }
  setFilteredfeedbackAssign() {
    this.mandateCSExecutives = this.mandateCSExecutives1.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.feedbackAssignSearchTerm.toLowerCase());
    });
  }
  daterange(data) {
    const from = this.tempFilteredValues.fromDate;
    const to =
      data == 'receivedDate' &&
      this.tempFilteredValues.receivedToDate != '1970-01-01'
        ? this.tempFilteredValues.toDate
        : '';

    if (
      data == 'visitedDate' &&
      this.tempFilteredValues.visitedfromdate != ''
    ) {
      return `${this.tempFilteredValues.visitedfromdate} to ${this.tempFilteredValues.visitedtodate}`;
    } else if (
      data == 'assignedDate' &&
      this.tempFilteredValues.assignedfromdate != ''
    ) {
      return `${this.tempFilteredValues.assignedfromdate} to ${this.tempFilteredValues.assignedtodate}`;
    } else if (data == 'from' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} , ${this.tempFilteredValues.fromTime}`;
    } else if (data == 'to' && this.tempFilteredValues.toDate != '') {
      return `${this.tempFilteredValues.toDate} , ${this.tempFilteredValues.toTime}`;
    } else {
      return data == 'from'
        ? 'Select from date'
        : data == 'to'
        ? 'Select to date'
        : `${'Select Date Range'}`;
    }
  }

  confirmSelection() {
    // alert('asjk');
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }
  warningMessage() {
    if (this.filteredParams.fromDate == '') {
      Swal.fire({
        title: 'Please select a From Date',
        text: 'From Date is required to apply the filter',
        confirmButtonText: 'OK',
        heightAuto: false,
        allowOutsideClick: false,
      }).then((result) => {});
    }
  }

  removeExecutive(execId: string | number) {
    if (Array.isArray(this.filteredParams.executid)) {
      // Remove that particular executive id
      this.filteredParams.executid = this.filteredParams.executid.filter(
        (id) => id != execId
      );
    } else if (this.filteredParams.executid == execId) {
      // If only one id was selected
      this.filteredParams.executid = [];
    }
    this.filteredParams.executid = [];
    // Update query params
    this.addQueryParams();
  }
}
