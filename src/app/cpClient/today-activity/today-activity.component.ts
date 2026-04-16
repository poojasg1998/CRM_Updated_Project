import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CpApiService } from '../cp-api.service';
import { SharedService } from 'src/app/realEstate/shared.service';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-today-activity',
  templateUrl: './today-activity.component.html',
  styleUrls: ['./today-activity.component.scss'],
})
export class TodayActivityComponent {
  @ViewChild('filter_modal') filter_modal;
  @ViewChild('content', { static: false }) content: IonContent;
  showSpinner = false;
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
    visitedprop: '',
    propid: '',
    visitedpropName: '',
    source: [],
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
  activeTab: string = 'source';

  filteredParams;
  count = 0;
  leadsCount = {
    tf: '',
    uf: '',
  };
  visitsCount = {
    tv: '',
    uv: '',
  };
  leads_detail: any;
  showInfiniteScroll: boolean = true;
  searchText: any;
  source: any;
  filteredSource: any;
  tempFilteredValues;
  filteredProperty;
  suggestedProperty: any;
  canScroll: boolean;
  page: number;
  subscription: import('rxjs').Subscription;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    public sharedService: SharedService
  ) {}
  ionViewWillEnter() {
    this.subscription = this.activeroute.queryParams.subscribe(() => {
      this.getQueryParams();
      if (this.sharedService.hasState) {
        this.showSpinner = false;
        this.leads_detail = this.sharedService.enquiries;
        this.page = this.sharedService.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this.sharedService.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this.sharedService.hasState = false;
        }, 1000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }

  // ngOnInit() {
  //   // this.subscription = this.activeroute.queryParams.subscribe(() => {
  //   //   this.getQueryParams();
  //   //   if (this.sharedService.hasState) {
  //   //     this.showSpinner = false;
  //   //     this.leads_detail = this.sharedService.enquiries;
  //   //     this.page = this.sharedService.page;
  //   //     setTimeout(() => {
  //   //       this.content.scrollToPoint(0, this.sharedService.scrollTop, 0);
  //   //     }, 0);
  //   //     setTimeout(() => {
  //   //       this.sharedService.hasState = false;
  //   //     }, 5000);
  //   //   } else {
  //   //     this.content?.scrollToTop(300);
  //   //     this.getLeadsCount();
  //   //   }
  //   // });
  // }
  getSource() {
    this.api.getSource().subscribe((resp) => {
      this.source = resp['Sources'];
      this.filteredSource = resp['Sources'];
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
    if (this.filteredParams.isLeadsVisits == 'leads') {
      const requests = [];

      const followupsStage = [''];
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

      const upcomingStage = [''];
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
              this.leadsCount.uf = assignleads['AssignedLeads'][0]['counts'];
              break;
            default:
              break;
          }
        });
        this.getLeadetails(false);
      });
    } else if (this.filteredParams.isLeadsVisits == 'visits') {
      const requests = [];
      const todayStage = [''];
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

      const upcomingStage = [''];
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
              this.visitsCount.uv =
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
            this.suggestedProperty = response['SuggestedPropertyLists'];
            this.filteredProperty = this.suggestedProperty;
            this.filteredParams.propid = this.suggestedProperty.filter(
              (item) => {
                return this.filteredParams.visitedpropName == item.name;
              }
            );
            this.filteredParams.propid = this.filteredParams.propid[0];
            this.tempFilteredValues.propid = this.filteredParams.propid;
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
    this.sharedService.hasState = false;
    this.resetInfiniteScroll();
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (key === 'isLeadsVisits') {
        this.resetDefaultValues(value);
      } else {
        this.filteredParams[key] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: {
        ...this.filteredParams,
        refresh: new Date().getTime(), // 🔥 FORCE trigger
      },
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
    const currentCategory = this.filteredParams.category;
    this.filteredParams = {
      ...(this.filteredParams.isLeadsVisits === 'leads'
        ? this.LEADS_DEFAULTS
        : this.VISITS_DEFAULTS),
      isLeadsVisits: this.filteredParams.isLeadsVisits,
      category: currentCategory,
    };

    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
    });
  }

  //TO RESET THE INFINITE SRCOLL
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.searchText = '';
    this.searchData();
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
      visitedpropName: this.tempFilteredValues.propid?.name || null,
    };
    this.filter_modal.dismiss();
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }

  onFilterModal() {
    this.activeTab = 'source';
    this.getSource();
    this.filter_modal.present();
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

  onSwipe(event, lead: any) {
    if (event?.detail?.side == 'start' || event == 'chat') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      window.open(`tel:${lead.number}`, '_system');
      if (lead && lead.number) {
        // Trigger the call
        window.open(`tel:${lead.number}`, '_system');
      } else {
        console.error('Phone number not available for the selected lead.');
      }
    }
  }
  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
