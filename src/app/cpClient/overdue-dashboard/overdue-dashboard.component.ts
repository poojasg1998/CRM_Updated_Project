import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CpApiService } from '../cp-api.service';
import { IonContent, IonModal } from '@ionic/angular';
import { SharedService } from 'src/app/realEstate/shared.service';

@Component({
  selector: 'app-overdue-dashboard',
  templateUrl: './overdue-dashboard.component.html',
  styleUrls: ['./overdue-dashboard.component.scss'],
})
export class OverdueDashboardComponent implements OnInit {
  @ViewChild('content', { static: false }) content: IonContent;
  @ViewChild('filter_modal') filter_modal;
  @ViewChild('cp_dashboard_custDate_modal')
  cp_dashboard_custDate_modal: IonModal;
  @ViewChild('cp_dashboard_fromDate_modal')
  cp_dashboard_fromDate_modal: IonModal;
  @ViewChild('cp_dashboard_toDate_modal') cp_dashboard_toDate_modal: IonModal;
  readonly DEFAULT_PARAMS = {
    fromdate: '',
    todate: '',
    stagestatus: '',
    stage: 'Fresh',
    status: 'overdues',
    datePreset: 'all',
    selectedStage: 'Followups',
    activeCardKey: 'followups-card',
    loginid: localStorage.getItem('UserId'),
    visited_count: '',
    source: [],
    propName: '',
    propid: '',
    selectedProp: '',
    category: '1',
    limit: 0,
    limitrows: 5,
  };
  activeTab = 'source';
  filteredParams = { ...this.DEFAULT_PARAMS };
  count = 0;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };

  leadsCount = {
    followups: '',
    nc: '',
    usvfix: '',
    usvdone: '',
    rsvfix: '',
    rsvdone: '',
    fnfix: '',
    fndone: '',
    pending: '',
    request: '',
  };
  showInfiniteScroll: boolean = true;
  leads_detail: any;
  showSpinner = false;
  visits: any;
  searchText: string;
  source: any;
  filteredSource: any;
  suggestedProperty: any;
  filteredProperty: any;
  tempFilteredValues: any;
  page: number;
  canScroll: boolean;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    public sharedService: SharedService
  ) { }

  ngOnInit() {
    this.activeroute.queryParams.subscribe(() => {
      this.getQueryParams();
      // this.getLeadsCount();
      if (this.sharedService.hasState) {
        this.showSpinner = false;
        this.leads_detail = this.sharedService.enquiries;
        this.page = this.sharedService.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this.sharedService.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this.sharedService.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }

  getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const isLeadsVisits = urlParams.get('isLeadsVisits');
    //Create a fresh object from defaults
    let updatedParams = { ...this.DEFAULT_PARAMS };

    //Automatically map URL values to the object
    // This replaces "manual" keys—it only updates what exists in LEADS_DEFAULTS
    urlParams.forEach((value, key) => {
      if (key in updatedParams) {
        if (key === 'source') {
          updatedParams[key] = urlParams.getAll('source');
        } else {
          updatedParams[key] = value;
        }
      }
    });
    //Final sync
    this.filteredParams = updatedParams;
    this.tempFilteredValues = {
      ...this.filteredParams,
      source: Array.isArray(this.filteredParams.source)
        ? [...this.filteredParams.source]
        : [],
    };
  }

  getLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const stage = [
      'Fresh',
      'NC',
      'Deal Closing Pending',
      'Deal Closing Requested',
    ];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        satatus: 'overdues',
        stagestatus: '',
      };
      requests.push(
        this.api.getAssignedLeadsCount(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for stage: ${stage}`, error);
            return of(null);
          })
        )
      );
    });

    const stage1 = ['USV', 'RSV', 'Final Negotiation'];
    stage1.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        status: 'overdues',
        stagestatus: '1',
      };
      requests.push(
        this.api.getAssignedLeadsCount(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for stage: ${stage}`, error);
            return of(null);
          })
        )
      );
    });

    const stage2 = ['USV', 'RSV', 'Final Negotiation'];
    stage2.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        status: 'overdues',
        stagestatus: '3',
      };
      requests.push(
        this.api.getAssignedLeadsCount(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for stage: ${stage}`, error);
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assignleads, index) => {
        switch (index) {
          case 0:
            this.leadsCount.followups =
              assignleads['AssignedLeads'][0]['counts'];
            this.visits = assignleads['Visitscounts'] || [];
            break;
          case 1:
            this.leadsCount.nc = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 2:
            this.leadsCount.pending = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 3:
            this.leadsCount.request = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 4:
            this.leadsCount.usvfix = assignleads['AssignedLeads'][0]['counts'];
            this.visits = assignleads['Visitscounts'];
            break;
          case 5:
            this.leadsCount.rsvfix = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 6:
            this.leadsCount.fnfix = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 7:
            this.leadsCount.usvdone = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 8:
            this.leadsCount.rsvdone = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 9:
            this.leadsCount.fndone = assignleads['AssignedLeads'][0]['counts'];
            break;
          default:
            break;
        }
      });
      this.getLeadetails(false);
    });
  }

  getLeadetails(isLoadmore) {
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.api
        .getAssignedLeadsDetail(this.filteredParams)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.leads_detail = isLoadmore
              ? this.leads_detail.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            this.suggestedProperty = response['SuggestedPropertyLists'];
            this.filteredProperty = this.suggestedProperty;
            this.filteredParams.selectedProp = this.suggestedProperty.filter(
              (item) => {
                return this.filteredParams.propName == item.name;
              }
            );
            this.filteredParams.selectedProp = this.filteredParams.propid[0];
            this.tempFilteredValues.selectedProp = this.filteredParams.propid;
            this.showSpinner = false;
            resolve(true);
          } else {
            this.leads_detail = isLoadmore ? this.leads_detail : [];
            this.suggestedProperty = isLoadmore
              ? response['SuggestedPropertyLists']
              : [];
            this.filteredProperty = this.suggestedProperty;
            this.showSpinner = false;
            resolve(false);
          }
        });
    });
  }

  /**
   * Updates any filter and syncs with URL
   * @param key - The parameter name (e.g., 'propid', 'execId', 'fromdate')
   * @param value - The new value to set
   */
  applyFilter(filters: Record<string, any>): void {
    this.resetInfiniteScroll();
    const today = new Date().toISOString().split('T')[0];
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (key === 'datePreset') {
        this.filteredParams.datePreset = value;
        switch (value) {
          case 'today':
            this.filteredParams.fromdate = today;
            this.filteredParams.todate = today;
            break;

          case 'yesterday':
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yStr = yesterday.toISOString().split('T')[0];
            this.filteredParams.fromdate = yStr;
            this.filteredParams.todate = yStr;
            break;

          case 'all':
            this.filteredParams.fromdate = '';
            this.filteredParams.todate = '';
            break;
          case 'custom':
            this.filteredParams.fromdate = ('' + this.dateRange.fromdate).split(
              'T'
            )[0];
            this.filteredParams.todate = ('' + this.dateRange.todate).split(
              'T'
            )[0];
            break;
        }
      } else {
        this.filteredParams[key] = value;
      }
    });

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }

  resetFilters(): void {
    const currentCategory = this.filteredParams.category;
    this.DEFAULT_PARAMS.category = currentCategory;
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.DEFAULT_PARAMS,
    });
  }
  // To open from date modal
  async openFromDate() {
    await this.cp_dashboard_toDate_modal?.dismiss();
    await this.cp_dashboard_fromDate_modal.present();
  }

  // To open to date modal
  async openToDate() {
    await this.cp_dashboard_fromDate_modal?.dismiss();
    await this.cp_dashboard_toDate_modal.present();
  }
  onmodaldismiss() {
    this.cp_dashboard_fromDate_modal?.dismiss();
    this.cp_dashboard_toDate_modal?.dismiss();
  }
  showFromDateError = false;
  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  onFromDateSelected(event) {
    this.dateRange.fromdate = event.detail.value;
    this.cp_dashboard_fromDate_modal.dismiss();
  }
  onToDateSelected(event) {
    this.dateRange.todate = event.detail.value;
    this.cp_dashboard_toDate_modal.dismiss();
  }

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams.datePreset = 'all';
    this.filteredParams.fromdate = '';
    this.filteredParams.todate = '';

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }

  onCustomDateModalDismiss(event) {
    if (this.dateRange.fromdate && !this.dateRange.todate) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
    }
  }
  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.searchText = '';
    this.searchData();
  }
  onFilterModal() {
    this.activeTab = 'source';
    this.getSource();
    this.filter_modal.present();
  }

  getSource() {
    this.api.getSource().subscribe((resp) => {
      this.source = resp['Sources'];
      this.filteredSource = resp['Sources'];
    });
  }

  searchData() {
    const val = this.searchText?.toLowerCase();
    if (this.activeTab === 'source') {
      this.filteredSource = !val
        ? [...this.source]
        : this.source.filter((item) =>
          (item?.source || '').toLowerCase().includes(val)
        );
    }

    if (this.activeTab === 'property') {
      this.filteredProperty = !val
        ? [...this.suggestedProperty]
        : this.suggestedProperty.filter((item) =>
          item.name.toLowerCase().includes(val)
        );
    }
  }
  applyTemFilter(data, value) {
    if (data === 'source') {
      const val = value.source;

      if (!Array.isArray(this.tempFilteredValues.source)) {
        this.tempFilteredValues.source = this.tempFilteredValues.source
          ? [this.tempFilteredValues.source]
          : [];
      }

      const index = this.tempFilteredValues.source.indexOf(val);

      if (index > -1) {
        this.tempFilteredValues.source = this.tempFilteredValues.source.filter(
          (v) => v !== val
        );
      } else {
        this.tempFilteredValues.source = [
          ...this.tempFilteredValues.source,
          val,
        ];
      }
    }
  }
  onClearFiltered() {
    this.tempFilteredValues = {};
    this.resetFilters();
  }

  onConfirmedFilter() {
    this.filteredParams = {
      ...this.tempFilteredValues,
      propid: this.tempFilteredValues.propid?.propid || null,
      propName: this.tempFilteredValues.propid?.name || null,
    };
    this.filter_modal.dismiss();
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }
  removeSource(val: string) {
    const arr = this.tempFilteredValues.source || [];
    this.tempFilteredValues.source = arr.filter((v) => v !== val);

    if (this.tempFilteredValues.source.length === 0) {
      this.tempFilteredValues.source = null;
    }
    this.filteredParams = {
      ...this.tempFilteredValues,
    };
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }
  async loadData(event) {
    const hasData = await this.getLeadetails(true);
    setTimeout(async () => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        return;
      }
    }, 200);
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }
  navigateToDetailsPage(lead) {
    this.sharedService.enquiries = this.leads_detail;
    this.sharedService.page = this.page;
    this.sharedService.hasState = true;
    this.router.navigate(['/cp-lead-details'], {
      queryParams: {
        execid: lead.RMID,
        leadid: lead.LeadID,
        categoryid: lead.category,
      },
    });
  }

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
