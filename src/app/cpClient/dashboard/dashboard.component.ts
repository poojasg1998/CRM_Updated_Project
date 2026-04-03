import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  readonly DEFAULT_PARAMS = {
    fromdate: '',
    todate: '',
    isLeadsVisits: 'leads',
    datePreset: 'all',
    listingType: 'sale',
    selectedStage: 'Total Received',
    activeCardKey: 'totalreceived-card',
    limit: 0,
    limitrows: 5,
  };
  filteredParams = { ...this.DEFAULT_PARAMS };
  leads_count;

  constructor(private activeroute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.activeroute.queryParams.subscribe(() => {
      this.getQueryParams();
    });
  }

  getQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    //Create a fresh object from defaults
    let updatedParams;
    if (
      urlParams.get('isLeadsVisits') &&
      !urlParams.get('activeCardKey') &&
      !urlParams.get('selectedStage')
    ) {
      this.resetDefaultValues(urlParams.get('isLeadsVisits'));
      updatedParams = { ...this.filteredParams };
    } else {
      updatedParams = { ...this.DEFAULT_PARAMS };
    }

    //Automatically map URL values to the object
    // This replaces "manual" keys—it only updates what exists in DEFAULT_PARAMS
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
  applyFilter(key: string, value: any): void {
    const today = new Date().toISOString().split('T')[0];

    if (key === 'isLeadsVisits') this.resetDefaultValues(value);

    //2. Date preset logic
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
      // ✅ 3. Normal updates
      this.filteredParams[key] = value;
    }

    // ✅ 4. Sync URL
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
      value === 'leads' ? this.DEFAULT_PARAMS.selectedStage : 'All Visits';

    this.filteredParams.activeCardKey =
      value === 'leads' ? this.DEFAULT_PARAMS.activeCardKey : 'allvisits-card';
  }

  resetFilters(): void {
    this.filteredParams = {
      ...this.DEFAULT_PARAMS,
      isLeadsVisits: this.filteredParams.isLeadsVisits,
    };

    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
    });
  }
}
