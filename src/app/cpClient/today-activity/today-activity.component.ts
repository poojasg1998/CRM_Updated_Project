import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CpApiService } from '../cp-api.service';

@Component({
  selector: 'app-today-activity',
  templateUrl: './today-activity.component.html',
  styleUrls: ['./today-activity.component.scss'],
})
export class TodayActivityComponent implements OnInit {
  readonly LEADS_DEFAULTS = {
    fromdate: new Date().toISOString().split('T')[0],
    todate: new Date().toISOString().split('T')[0],
    isLeadsVisits: 'leads',
    datePreset: 'all',
    selectedStage: 'Todays Followups',
    activeCardKey: 'todays-followups-card',
    status: 'todaysfollowups',
    stage: '',
    category: '1',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  todayDate: string = new Date().toISOString().split('T')[0];
  readonly VISITS_DEFAULTS = {
    ...this.LEADS_DEFAULTS,
    fromdate: new Date().toISOString().split('T')[0],
    todate: new Date().toISOString().split('T')[0],
    isLeadsVisits: 'visits',
    selectedStage: 'Scheduled Visits',
    activeCardKey: 'scheduled-visits-card',
    status: 'scheduledtoday',
  };

  filteredParams;
  count = 0;
  leadsCount = {
    tf: '',
    t_gf: '',
    t_nc: '',
    uf: '',
    u_gf: '',
    u_nc: '',
  };
  visitsCount = {
    tv: '',
    t_usv: '',
    t_rsv: '',
    t_fn: '',
    uv: '',
    u_usv: '',
    u_rsv: '',
    u_fn: '',
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

  getLeadsCount() {
    if (this.filteredParams.isLeadsVisits == 'leads') {
      const requests = [];
      const followupsStage = ['', 'Fresh', 'NC'];
      followupsStage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          fromdate: new Date().toISOString().split('T')[0],
          todate: new Date().toISOString().split('T')[0],
          stage: stage,
          status: 'todaysfollowups',
        };
        requests.push(
          this.api.getAssignedLeadsCount(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${stage}`, error);
              return of(null);
            })
          )
        );
      });

      const upcomingStage = ['', 'Fresh', 'NC'];
      upcomingStage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          stage: stage,
          status: 'upcomingfollowups',
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
              this.leadsCount.tf = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 1:
              this.leadsCount.t_gf = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 2:
              this.leadsCount.t_nc = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 3:
              this.leadsCount.uf = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 4:
              this.leadsCount.u_gf = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 5:
              this.leadsCount.u_nc = assignleads['AssignedLeads'][0]['counts'];
              break;
          }
        });
        this.getLeadetails(false);
      });
    } else if (this.filteredParams.isLeadsVisits == 'visits') {
      const requests = [];
      const todayStage = ['', 'USV', 'RSV', 'Final Negotiation'];
      todayStage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          fromdate: new Date().toISOString().split('T')[0],
          todate: new Date().toISOString().split('T')[0],
          status: 'scheduledtoday',
          stage: stage,
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

      const upcomingStage = ['', 'USV', 'RSV', 'Final Negotiation'];
      upcomingStage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          stage: stage,
          status: 'upcomingvisit',
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
              this.visitsCount.tv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.visitsCount.t_usv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.visitsCount.t_rsv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.visitsCount.t_fn =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.visitsCount.uv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 5:
              this.visitsCount.u_usv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 6:
              this.visitsCount.u_rsv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 7:
              this.visitsCount.u_fn =
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
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (key === 'isLeadsVisits') {
        this.resetDefaultValues(value);
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

  resetDefaultValues(value) {
    this.filteredParams.isLeadsVisits = value;
    //Reset ONLY card-related fields from defaults
    this.filteredParams.selectedStage =
      value === 'leads'
        ? this.LEADS_DEFAULTS.selectedStage
        : 'Scheduled Visits';

    this.filteredParams.activeCardKey =
      value === 'leads'
        ? this.LEADS_DEFAULTS.activeCardKey
        : 'scheduled-visits-card';
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
}
