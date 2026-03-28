import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { ShreeindustriesApiService } from '../shreeindustries-api.service';
import Swal from 'sweetalert2';
import { EchoService } from 'src/app/realEstate/echo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-marketing-calls',
  templateUrl: './marketing-calls.component.html',
  styleUrls: ['./marketing-calls.component.scss'],
})
export class MarketingCallsComponent implements OnInit {
  @ViewChild('custDate_modal') custDate_modal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  timer: string = '00h:00m:00s';
  private intervalId: any;
  direction;
  isAfterOneminute = false;
  isAfterTwominute = false;
  isfromOnCallModal = false;
  s;
  lead;
  callStatusData;
  callLandedData;
  isProgrammaticScroll = false;
  selectedCallStatus;
  filteredParams = {
    isDateFilter: '',
    fromDate: '',
    toDate: '',
    execid: [],
    status: '',
    limit: 0,
    limitrows: 10,
    isOnCallDetailsPage: '',
    clientnum: '',
    callCount: '',
    name: '',
    tabid: '',
    loginid: localStorage.getItem('UserId'),
  };
  count = 0;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  showInfiniteScroll: boolean;
  showFromDateError: boolean;
  callDetails;
  showSpinner: boolean;
  selectedCallLanded;
  callStatus: string;
  liveCallData: any;
  updateStatusForm!: FormGroup;
  roleid: string;
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private shreeindustriesService: ShreeindustriesApiService,
    private _echoService: EchoService
  ) {}

  ngOnInit() {
    this.updateStatusForm = this.fb.group({
      status: ['', Validators.required],
      message: [''],
    });

    this.roleid = localStorage.getItem('Role');
    this.activeRoute.queryParams.subscribe((params) => {
      this.getqueryParam();

      this.getCallsCount();
    });
    this.getCallLandedData();
    this.getCallStatusData();
    this.getLiveCallsData();
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
          this.getLiveCallsData();
        }
      }
    );
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

  getCallLandedData() {
    this.shreeindustriesService.getMarketingExecutiveList().subscribe((res) => {
      this.callLandedData = res['data'];
    });
  }
  getCallStatusData() {
    this.shreeindustriesService.getMarketingCallStatus().subscribe((res) => {
      this.callStatusData = res['data'];
    });
  }

  getCallsCount() {
    this.showSpinner = true;
    this.shreeindustriesService
      .getMarketingCallsCount(this.filteredParams)
      .subscribe((res) => {
        this.filteredParams.callCount = res['count'];
        this.getCallDetails(false);
      });
  }

  getCallDetails(isLoadMore) {
    this.count = isLoadMore ? (this.count += 10) : 0;
    this.filteredParams.limit = this.count;
    return new Promise((resolve, reject) => {
      this.shreeindustriesService
        .getMarketingCalls(this.filteredParams)
        .subscribe((res) => {
          if (res['status'] == 'True') {
            this.callDetails = isLoadMore
              ? this.callDetails.concat(res['data'])
              : res['data'];
            this.showSpinner = false;
            resolve(true);
          } else {
            isLoadMore ? '' : (this.callDetails = []);
            this.showSpinner = false;
            resolve(false);
          }
        });
      this.showSpinner = false;
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

  reset() {
    this.filteredParams = {
      fromDate: '',
      toDate: '',
      isDateFilter: 'allTime',
      status: '',
      execid: [],
      isOnCallDetailsPage: '',
      limit: 0,
      limitrows: 10,
      name: '',
      callCount: this.filteredParams.callCount,
      loginid: localStorage.getItem('UserId'),
      tabid: '',
      clientnum: '',
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.selectedCallLanded = null;
    this.selectedCallStatus = null;
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
    const searchParams = new URLSearchParams(queryString);
    const queryParams: any = {};

    searchParams.forEach((value, key) => {
      if (queryParams[key]) {
        // if already exists → make array
        queryParams[key] = [].concat(queryParams[key], value);
      } else {
        queryParams[key] = value;
      }
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });

    if (this.filteredParams.status) {
      this.selectedCallStatus = this.filteredParams.status;
    }
  }
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  onCustomDateModalDismiss(event) {
    this.showFromDateError = false;
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

  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      this.sliding.close();
    } else {
      // this.outboundCall(lead);
    }
  }
  outboundCall(lead) {
    this.timer = '00h:00m:00s';
    this.sliding.close();
    this.showSpinner = true;
    if (lead == true) {
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.callto.startsWith('91') && this.lead?.callto.length > 10
          ? this.lead?.callto.slice(2)
          : this.lead?.callto;

      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.leadid,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + 'mandate',
        leadtype: 'mandate',
        tabid: '3',
      };

      this.shreeindustriesService.outboundCall(param).subscribe((resp) => {
        if (resp['status'] == 'success') {
          this.showSpinner = false;
        } else {
          this.showSpinner = false;
        }
      });
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
      console.log(lead);
      this.showSpinner = false;
      this.callConfirmationModal.present();
    }
  }

  loadMoreData(event: any) {
    if (this.isProgrammaticScroll) {
      event.target.complete();
      return;
    }

    const apiCall = this.getCallDetails(true);

    apiCall.then((hasData) => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        this.showInfiniteScroll = false;
      }
    });
  }
  onCallLandedChange(event) {
    console.log(event);
    this.filteredParams.execid = event.value;
    this.addQueryParams();
  }
  OnCallStatusChange(event) {
    console.log(event);
    this.filteredParams.status = event.value;
    this.addQueryParams();
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
              this.getCallDetails(this.liveCallData.Lead_IDFK);
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
          });
      }
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
    param = {
      status: formData.status,
      leadid: this.lead?.leadid,
      message: formData.message,
    };

    // console.log(param);
    console.log(param);

    this.shreeindustriesService
      .updateLeadStatus(param, '3')
      .subscribe((resp) => {
        console.log(resp);
        Swal.fire({
          title: 'Updated Successfully',
          icon: 'success',
          heightAuto: false,
          allowOutsideClick: true,
        }).then(() => {
          (document.activeElement as HTMLElement)?.blur();
          this.getCallsCount();
        });
      });
  }
}
