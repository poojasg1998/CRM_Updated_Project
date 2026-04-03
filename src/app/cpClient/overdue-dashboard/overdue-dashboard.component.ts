import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-overdue-dashboard',
  templateUrl: './overdue-dashboard.component.html',
  styleUrls: ['./overdue-dashboard.component.scss'],
})
export class OverdueDashboardComponent implements OnInit {
  readonly DEFAULT_PARAMS = {
    fromdate: '',
    todate: '',
    datePreset: 'all',
    selectedStage: 'Followups',
    activeCardKey: 'leads-card',
    limit: 0,
    limitrows: 5,
  };
  filteredParams = { ...this.DEFAULT_PARAMS };
  constructor(private activeroute: ActivatedRoute, private router: Router) {}

  ngOnInit() {}

  applyFilter(key: string, value: any): void {
    const today = new Date().toISOString().split('T')[0];

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
      // Normal updates
      this.filteredParams[key] = value;
    }

    //Sync URL
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
