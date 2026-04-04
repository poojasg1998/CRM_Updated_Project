import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CpApiService } from '../cp-api.service';

@Component({
  selector: 'app-overdue-dashboard',
  templateUrl: './overdue-dashboard.component.html',
  styleUrls: ['./overdue-dashboard.component.scss'],
})
export class OverdueDashboardComponent implements OnInit {
  readonly DEFAULT_PARAMS = {
    fromdate: '',
    todate: '',
    stagestatus: '',
    stage: 'Fresh',
    status: 'overdues',
    datePreset: 'all',
    selectedStage: 'Followups',
    activeCardKey: 'leads-card',
    loginid: localStorage.getItem('UserId'),
    category: '1',
    limit: 0,
    limitrows: 5,
  };
  filteredParams = { ...this.DEFAULT_PARAMS };
  count = 0;

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
  leads_detail: any;

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
    let updatedParams = { ...this.DEFAULT_PARAMS };

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

  getLeadsCount() {
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
            resolve(true);
          } else {
            this.leads_detail = isLoadmore ? this.leads_detail : [];
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
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.DEFAULT_PARAMS,
    });
  }
}
