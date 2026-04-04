import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss'],
})
export class AllBookingsComponent implements OnInit {
  readonly DEFAULT_PARAMS = {
    stagestatus: '',
    stage: 'Deal Closing Requested',
    status: '',
    category: '1',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  filteredParams = { ...this.DEFAULT_PARAMS };
  count = 0;
  leadsCount = {
    request: '',
    rejected: '',
    booked: '',
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

  /**
   * Updates any filter and syncs with URL
   * @param key - The parameter name (e.g., 'propid', 'execId', 'fromdate')
   * @param value - The new value to set
   */
  applyFilter(filters: Record<string, any>): void {
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      this.filteredParams[key] = value;
    });

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
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
      'Deal Closing Requested',
      'Closing Request Rejected',
      'Deal Closed',
    ];
    stage.forEach((stage) => {
      const params = { ...this.filteredParams, stage: stage };
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
            this.leadsCount.request = assignleads['AssignedLeads'][0]['counts'];
            break;
          case 1:
            this.leadsCount.rejected =
              assignleads['AssignedLeads'][0]['counts'];
            break;
          case 2:
            this.leadsCount.booked = assignleads['AssignedLeads'][0]['counts'];
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

  replaceSpace(str) {
    const result = str.split(' ').join('_');
    console.log(result);
    return result;
  }
}
