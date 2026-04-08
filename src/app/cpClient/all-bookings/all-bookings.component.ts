import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { catchError, forkJoin, of } from 'rxjs';
import { SharedService } from 'src/app/realEstate/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-all-bookings',
  templateUrl: './all-bookings.component.html',
  styleUrls: ['./all-bookings.component.scss'],
})
export class AllBookingsComponent implements OnInit {
  @ViewChild('filter_modal') filter_modal;
  showSpinner = false;
  readonly DEFAULT_PARAMS = {
    stagestatus: '',
    stage: 'Deal Closing Requested',
    status: '',
    category: '1',
    loginid: localStorage.getItem('UserId'),
    selectedclosedProp: '',
    closedpropName: '',
    assignedtodate: '',
    assignedfromdate: '',
    propid: '',
    source: [],
    limit: 0,
    limitrows: 5,
  };
  showInfiniteScroll: boolean = true;
  filteredParams = { ...this.DEFAULT_PARAMS };
  count = 0;
  leadsCount = {
    request: '',
    rejected: '',
    booked: '',
  };
  leads_detail: any;
  activeTab;
  filteredSource: any;
  source: any;
  searchText: string;
  closedProperty: any;
  filteredclosedProperty: any;
  tempFilteredValues;
  minDate: Date;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    public sharedService: SharedService
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
    this.resetInfiniteScroll();
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
    console.log(this.filteredParams);
  }

  getLeadsCount() {
    this.showSpinner = true;
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

            this.closedProperty = response['ClosedPropertyLists'];
            this.filteredclosedProperty = this.closedProperty || [];

            this.filteredParams.selectedclosedProp = this.closedProperty.filter(
              (item) => {
                return this.filteredParams.closedpropName == item.name;
              }
            );
            this.filteredParams.selectedclosedProp =
              this.filteredParams.selectedclosedProp[0];
            this.tempFilteredValues.selectedclosedProp =
              this.filteredParams.selectedclosedProp;
            this.showSpinner = false;
            resolve(true);
          } else {
            this.leads_detail = isLoadmore ? this.leads_detail : [];
            this.closedProperty = isLoadmore
              ? response['ClosedPropertyLists']
              : [];
            this.filteredclosedProperty = this.closedProperty;
            this.showSpinner = false;
            resolve(false);
          }
        });
    });
  }

  replaceSpace(str) {
    const result = str.split(' ').join('_');
    return result;
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
      this.filteredclosedProperty = !val
        ? [...this.closedProperty]
        : this.closedProperty.filter((item) =>
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
    } else if (data == 'bookingfromdate') {
      const fromdate = new Date(value);
      this.tempFilteredValues.assignedfromdate =
        fromdate.toLocaleDateString('en-CA');
    } else if (data == 'bookingtodate') {
      const todate = new Date(value);
      this.tempFilteredValues.assignedtodate =
        todate.toLocaleDateString('en-CA');
    }
  }
  onClearFiltered() {
    this.tempFilteredValues = {};
    this.resetFilters();
  }

  onConfirmedFilter() {
    this.filteredParams = {
      ...this.tempFilteredValues,
      propid: this.tempFilteredValues.selectedclosedProp?.propid || null,
      closedpropName: this.tempFilteredValues.selectedclosedProp?.name || null,
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
  resetFilters(): void {
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.DEFAULT_PARAMS,
    });
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
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
  warningMessage() {
    if (this.tempFilteredValues.fromDate == '') {
      Swal.fire({
        title: 'Please select a From Date',
        text: 'From Date is required to apply the filter',
        confirmButtonText: 'OK',
        heightAuto: false,
        allowOutsideClick: false,
      }).then((result) => {});
    }
  }
}
