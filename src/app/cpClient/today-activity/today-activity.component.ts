import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-today-activity',
  templateUrl: './today-activity.component.html',
  styleUrls: ['./today-activity.component.scss'],
})
export class TodayActivityComponent implements OnInit {
  readonly DEFAULT_PARAMS = {
    fromdate: '',
    todate: '',
    isLeadsVisits: 'leads',
    datePreset: 'all',
    selectedStage: 'Todays Followups',
    activeCardKey: 'todays-followups-card',
    limit: 0,
    limitrows: 5,
  };
  filteredParams = { ...this.DEFAULT_PARAMS };
  constructor(private activeroute: ActivatedRoute, private router: Router) {}

  ngOnInit() {}
  /**
   * Updates any filter and syncs with URL
   * @param key - The parameter name (e.g., 'propid', 'execId', 'fromdate')
   * @param value - The new value to set
   */
  applyFilter(key: string, value: any): void {
    const today = new Date().toISOString().split('T')[0];

    if (key === 'isLeadsVisits') this.resetDefaultValues(value);

    // Date preset logic
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
      //  Normal updates
      this.filteredParams[key] = value;
    }

    //  Sync URL
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
        ? this.DEFAULT_PARAMS.selectedStage
        : 'Scheduled Visits';

    this.filteredParams.activeCardKey =
      value === 'leads'
        ? this.DEFAULT_PARAMS.activeCardKey
        : 'scheduled-visits-card';
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
