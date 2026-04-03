import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly LEADS_DEFAULTS = {
    fromdate: '',
    todate: '',
    isLeadsVisits: 'leads',
    datePreset: 'all',
    listingType: 'sale',
    selectedStage: 'Total Received',
    activeCardKey: 'totalreceived-card',
    stagestatus: '',
    status: 'assignedleads',
    stage: '',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  readonly VISITS_DEFAULTS = {
    ...this.LEADS_DEFAULTS,
    isLeadsVisits: 'visits',
    selectedStage: 'All Visits',
    activeCardKey: 'allvisits-card',
    status: 'allvisits',
    stagestatus: '3',
  };
  filteredParams = { ...this.LEADS_DEFAULTS };

  leadsCount = {
    total: '',
    untouched: '',
    touched: '',
    inactive: '',
    junkleads: '',
    activeleads: '',
    followups: '',
    scheduledVisits: '',
  };

  visitsCount = {
    allvisits: '',
    active: '',
    fn: '',
    bookingCancelled: '',
    closedLeads: '',
    junkVisits: '',
  };
  leads_detail: any;
  count = 0;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService
  ) {}

  ngOnInit() {
    this.activeroute.queryParams.subscribe(() => {
      this.getQueryParams();
      this.getLeadsCount();
    });
  }

  getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const isLeadsVisits = urlParams.get('isLeadsVisits');
    //Create a fresh object from defaults
    let updatedParams =
      isLeadsVisits === 'visits'
        ? { ...this.VISITS_DEFAULTS }
        : { ...this.LEADS_DEFAULTS };

    //Automatically map URL values to the object
    // This replaces "manual" keys—it only updates what exists in LEADS_DEFAULTS
    urlParams.forEach((value, key) => {
      if (key in updatedParams) {
        updatedParams[key] = value;
      }
    });
    //Final sync
    this.filteredParams = updatedParams;
    console.log(this.filteredParams);
  }

  /**
   * Updates any filter and syncs with URL
   * @param key - The parameter name (e.g., 'propid', 'execId', 'fromdate')
   * @param value - The new value to set
   */
  // applyFilter(key: string, value: any): void {
  //   const today = new Date().toISOString().split('T')[0];

  //   if (key === 'isLeadsVisits') this.resetDefaultValues(value);

  //   //2. Date preset logic
  //   if (key === 'datePreset') {
  //     this.filteredParams.datePreset = value;

  //     switch (value) {
  //       case 'today':
  //         this.filteredParams.fromdate = today;
  //         this.filteredParams.todate = today;
  //         break;

  //       case 'yesterday':
  //         const yesterday = new Date();
  //         yesterday.setDate(yesterday.getDate() - 1);
  //         const yStr = yesterday.toISOString().split('T')[0];
  //         this.filteredParams.fromdate = yStr;
  //         this.filteredParams.todate = yStr;
  //         break;

  //       case 'all':
  //         this.filteredParams.fromdate = '';
  //         this.filteredParams.todate = '';
  //         break;
  //     }
  //   } else {
  //     // ✅ 3. Normal updates
  //     this.filteredParams[key] = value;
  //   }

  //   // ✅ 4. Sync URL
  //   this.router.navigate([], {
  //     relativeTo: this.activeroute,
  //     queryParams: this.filteredParams,
  //     queryParamsHandling: 'merge',
  //   });
  // }

  applyFilter(filters: Record<string, any>): void {
    const today = new Date().toISOString().split('T')[0];

    Object.keys(filters).forEach((key) => {
      const value = filters[key];

      if (key === 'isLeadsVisits') {
        this.resetFilters();
        this.resetDefaultValues(value);
      } else if (key === 'datePreset') {
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
        }
      } else {
        this.filteredParams[key] = value;
      }
    });

    // ✅ Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }
  resetDefaultValues(value) {
    this.filteredParams.isLeadsVisits = value;
    //Reset ONLY card-related fields from defaults
    this.filteredParams.selectedStage =
      value === 'leads' ? this.LEADS_DEFAULTS.selectedStage : 'All Visits';

    this.filteredParams.activeCardKey =
      value === 'leads' ? this.LEADS_DEFAULTS.activeCardKey : 'allvisits-card';
  }

  resetFilters(): void {
    this.filteredParams = {
      ...(this.filteredParams.isLeadsVisits === 'leads'
        ? this.LEADS_DEFAULTS
        : this.VISITS_DEFAULTS),
      isLeadsVisits: this.filteredParams.isLeadsVisits,
    };

    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
    });
  }

  getLeadsCount() {
    if (this.filteredParams.isLeadsVisits == 'leads') {
      const requests = [];
      const status = [
        'assignedleads',
        'pending',
        'touched',
        'inactive',
        'junkleads',
        'active',
        'generalfollowups',
      ];
      status.forEach((status) => {
        const params = { ...this.filteredParams, status: status, stage: '' };
        requests.push(
          this.api.getAssignedLeadsCount(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      const stage = ['USV'];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          status: '',
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

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.leadsCount.total = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 1:
              this.leadsCount.untouched =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 2:
              this.leadsCount.touched =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 3:
              this.leadsCount.inactive =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 4:
              this.leadsCount.junkleads =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 5:
              this.leadsCount.activeleads =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 6:
              this.leadsCount.followups =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 7:
              this.leadsCount.scheduledVisits =
                assignleads['AssignedLeads'][0]['counts'];
              break;
          }
        });
        this.getLeadetails(false);
      });
    } else if (this.filteredParams.isLeadsVisits == 'visits') {
      const requests = [];
      const status = ['allvisits', 'activevisits', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          stage: '',
          stagestatus: '3',
        };
        requests.push(
          this.api.getAssignedLeadsCount(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      const stage = [
        'Final Negotiation',
        'Deal Closed',
        'Closing Request Rejected',
      ];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          status: '',
          stagestatus: '3',
        };
        requests.push(
          this.api.getAssignedLeadsCount(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.visitsCount.allvisits =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.visitsCount.active =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.visitsCount.junkVisits =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.visitsCount.fn =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.visitsCount.closedLeads =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 5:
              this.visitsCount.bookingCancelled =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
        this.getLeadetails(false);
      });
    }
  }

  getLeadetails(isLoadmore) {
    this.count = isLoadmore ? (this.count += 30) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.api
        .getAssignedLeadsDetail(this.filteredParams)
        .subscribe((response) => {
          if (response['status'] === 'True') {
            this.leads_detail = isLoadmore
              ? this.leads_detail.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            resolve(true);
          } else {
            this.leads_detail = isLoadmore ? this.leads_detail : [];
            resolve(false);
          }
        });
    });
  }
}
