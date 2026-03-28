import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonModal } from '@ionic/angular';
import { ShreeindustriesApiService } from '../shreeindustries-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EchoService } from 'src/app/realEstate/echo.service';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-shreeindustries-dashboard',
  templateUrl: './shreeindustries-dashboard.component.html',
  styleUrls: ['./shreeindustries-dashboard.component.scss'],
})
export class ShreeindustriesDashboardComponent implements OnInit {
  @ViewChild('custDate_modal') custDate_modal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('sliding') sliding;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('addLeadModal') addLeadModal;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('addJobModal') addJobModal;
  @ViewChild('materialMultiSelect') materialMultiSelect;
  direction;
  selectedJobRole;
  selectedMaterials;
  callStatus = '';
  liveCallData;
  filteredParams = {
    isDateFilter: '',
    fromDate: '',
    toDate: '',
    activeCardKey: '',
    status: '',
    limit: 0,
    limitrows: 10,
    isOnCallDetailsPage: '',
    tabid: '',
    clientnum: '',
    name: '',
    loginid: localStorage.getItem('UserId'),
    materials: '',
    jobid: '',
  };
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  count = 0;
  leadsCount;
  leadDetails = [];
  showFromDateError: boolean;
  isBottom = false;
  showInfiniteScroll = true;
  isProgrammaticScroll = false;
  canScroll;
  showSpinner: boolean = false;
  material;
  newleadForm!: FormGroup;
  updateStatusForm!: FormGroup;
  jobForm!: FormGroup;
  lead;
  timer: string = '00h:00m:00s';
  private intervalId: any;
  isAfterOneminute = false;
  isAfterTwominute = false;
  isfromOnCallModal = false;
  callrecordsData: any = [];
  roleid;
  jobRoles;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private shreeindustriesService: ShreeindustriesApiService,
    private _echoService: EchoService
  ) {}

  ngOnInit() {
    this.roleid = localStorage.getItem('Role');
    this.updateStatusForm = this.fb.group({
      status: ['', Validators.required],
      jobrole_materials: [[]],
      message: [''],
      mail: [
        '',
        [
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
    });

    this.newleadForm = this.fb.group({
      name: ['', Validators.required],
      number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      materials: [''],
      remarks: [''],
    });

    this.jobForm = this.fb.group({
      name: ['', Validators.required],
      number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      mail: [
        '',
        [
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      jobrole: ['', Validators.required],
      message: [],
    });

    this.activeRoute.queryParams.subscribe((params) => {
      const prevTab = this.filteredParams?.tabid;
      this.callStatus = params['callStatus'];
      this.direction = params['direction'];
      this.getqueryParam();
      if (this.filteredParams.clientnum) {
        this.showSpinner = true;
        this.getCallRecords();
      } else {
        if (this.filteredParams.tabid == '1') {
          this.getLeadsCount();
        } else {
          this.getjobLeadsCount();
        }
        this.getLiveCallsData();
      }
      // Only if tab changed
      if (prevTab !== this.filteredParams.tabid) {
        this.resetInfiniteScroll();
        this.filteredParams.tabid == '1'
          ? this.getMaterial()
          : this.getjobRoles();
      }
    });

    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        console.log(message);
        if (localStorage.getItem('UserId') == message.Executive) {
          this.callStatus = message.Call_status_new;

          if (
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy'
          ) {
            this.AutoUpdateStatus(message.Call_status_new);
          }

          // if (message.Call_status_new == 'Call Disconnected') {
          //   this.timer = '00h:00m:00s';
          //   this.stopTimer();
          //   setTimeout(() => {
          //     this.router.navigate([], {
          //       queryParams: { callStatus: null },
          //       queryParamsHandling: 'merge',
          //     });
          //   }, 1000);
          // }
          this.getLiveCallsData();
        }
      }
    );
  }

  getLeadsDetail(leadid) {
    this.shreeindustriesService
      .getLeadsDetail(leadid, this.filteredParams.tabid)
      .subscribe((res) => {
        console.log(res);
        this.lead = res['data'][0];

        // to set the api value to form
        this.updateStatusForm.patchValue({
          jobrole_materials:
            this.filteredParams.tabid == '1'
              ? res['data'][0].materials
                ? res['data'][0].materials.split(',')
                : []
              : res['data'][0].jobroleid,
          message: res['data'][0]?.message,
          mail: res['data'][0].email ? res['data'][0].email : '',
        });

        console.log(this.updateStatusForm.value);
      });
  }

  getMaterial() {
    this.shreeindustriesService.getMaterial().subscribe((resp) => {
      console.log(resp);
      this.material = resp['list'];
    });
  }

  getLeadsCount() {
    this.showSpinner = true;
    this.shreeindustriesService
      .getLeadsCount(this.filteredParams)
      .subscribe((resp) => {
        this.leadsCount = resp['counts'];
        this.getLeadsListing(false);
      });
  }
  getLeadsListing(isLoadMore) {
    this.count = isLoadMore ? (this.count += 10) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.shreeindustriesService
        .getLeadsListing(this.filteredParams)
        .subscribe({
          next: (response: any) => {
            if (response['status'] == 'True') {
              this.leadDetails = isLoadMore
                ? this.leadDetails.concat(response['leads'])
                : response['leads'];
              resolve(true);
            } else {
              isLoadMore ? '' : (this.leadDetails = []);
              resolve(false);
            }
            this.showSpinner = false;
          },
          error: (err) => {
            this.leadDetails = [];
            this.showSpinner = false;
            resolve(false);
          },
        });
    });
  }

  dateFilter(dateType) {
    this.resetInfiniteScroll();
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];
    if (
      dateType != 'custom' &&
      dateType != 'customfromDate' &&
      dateType != 'customtoDate'
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.isDateFilter = dateType;
    }

    if (dateType === 'today') {
      this.filteredParams.fromDate = format(today);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromDate = format(y);
      this.filteredParams.toDate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'allTime') {
      this.filteredParams.fromDate = '';
      this.filteredParams.toDate = '';
    } else if (dateType === 'custom') {
      this.custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.dateRange.todate = null;
        this.filteredParams.toDate = '';
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      } else {
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();

      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    }

    this.addQueryParams();
  }
  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }

    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  getqueryParam() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }

  reset() {
    this.filteredParams = {
      fromDate: '',
      toDate: '',
      activeCardKey: 'total_card',
      isDateFilter: 'allTime',
      status: '0',
      isOnCallDetailsPage: '',
      limit: 0,
      limitrows: 10,
      tabid: this.filteredParams.tabid,
      name: '',
      loginid: localStorage.getItem('UserId'),
      clientnum: '',
      materials: '',
      jobid: '',
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.selectedMaterials = [];
    this.selectedJobRole = null;
    this.addQueryParams();
  }
  // To open from date modal
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
  }
  // To open to date modal
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
  }
  onCustomDateModalDismiss(event) {
    this.showFromDateError = false;
  }

  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  onStage(value, status) {
    this.resetInfiniteScroll();
    this.filteredParams.activeCardKey = value;
    this.filteredParams.status = status;
    this.addQueryParams();
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      this.sliding.close();
    } else {
      this.outboundCall(lead);
    }
  }
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;
      this.canScroll = scrollHeight > clientHeight + 10;
      if (!this.canScroll) {
        this.isBottom = false;
      } else {
        this.isBottom = scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  loadMoreData(event: any) {
    if (this.isProgrammaticScroll) {
      event.target.complete();
      return;
    }

    const apiCall =
      this.filteredParams.tabid == '1'
        ? this.getLeadsListing(true)
        : this.getJobLeadsList(true);

    apiCall.then((hasData) => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        this.showInfiniteScroll = false; // 👈 EXTRA SAFE
      }
    });
  }

  onAddLead() {
    this.addLeadModal.present();
  }

  addLead() {
    if (this.newleadForm.invalid) {
      this.newleadForm.markAllAsTouched();
      return;
    }

    const formData = this.newleadForm.value;

    const param = {
      name: formData.name,
      phone: formData.number,
      message: formData.remarks,
      materials:
        formData.materials?.map((item: any) => item.materials_IDPK) || [],
    };

    console.log('Final Payload:', param);

    this.shreeindustriesService.addNewLead(param).subscribe({
      next: (res: any) => {
        if (res.status === 'True') {
          Swal.fire({
            title: 'Added Successfully',
            icon: 'success',
            heightAuto: false,
            allowOutsideClick: true,
          }).then(() => {
            this.addLeadModal.dismiss();
            this.newleadForm.reset();
            this.getLeadsCount();
          });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Something went wrong', 'error');
      },
    });
  }

  outboundCall(lead) {
    this.timer = '00h:00m:00s';
    this.sliding.close();
    this.showSpinner = true;
    if (lead == true) {
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;

      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.leadid,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + 'mandate',
        leadtype: 'mandate',
        tabid: this.filteredParams.tabid,
      };

      this.shreeindustriesService.outboundCall(param).subscribe((resp) => {
        if (resp['status'] == 'success') {
          this.showSpinner = false;
        } else {
          this.showSpinner = false;
        }
      });
      this.updateStatusForm.reset();
      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: 'true',
          leadId: this.lead.leadid,
          execid: this.lead.ExecId,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: 'mandate',
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.showSpinner = false;
      this.callConfirmationModal.present();
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  forceToCallDisconnect() {
    const number = localStorage.getItem('Number');
    const cleanedNumber =
      number.startsWith('91') && number.length > 10 ? number.slice(2) : number;

    Swal.fire({
      title: 'Disconnect Call?',
      text: 'Are you sure you want to disconnect this call?',
      icon: 'warning',
      showCancelButton: true,
      heightAuto: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.shreeindustriesService
          .onCallDisconnected(cleanedNumber)
          .subscribe((response) => {
            this.onBackButton();
            this.updateStatusForm.reset();
          });
      }
    });
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0') + 'h'}:${
      mins.toString().padStart(2, '0') + 'm'
    }:${secs.toString().padStart(2, '0') + 's'}`;
  }

  startTimer(checkInTime) {
    this.stopTimer();
    const start =
      typeof checkInTime === 'string'
        ? new Date(checkInTime.replace(' ', 'T'))
        : checkInTime;

    this.intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000); // in seconds
      this.timer = this.formatTime(diff);

      if (diff >= 60 && this.callStatus == 'Answered') {
        this.isAfterOneminute = true;
      } else if (
        diff >= 120 &&
        (this.callStatus == 'CONNECTING' ||
          this.callStatus == 'Call Connected' ||
          this.callStatus == 'Answered by customer')
      ) {
        this.isAfterTwominute = true;
      }
    }, 1000);
  }

  getLiveCallsData() {
    this.shreeindustriesService
      .fetchLiveCall(localStorage.getItem('UserId'), this.filteredParams.tabid)
      .subscribe({
        next: (resp) => {
          if (resp['status'] == 'success') {
            this.liveCallData = resp.success[0];
            this.callStatus = resp['success'][0].dialstatus;
            this.startTimer(resp.success[0].starttime);

            if (this.filteredParams.isOnCallDetailsPage == 'true') {
              this.getLeadsDetail(this.liveCallData.Lead_IDFK);
            }
            this.router.navigate([], {
              queryParams: {
                isOnCallDetailsPage: 'true',
                leadId: resp.success[0].Lead_IDFK,
                execid: resp.success[0].Exec_IDFK,
                leadTabData: 'status',
                callStatus: 'Call Connected',
                direction: 'outboundCall',
                headerType: 'mandate',
              },
              queryParamsHandling: 'merge',
            });
          } else if (resp['status'] == 'False') {
            this.stopTimer();
          }
        },
        error: () => {},
      });
  }

  onBackButton() {
    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        callStatus: null,
        leadId: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  updateStatus() {
    if (this.updateStatusForm.invalid) {
      this.updateStatusForm.markAllAsTouched();
      return;
    }

    const formData = this.updateStatusForm.value;
    console.log(formData);
    let param;
    if (this.filteredParams.tabid == '1') {
      param = {
        status: formData.status,
        leadid: this.lead?.leadid,
        message: formData.message,
        materials: formData.jobrole_materials || '',
      };
    } else {
      param = {
        status: formData.status,
        name: this.lead?.name,
        leadid: this.lead?.leadid,
        message: formData.message,
        email: formData.mail,
        jobid: formData.jobrole_materials || '',
      };
    }

    // console.log(param);
    console.log(param);

    this.shreeindustriesService
      .updateLeadStatus(param, this.filteredParams.tabid)
      .subscribe((resp) => {
        console.log(resp);
        Swal.fire({
          title: 'Updated Successfully',
          icon: 'success',
          heightAuto: false,
          allowOutsideClick: true,
        }).then(() => {
          (document.activeElement as HTMLElement)?.blur();
          this.filteredParams.tabid == '1'
            ? this.getLeadsCount()
            : this.getjobLeadsCount();
        });
      });
  }

  AutoUpdateStatus(callStatus) {
    if (this.callStatus == 'BUSY') {
      let param;

      if (this.filteredParams.tabid == '1') {
        param = {
          status: '3',
          leadid: this.lead?.leadid,
          message: this.lead?.message || '',
        };
      } else {
        param = {
          status: '3',
          name: this.lead?.name,
          leadid: this.lead?.leadid,
          email: this.lead?.leadid,
          jobid: this.lead?.jobrole_IDFK,
          message: this.lead?.message || '',
        };
      }

      this.shreeindustriesService
        .updateLeadStatus(param, this.filteredParams.tabid)
        .subscribe((resp) => {
          this.router.navigate([], {
            queryParams: {
              isOnCallDetailsPage: null,
              leadId: null,
              execid: null,
              leadTabData: null,
              callStatus: null,
              direction: null,
              headerType: 'mandate',
              activeCardKey: 'notConnected_card',
              status: '3',
            },
            queryParamsHandling: 'merge',
          });
        });
    } else if (this.callStatus == 'Executive Busy') {
      Swal.fire({
        imageUrl: '../../../assets/CRMimages/animation/phone.gif',
        imageWidth: 150,
        imageHeight: 150,
        title: 'You Missed it',
        text: 'You initiated a call but didn’t pick up.',
        confirmButtonText: 'Initiate Call',
        showCloseButton: true,
        showDenyButton: true,
        denyButtonText: 'Move To Not Interested',
        heightAuto: false,
        showConfirmButton: true,
        showCancelButton: false,
      }).then((val) => {
        if (val.value == true) {
          setTimeout(() => {
            this.outboundCall(true);
          }, 500);
        } else if (val.isDenied) {
          let param;
          if (this.filteredParams.tabid == '1') {
            param = {
              status: '2',
              leadid: this.lead?.leadid,
              message: this.lead?.message || '',
            };
          } else {
            param = {
              status: '2',
              name: this.lead?.name,
              leadid: this.lead?.leadid,
              email: this.lead?.leadid,
              jobid: this.lead?.jobrole_IDFK,
              message: this.lead?.message || '',
            };
          }

          this.shreeindustriesService
            .updateLeadStatus(param, this.filteredParams.tabid)
            .subscribe((resp) => {
              this.router.navigate([], {
                queryParams: {
                  isOnCallDetailsPage: null,
                  leadId: null,
                  execid: null,
                  leadTabData: null,
                  callStatus: null,
                  direction: null,
                  activeCardKey: 'notInterested_card',
                  status: '2',
                  headerType: 'mandate',
                },
                queryParamsHandling: 'merge',
              });
            });
        } else if (val.dismiss) {
          this.router.navigate([], {
            queryParams: {
              isOnCallDetailsPage: null,
              leadId: null,
              execid: null,
              leadTabData: null,
              callStatus: null,
              direction: null,
              headerType: 'mandate',
            },
            queryParamsHandling: 'merge',
          });
        }
      });
    }
  }

  status;
  onInterested_notInterested(status) {
    this.status = status;
  }
  onplayButton(lead) {
    this.router.navigate([], {
      queryParams: {
        clientnum: lead.number,
        name: lead.name,
      },
      queryParamsHandling: 'merge',
    });
  }
  getCallRecords() {
    this.shreeindustriesService.getCallRecords(this.filteredParams).subscribe({
      next: (res) => {
        this.showSpinner = false;
        this.callrecordsData = res['success'];
        console.log(res);
      },
      error: () => {
        this.callrecordsData = [];
        this.showSpinner = false;
      },
    });
    // ((res) => {
    //   this.showSpinner = false;
    //   this.callrecordsData = res['success'];
    //   console.log(res);
    // });
  }

  getjobRoles() {
    this.shreeindustriesService.getjobRoles().subscribe((res) => {
      this.jobRoles = res['jobroles'];
    });
  }
  getjobLeadsCount() {
    this.showSpinner = true;
    this.shreeindustriesService
      .getjobLeadsCount(this.filteredParams)
      .subscribe((res) => {
        if (res['status'] == 'True') {
          this.leadsCount = res['counts'];
          this.getJobLeadsList(false);
        } else {
        }
      });
  }

  getJobLeadsList(isLoadMore) {
    this.count = isLoadMore ? (this.count += 10) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.shreeindustriesService
        .getJobLeadsList(this.filteredParams)
        .subscribe((res) => {
          if (res['status'] == 'True') {
            this.leadDetails = isLoadMore
              ? this.leadDetails.concat(res['leads'])
              : res['leads'];
            this.showSpinner = false;
            resolve(true);
          } else {
            isLoadMore ? '' : (this.leadDetails = []);
            this.showSpinner = false;
            resolve(false);
          }
        });
      this.showSpinner = false;
    });
  }

  onAddJob_btn() {
    this.addJobModal.present();
  }

  addJobFormSubmit() {
    console.log(this.jobForm.value);
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    const formData = this.jobForm.value;

    const param = {
      name: formData.name,
      phone: formData.number,
      message: formData.message,
      jobrole: formData.jobrole,
      email: formData.mail,
    };

    this.shreeindustriesService.addJobRole(param).subscribe((res) => {
      if (res['status'] === 'True') {
        Swal.fire({
          title: 'Added Successfully',
          icon: 'success',
          heightAuto: false,
          allowOutsideClick: true,
        }).then(() => {
          this.addJobModal.dismiss();
          this.jobForm.reset();
          this.getjobLeadsCount();
        });
      }
      console.log(res);
    });
  }

  onMaterialSelect(event) {
    console.log(event);
    const selectedArray = event.value; // [1,2]

    // convert to comma separated string
    this.filteredParams.materials = selectedArray.join(',');

    this.materialMultiSelect.hide();
    this.addQueryParams();
  }

  onJobRoleSelect(event) {
    console.log(event);
    this.filteredParams.jobid = event.value;
    this.addQueryParams();
  }

  onDateFilterRemove() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.timer = '00h:00m:00s';
    this.filteredParams.fromDate = '';
    this.filteredParams.toDate = '';
    this.filteredParams.isDateFilter = 'allTime';
    this.addQueryParams();
  }
}
