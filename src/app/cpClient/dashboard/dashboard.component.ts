import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { catchError, forkJoin, of, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { IonContent, IonModal } from '@ionic/angular';
import { SharedService } from '../../realEstate/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  @ViewChild('cp_dashboard_custDate_modal')
  cp_dashboard_custDate_modal: IonModal;
  @ViewChild('cp_dashboard_fromDate_modal')
  cp_dashboard_fromDate_modal: IonModal;
  @ViewChild('cp_dashboard_toDate_modal') cp_dashboard_toDate_modal: IonModal;
  @ViewChild('scrollContent', { static: false }) scrollContent!: IonContent;
  @ViewChild('filter_modal') filter_modal;
  @ViewChild('add_lead') add_lead;
  todayDate: string = new Date().toISOString().split('T')[0];
  destroy$ = new Subject<void>();
  readonly LEADS_DEFAULTS = {
    fromdate: '',
    todate: '',
    visitedfromdate: '',
    visitedtodate: '',
    receivedfromdate: '',
    receivedtodate: '',
    isLeadsVisits: 'leads',
    datePreset: 'all',
    category: '1',
    selectedStage: 'Untouched',
    activeCardKey: 'totalreceived-card',
    stagestatus: '',
    status: 'pending',
    stage: '',
    source: [],
    priority: '',
    slectedProp: '',
    selectedLeadsProp: '',
    visited_count: '',
    suggestedprop: '',
    suggestedpropname: '',
    visitedprop: '',
    visitedpropName: '',
    propid: '',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  readonly VISITS_DEFAULTS = {
    ...this.LEADS_DEFAULTS,
    isLeadsVisits: 'visits',
    selectedStage: 'Active Visits',
    activeCardKey: 'allvisits-card',
    status: 'activevisits',
    visited_count: '1',
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
    visitsConverted: '',
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
  Visitscounts: any;
  showInfiniteScroll = true;
  showSpinner = false;
  activeTab: string = 'priority';
  priorityList = [
    { id: '1', name: 'Hot' },
    { id: '2', name: 'Warm' },
    { id: '3', name: 'Cold' },
  ];
  sourceList = ['Website', 'Call', 'Walk-in'];
  enquiredList = ['GR Samskruthi', 'GR Sitara', 'Ranav Tranquil Haven'];
  source: any;
  filteredSource: any;
  searchText;
  suggestedProperty: any;
  enquiredProperty: any;
  filteredEnquiry: any;
  filteredProperty: any;
  tempFilteredValues: any;
  minDate;
  addleadForm!: FormGroup;
  localityList;
  subscription: import('rxjs').Subscription;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private cd: ChangeDetectorRef
  ) {
    this.todayDate = new Date().toISOString();
    this.addleadForm = this.fb.group({
      name: ['', Validators.required],
      number: [
        '',
        [Validators.required, Validators.pattern(/^(\+91[\-\s]?)?[0-9]{10}$/)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      source: ['', Validators.required],
      location: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      type: ['', [Validators.required]],
      possession: ['', Validators.required],
      leadSegment: [[], Validators.required],
      size: [''],
      budget: ['', Validators.required],
      address: ['', Validators.required],
    });

    this.addleadForm.get('type')?.valueChanges.subscribe((value) => {
      const documentsControl = this.addleadForm.get('size');
      if (value == '3') {
        documentsControl?.clearValidators(); // NOT required
      } else {
        documentsControl?.setValidators([Validators.required]); // required
      }
      documentsControl?.updateValueAndValidity();
    });
  }

  ionViewWillEnter() {
    this.getSource();
    this.getLocalities();
    this.subscription = this.activeroute.queryParams.subscribe(() => {
      this.getQueryParams();

      if (this.sharedService.hasState) {
        this.showSpinner = false;
        this.leads_detail = this.sharedService.enquiries;
        this.page = this.sharedService.page;
        setTimeout(() => {
          this.scrollContent.scrollToPoint(0, this.sharedService.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this.sharedService.hasState = false;
        }, 1000);
      } else {
        this.scrollContent?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }

  getLocalities() {
    this.api.localitylist().subscribe((resp) => {
      this.localityList = resp['Localities'];
    });
  }

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
    this.tempFilteredValues = this.filteredParams;
    console.log(this.filteredParams);
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
        this.dateupdation(this.filteredParams.datePreset);
      } else if (key === 'datePreset') {
        this.filteredParams.datePreset = value;
        this.dateupdation(value);
      } else {
        this.filteredParams[key] = value;
      }
    });

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: {
        ...this.filteredParams,
        refresh: new Date().getTime(),
      },
      queryParamsHandling: 'merge',
    });
  }

  dateupdation(value) {
    const today = new Date().toISOString().split('T')[0];
    if (value != 'custom') {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
    }
    switch (value) {
      case 'today':
        if (this.filteredParams.isLeadsVisits == 'leads') {
          this.filteredParams.fromdate = today;
          this.filteredParams.todate = today;
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        } else {
          this.filteredParams.visitedfromdate = today;
          this.filteredParams.visitedtodate = today;
          this.filteredParams.fromdate = '';
          this.filteredParams.todate = '';
        }
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split('T')[0];

        if (this.filteredParams.isLeadsVisits == 'leads') {
          this.filteredParams.fromdate = yStr;
          this.filteredParams.todate = yStr;
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        } else {
          this.filteredParams.visitedfromdate = yStr;
          this.filteredParams.visitedtodate = yStr;
          this.filteredParams.fromdate = '';
          this.filteredParams.todate = '';
        }
        break;
      case 'all':
        this.filteredParams.fromdate = '';
        this.filteredParams.todate = '';
        this.filteredParams.visitedfromdate = '';
        this.filteredParams.visitedtodate = '';
        break;
      case 'custom':
        console.log(this.dateRange);
        if (this.filteredParams.isLeadsVisits == 'visits') {
          this.filteredParams.visitedfromdate = (
            '' + this.dateRange.fromdate
          ).split('T')[0];
          this.filteredParams.visitedtodate = (
            '' + this.dateRange.todate
          ).split('T')[0];
          this.filteredParams.fromdate = '';
          this.filteredParams.todate = '';
        } else {
          this.filteredParams.fromdate = ('' + this.dateRange.fromdate).split(
            'T'
          )[0];
          this.filteredParams.todate = ('' + this.dateRange.todate).split(
            'T'
          )[0];
          this.filteredParams.visitedfromdate = '';
          this.filteredParams.visitedtodate = '';
        }
        break;
      default:
        break;
    }
  }
  resetDefaultValues(value) {
    this.filteredParams.isLeadsVisits = value;
    //Reset ONLY card-related fields from defaults
    this.filteredParams.selectedStage =
      value === 'leads' ? this.LEADS_DEFAULTS.selectedStage : 'Active Visits';

    this.filteredParams.activeCardKey =
      value === 'leads' ? this.LEADS_DEFAULTS.activeCardKey : 'allvisits-card';

    this.filteredParams.visited_count =
      value === 'leads' ? this.LEADS_DEFAULTS.visited_count : '1';
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
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
    });
  }

  getLeadsCount() {
    this.showSpinner = true;
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
        const params = {
          ...this.filteredParams,
          status: status,
          stage: '',
          visited_count: '',
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

      const stage = ['USV'];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          status: '',
          stagestatus: '1',
          visited_count: '',
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

      const status1 = ['allvisits'];
      status1.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          stage: '',
          stagestatus: '3',
          visited_count: '',
          visitedfromdate: this.filteredParams.fromdate
            ? this.filteredParams.fromdate
            : '',
          visitedtodate: this.filteredParams.todate
            ? this.filteredParams.todate
            : '',
          fromdate: '',
          todate: '',
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
            case 8:
              this.leadsCount.visitsConverted =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
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
          visited_count: '',
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
          stagestatus: stage == 'Final Negotiation' ? '3' : '',
          visited_count: '',
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
              this.Visitscounts = assignleads['Visitscounts'];

              const matched = this.Visitscounts.find(
                (item) => item.visit_order == this.filteredParams.visited_count
              );

              if (matched) {
                this.filteredParams.visited_count = matched.visit_order;
              } else if (
                this.Visitscounts.length > 0 &&
                this.Visitscounts[0]?.visit_order
              ) {
                this.filteredParams.visited_count =
                  this.Visitscounts[0].visit_order;
              }
              // if (this.filteredParams.visited_count == '') {
              //   this.filteredParams.visited_count =
              //     this.Visitscounts[0].visit_order;
              // }
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
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;
    console.log(this.filteredParams);
    this.filteredParams.visited_count =
      this.filteredParams.selectedStage == 'Active Visits'
        ? this.filteredParams.visited_count
        : '';
    return new Promise((resolve, reject) => {
      this.api
        .getAssignedLeadsDetail(this.filteredParams)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.leads_detail = isLoadmore
              ? this.leads_detail.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            this.showSpinner = false;

            this.enquiredProperty = response['SuggestedPropertyLists'];
            this.suggestedProperty = response['SuggestedPropertyLists'];
            this.filteredEnquiry = this.enquiredProperty;
            this.filteredProperty = this.suggestedProperty;
            this.filteredParams.slectedProp = this.suggestedProperty.filter(
              (item) => {
                return this.filteredParams.visitedpropName == item.name;
              }
            );
            this.filteredParams.slectedProp = this.filteredParams.propid[0];
            this.tempFilteredValues.slectedProp = this.filteredParams.propid;

            this.filteredParams.selectedLeadsProp =
              this.suggestedProperty.filter((item) => {
                return this.filteredParams.suggestedpropname == item.name;
              });
            this.filteredParams.selectedLeadsProp =
              this.filteredParams.propid[0];
            this.tempFilteredValues.selectedLeadsProp =
              this.filteredParams.propid;
            resolve(true);
          } else {
            this.leads_detail = isLoadmore ? this.leads_detail : [];
            this.suggestedProperty = isLoadmore ? this.suggestedProperty : [];
            this.filteredProperty = this.suggestedProperty;

            this.enquiredProperty = isLoadmore ? this.enquiredProperty : [];
            this.filteredEnquiry = this.enquiredProperty;
            this.showSpinner = false;
            resolve(false);
          }

          this.cd.detectChanges();
        });
    });
  }
  getVisitLabel(order: number): string {
    if (order === 1) return '1st';
    if (order === 2) return '2nd';
    if (order === 3) return '3rd';
    return order + 'th';
  }
  priority_id;
  priorityUpdateLead;
  @ViewChild('addPriorityModal') addPriorityModal;
  onSetPriority(lead, isEdit) {
    this.priorityUpdateLead = lead;
    if (!isEdit) {
      this.priority_id = '';
    }
    this.addPriorityModal.present();
  }

  onUpdatePriority() {
    this.api
      .updatehotwarmcold(this.priority_id, this.priorityUpdateLead.LeadID)
      .subscribe((resp) => {
        Swal.fire({
          title: 'Updated Successfully',
          text: 'Priority type Successfully updated',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.addPriorityModal.dismiss();
          location.reload();
        });
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
  // To open from date modal
  async openFromDate() {
    await this.cp_dashboard_toDate_modal?.dismiss();
    await this.cp_dashboard_fromDate_modal.present();
  }

  // To open to date modal
  async openToDate() {
    await this.cp_dashboard_fromDate_modal?.dismiss();
    await this.cp_dashboard_toDate_modal.present();
  }
  onmodaldismiss() {
    this.cp_dashboard_fromDate_modal?.dismiss();
    this.cp_dashboard_toDate_modal?.dismiss();
  }
  showFromDateError = false;
  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  onFromDateSelected(event) {
    this.dateRange.fromdate = event.detail.value;
    this.cp_dashboard_fromDate_modal.dismiss();
  }
  onToDateSelected(event) {
    this.dateRange.todate = event.detail.value;
    this.cp_dashboard_toDate_modal.dismiss();
  }

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams.datePreset = 'all';
    this.filteredParams.fromdate = '';
    this.filteredParams.todate = '';
    this.filteredParams.visitedfromdate = '';
    this.filteredParams.visitedtodate = '';

    // Navigate ONLY ONCE
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
  }

  onCustomDateModalDismiss(event) {
    if (this.dateRange.fromdate && !this.dateRange.todate) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
    }
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

    if (this.activeTab === 'enquiry') {
      this.filteredEnquiry = !val
        ? [...this.enquiredProperty]
        : this.enquiredProperty.filter((item) =>
            item.name.toLowerCase().includes(val)
          );
    }
  }

  applyTemFilter(data, value) {
    console.log(data, value);
    if (data == 'nextactionfromdate') {
      const fromdate = new Date(value);
      this.tempFilteredValues.fromdate = fromdate.toLocaleDateString('en-CA');
    } else if (data == 'nextactiontodate') {
      const todate = new Date(value);
      this.tempFilteredValues.todate = todate.toLocaleDateString('en-CA');
    } else if (data == 'receivedfromdate') {
      const fromdate = new Date(value);
      this.tempFilteredValues.receivedfromdate =
        fromdate.toLocaleDateString('en-CA');
    } else if (data == 'receivedtodate') {
      const todate = new Date(value);
      this.tempFilteredValues.receivedtodate =
        todate.toLocaleDateString('en-CA');
    } else if (data === 'source') {
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
    console.log(this.tempFilteredValues);
  }

  onConfirmedFilter() {
    this.filteredParams = {
      ...this.tempFilteredValues,
      visitedprop: this.tempFilteredValues.slectedProp?.propid || null,
      visitedpropName: this.tempFilteredValues.slectedProp?.name || null,
      suggestedprop: this.tempFilteredValues.selectedLeadsProp?.propid || null,
      suggestedpropname:
        this.tempFilteredValues.selectedLeadsProp?.name || null,
    };
    this.filter_modal.dismiss();
    this.router.navigate([], {
      relativeTo: this.activeroute,
      queryParams: this.filteredParams,
      queryParamsHandling: 'merge',
    });
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

  onClearFiltered() {
    this.tempFilteredValues = {};
    this.resetFilters();
  }
  addLead() {
    if (this.addleadForm.invalid) {
      this.addleadForm.markAllAsTouched();
      this.scrollToFirstError();
      return;
    }

    const params = {
      Name: this.addleadForm.value.name,
      Number: this.addleadForm.value.number,
      Mail: this.addleadForm.value.email,
      Source: this.addleadForm.value.source,
      PropertyType: this.addleadForm.value.type,
      Timeline: this.addleadForm.value.possession,
      Varient: this.addleadForm.value.size,
      Budget: this.addleadForm.value.budget,
      Address: this.addleadForm.value.address,
      addedby: localStorage.getItem('Name'),
      leadpriority: this.addleadForm.value.priority,
      preferdlocation: this.addleadForm.value.location.locality,
      localityid: this.addleadForm.value.location.id,
      categoryid: this.addleadForm.value.leadSegment,
      loginid: localStorage.getItem('UserId'),
    };
    console.log(params);
    this.api.addLead(params).subscribe((resp) => {
      console.log(resp);
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Lead Added Successfully',
          text: 'added new Lead',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.add_lead.dismiss();
          this.getLeadsCount();
        });
      }
    });
    console.log(this.addleadForm.value);
  }

  scrollToFirstError() {
    const element = document.querySelector(
      'ion-input.ng-invalid, ion-select.ng-invalid, ion-textarea.ng-invalid'
    );

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.addleadForm.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }

  toggleLeadSegment(value: string) {
    const current = this.addleadForm.value.leadSegment || [];

    if (current.includes(value)) {
      // remove
      this.addleadForm.patchValue({
        leadSegment: current.filter((v: string) => v !== value),
      });
    } else {
      // add
      this.addleadForm.patchValue({
        leadSegment: [...current, value],
      });
    }
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
  page;
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
  onScroll(event: CustomEvent) {
    this.sharedService.scrollTop = event.detail.scrollTop;
    this.scrollContent.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.clientHeight;
      this.sharedService.isBottom =
        Math.abs(scrollTop + clientHeight - scrollHeight) < 5;
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
