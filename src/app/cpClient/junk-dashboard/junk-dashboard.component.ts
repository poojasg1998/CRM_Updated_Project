import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CpApiService } from '../cp-api.service';

@Component({
  selector: 'app-junk-dashboard',
  templateUrl: './junk-dashboard.component.html',
  styleUrls: ['./junk-dashboard.component.scss'],
})
export class JunkDashboardComponent implements OnInit {
  readonly LEADS_DEFAULTS = {
    visitedfromdate: '',
    visitedtodate: '',
    assignedfromdate: '',
    assignedtodate: '',
    isLeadsVisits: 'leads',
    datePreset: 'all',
    selectedStage: 'Fresh',
    activeCardKey: 'fresh-card',
    status: 'junkleads',
    stage: 'Fresh',
    stagestatus: '',
    category: '1',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  readonly VISITS_DEFAULTS = {
    ...this.LEADS_DEFAULTS,
    isLeadsVisits: 'visits',
    selectedStage: 'USV Done',
    activeCardKey: 'usvdone-card',
    status: 'junkvisits',
    stage: 'USV',
    stagestatus: '3',
  };
  filteredParams = { ...this.LEADS_DEFAULTS };
  count = 0;

  leadsCount = {
    fresh: '',
    followups: '',
    nc: '',
    usvfix: '',
  };

  visitsCount = {
    usvdone: '',
    rsvfix: '',
    rsvdone: '',
    fnfix: '',
    fndone: '',
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
  getLeadsCount() {
    if (this.filteredParams.isLeadsVisits == 'leads') {
      const requests = [];
      const stage = ['Fresh', 'generalfollowups', 'NC', 'USV'];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          status: 'junkleads',
          stagestatus: stage == 'USV' ? '1' : '',
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
              this.leadsCount.fresh = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 1:
              this.leadsCount.followups =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 2:
              this.leadsCount.nc = assignleads['AssignedLeads'][0]['counts'];
              break;
            case 3:
              this.leadsCount.usvfix =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            default:
              break;
          }
        });
        this.getLeadetails(false);
      });
    } else if (this.filteredParams.isLeadsVisits == 'visits') {
      const requests = [];
      const stage = ['RSV', 'Final Negotiation'];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          status: 'junkvisits',
          stagestatus: '1',
          visitedfromdate: '',
          visitedtodate: '',
          assignedfromdate: this.filteredParams.visitedfromdate,
          assignedtodate: this.filteredParams.visitedtodate,
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
          status: 'junkvisits',
          stagestatus: '3',
          assignedfromdate: '',
          assignedtodate: '',
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
              this.visitsCount.rsvfix =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 1:
              this.visitsCount.fnfix =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 2:
              this.visitsCount.usvdone =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 3:
              this.visitsCount.rsvdone =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 4:
              this.visitsCount.fndone =
                assignleads['AssignedLeads'][0]['counts'];
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

  resetDefaultValues(value) {
    this.filteredParams.isLeadsVisits = value;
    //Reset ONLY card-related fields from defaults
    this.filteredParams.selectedStage =
      value === 'leads' ? this.LEADS_DEFAULTS.selectedStage : 'USV Done';

    this.filteredParams.activeCardKey =
      value === 'leads' ? this.LEADS_DEFAULTS.activeCardKey : 'usvdone-card';

    this.filteredParams.stage =
      value === 'leads' ? this.LEADS_DEFAULTS.stage : 'USV';

    this.filteredParams.stagestatus =
      value === 'leads' ? this.LEADS_DEFAULTS.stagestatus : '3';

    this.filteredParams.status =
      value === 'leads' ? this.LEADS_DEFAULTS.stage : 'USV';

    this.filteredParams.status =
      value === 'leads' ? this.LEADS_DEFAULTS.status : 'junkvisits';
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
        this.dateupdation(this.filteredParams.datePreset);
      } else if (key === 'datePreset') {
        this.filteredParams.datePreset = value;
        this.dateupdation(value);
      } else {
        this.filteredParams[key] = value;
        this.dateupdation(this.filteredParams.datePreset);
      }
    });

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }

  dateupdation(value) {
    const today = new Date().toISOString().split('T')[0];
    switch (value) {
      case 'today':
        if (this.filteredParams.isLeadsVisits == 'leads') {
          this.filteredParams.assignedfromdate = today;
          this.filteredParams.assignedtodate = today;
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        } else {
          if (this.filteredParams.stagestatus == '1') {
            this.filteredParams.assignedfromdate = today;
            this.filteredParams.assignedtodate = today;
            this.filteredParams.visitedfromdate = '';
            this.filteredParams.visitedtodate = '';
          } else {
            this.filteredParams.visitedfromdate = today;
            this.filteredParams.visitedtodate = today;
            this.filteredParams.assignedfromdate = '';
            this.filteredParams.assignedtodate = '';
          }
        }
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];

        if (this.filteredParams.isLeadsVisits == 'leads') {
          this.filteredParams.assignedfromdate = yStr;
          this.filteredParams.assignedtodate = yStr;
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        } else {
          if (this.filteredParams.stagestatus == '1') {
            this.filteredParams.assignedfromdate = yStr;
            this.filteredParams.assignedtodate = yStr;
            this.filteredParams.visitedfromdate = '';
            this.filteredParams.visitedtodate = '';
          } else {
            this.filteredParams.visitedfromdate = yStr;
            this.filteredParams.visitedtodate = yStr;
            this.filteredParams.assignedfromdate = '';
            this.filteredParams.assignedtodate = '';
          }
        }
        break;
      case 'all':
        this.filteredParams.assignedfromdate = '';
        this.filteredParams.assignedtodate = '';
        this.filteredParams.visitedfromdate = '';
        this.filteredParams.visitedtodate = '';
        break;
      case 'custom':
        if (this.filteredParams.isLeadsVisits == 'visits') {
          if (this.filteredParams.stagestatus == '1') {
            this.filteredParams.assignedtodate =
              this.filteredParams.assignedtodate;
            this.filteredParams.assignedfromdate =
              this.filteredParams.assignedtodate;
            this.filteredParams.visitedfromdate = '';
            this.filteredParams.visitedtodate = '';
          } else {
            this.filteredParams.visitedfromdate =
              this.filteredParams.assignedfromdate;
            this.filteredParams.visitedtodate =
              this.filteredParams.assignedtodate;

            this.filteredParams.assignedfromdate = '';
            this.filteredParams.assignedtodate = '';
          }
        } else {
          this.filteredParams.assignedfromdate =
            this.filteredParams.visitedfromdate;
          this.filteredParams.assignedtodate =
            this.filteredParams.visitedtodate;
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        }
        break;
      default:
        break;
    }
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
