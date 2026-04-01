import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  MenuController,
  IonModal,
  PopoverController,
  IonContent,
  AnimationController,
  Platform,
} from '@ionic/angular';
import { Location } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';
import { SharedService } from '../../shared.service';
import { MandateService } from '../../mandate-service.service';
import { EchoService } from '../../echo.service';
@Component({
  selector: 'app-mandate-customer-details',
  templateUrl: './mandate-customer-details.component.html',
  styleUrls: ['./mandate-customer-details.component.scss'],
})
export class MandateCustomerDetailsComponent implements OnInit {
  @ViewChild('unlockleadtomandateModal') unlockleadtomandateModal;
  @ViewChild('visitAssignModal') visitAssignModal;
  @ViewChild('scrollContent', { static: false }) scrollContent!: IonContent;
  @ViewChild('viewToMergedLeads') viewToMergedLeads;
  @ViewChild('mergeModal') mergeModal;
  @ViewChild('retailMandate', { static: true }) retailReassignModal: IonModal;
  @ViewChild('suggModal', { static: true }) suggModal: IonModal;
  selectedLeadP;
  properties;
  isOnCallDetailsPage = false;
  isfromOnCallModal = false;
  suggestedproperties;
  suggestedPropertiesweekplan = [];
  dropdownSettings = {};
  propid = '';
  isAdminEditClosedDetails = false;
  leadMoveJunkExec: boolean = false;
  USV = false;
  RSV = false;
  negotiation = false;
  leadclose = false;
  userid: string;
  isAdmin: boolean;
  roleid: string;
  isCP: boolean;
  username: string;
  leadId: any;
  feedbackID: string = '';
  selectedExecId: any;
  projectNames;
  visitAssigModalDismiss = false;
  selectedProperty;
  isEditProDetails = false;
  isEditFixedPlan = false;
  isActivityHistory = false;
  stageForm = '';
  isCSlogin: boolean;
  isAtBottom: boolean;
  localStorage = localStorage;
  block: boolean;
  show_cnt: any;
  mergedleads: any = [];
  assignedrm: any;
  leadsDetailsInfo: any;
  getName: any;
  getMail: any;
  locality: any;
  selectedMandateTeam = '';
  mandateExecutives = [];
  retailTeamId = '';
  retailExecutives = [];
  selectedMandatePropId = '';
  selectedExecIds = [];
  selectedEXEC;
  mandateExecList;
  execList = [];
  selectedExec;
  isViewMoreSuggestedProp = false;
  // isAccompanyBy = false;

  leadpriority = [
    {
      id: '1',
      priority: 'Hot',
    },
    {
      id: '2',
      priority: 'Warm',
    },
    {
      id: '3',
      priority: 'Cold',
    },
  ];

  size_array = [
    {
      id: '1',
      size: '1 BHK',
    },
    {
      id: '2',
      size: '2 BHK',
    },
    {
      id: '3',
      size: '3 BHK',
    },
    {
      id: '4',
      size: '4 BHK',
    },
    {
      id: '5',
      size: '5 BHK',
    },
  ];

  budget_array = [
    '20L - 40L',
    '50L - 60L',
    '60L - 70L',
    '70L - 80L',
    '80L - 90L',
    '90L - 1Cr',
    '1.2Cr - Above',
    'Above 1Cr',
  ];
  showSpinner: boolean;
  popoverEvent: Event;
  assignteam: any;
  selectedSuggestedProp;
  activestagestatus: any;
  usvform: boolean;
  leadtrack: any;
  visitPlanNextDate: any;
  visitPlanNextTime: any;
  visitPlanDone: boolean;
  visitpanelselection: any;
  editplan: any;
  visitPlandate: any;
  visitPlantime: any;
  confirmbtnClicked: boolean;
  selectedpropertylists: any;
  selectedlists: Object;
  selectedproperty_commaseperated: any;
  autoremarks: string;
  today;
  closepropertyname: any;
  requestedunits: any;
  closurefiles: any;
  uploads: any;
  remark: any = '';
  showRejectionForm: boolean;
  junk: any;
  followup: any;
  fixedPropertiesList: any;
  assigntype: string;
  mandateproperties: any;
  role_type: string;

  previousUrl: string;
  currentUrl: string;

  isCallHistory: any = '';
  isCS: boolean;
  isRM: boolean;

  constructor(
    private platform: Platform,
    private popoverController: PopoverController,
    public _location: Location,
    private menuCtrl: MenuController,
    private activeroute: ActivatedRoute,
    private router: Router,
    private cdf: ChangeDetectorRef,
    public _sharedservice: SharedService,
    private _mandateService: MandateService,
    private animationCtrl: AnimationController,
    private _echoService: EchoService
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString();

    this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.isEditFixedPlan) {
        this.router.navigate([], {
          queryParams: {
            isEditFixedPlan: null,
          },
          queryParamsHandling: 'merge',
        });
        this.onBackbutton();
      } else if (this.stageForm) {
        this.router.navigate([], {
          queryParams: {
            stageForm: null,
          },
          queryParamsHandling: 'merge',
        });
        this.onBackbutton();
      } else if (this.isEditProDetails) {
        this.router.navigate([], {
          queryParams: {
            isEditProDetails: null,
          },
          queryParamsHandling: 'merge',
        });
        this.onBackbutton();
      } else if (this.isActivityHistory) {
        this.router.navigate([], {
          queryParams: {
            isActivityHistory: null,
          },
          queryParamsHandling: 'merge',
        });
        this.onBackbutton();
      } else {
        this._location.back();
      }
    });
  }

  ngOnInit() {
    this.activeroute.queryParams.subscribe((params) => {
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        allowSearchFilter: true,
      };
      this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
        this.fetchData(searchTerm);
      });

      if (params['leadId']) {
        this.leadId = params['leadId'];
      }
      if (params['feedback']) {
        this.feedbackID = params['feedback'];
      } else {
        this.feedbackID = '0';
      }
      if (params['execid']) {
        this.selectedExecId = params['execid'];
      } else {
        this.selectedExecId = '';
      }
      if (params['isEditFixedPlan']) {
        this.isEditFixedPlan = params['isEditFixedPlan'] === 'true';
      } else {
        this.isEditFixedPlan = false;
      }

      if (params['stageForm']) {
        this.stageForm = params['stageForm'];
      } else {
        this.stageForm = '';
      }

      if (params['isEditProDetails']) {
        this.isEditProDetails = params['isEditProDetails'] === 'true';
      } else {
        this.isEditProDetails = false;
      }

      if (params['isActivityHistory']) {
        this.isActivityHistory = params['isActivityHistory'] === 'true';
      } else {
        this.isActivityHistory = false;
      }

      if (params['propid']) {
        this.propid = params['propid'];
      } else {
        this.propid = '';
      }

      this.isCallHistory = params['isCallHistory'];
      this.isOnCallDetailsPage = params['isOnCallDetailsPage'] == 'true';
      if (params['fromOnCallModal']) {
        this.isfromOnCallModal = true;
      } else {
        this.isfromOnCallModal = false;
      }

      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isCS =
        localStorage.getItem('Role') == '50014' ||
        localStorage.getItem('Role') == '50013';

      this.role_type = this.localStorage.getItem('RoleType');
      this.userid = localStorage.getItem('UserId');
      this.isAdmin = localStorage.getItem('Role') == '1';
      this.roleid = localStorage.getItem('Role');
      this.isCP = localStorage.getItem('cpId') === '1';
      this.username = localStorage.getItem('Name');
      this.isCSlogin =
        localStorage.getItem('Role') === '50003' ||
        localStorage.getItem('Role') === '50004';
      this.block =
        this.userid != this.selectedExecId &&
        !this.isAdmin &&
        this.role_type != '1';
      this.getcustomerview();
      this.getlocalitylist();
      this.getFixedProperties();
      this.getLiveCallsData(this.leadId);
    });
    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        console.log('inside service');

        if (localStorage.getItem('UserId') == message.Executive) {
          console.log('inside if');
          this.callStatus = message.Call_status_new;
          this._sharedservice.callStatus = message.Call_status_new;
          if (message.Call_status_new != 'Call Disconnected') {
            this._sharedservice.isMenuOpen = false;
          } else {
            this._sharedservice.isMenuOpen = true;
            Swal.close();
          }
          setTimeout(() => {
            this.getLiveCallsData(this.leadId);
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy'
              ? this.updateStatus()
              : '';
          }, 1000);
        }
      }
    );
  }
  updateStatus() {
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const time = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let stagestatus;

    if (this.activestagestatus[0].stage !== 'Fresh') {
      if (this.activestagestatus[0].stagestatus == '1') {
        stagestatus = '1';
      } else if (this.activestagestatus[0].stagestatus == '2') {
        stagestatus = '2';
      } else if (this.activestagestatus[0].stagestatus == '3') {
        stagestatus = '3';
      }
    } else {
      if (this.activestagestatus[0].stagestatus == null) {
        stagestatus = '0';
      } else {
        stagestatus = this.activestagestatus[0].stagestatus;
      }
    }

    let followups;
    if (this.callStatus == 'BUSY') {
      followups = {
        leadid: this.assignedrm?.[0].customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus[0].stage,
        stagestatus: stagestatus,
        followupsection: '2',
        followupremarks: 'remark',
        userid: localStorage.getItem('UserId'),
        assignid: this.onCallLeadData.assignee,
        autoremarks:
          'Status changed to RNR, because the client did not answer the call.',
        property: this.selectedSuggestedProp?.propid,
        feedbackid: 0,
      };
    } else if (this.callStatus == 'Executive Busy') {
      followups = {
        leadid: this.assignedrm?.[0].customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus[0].stage,
        stagestatus: stagestatus,
        followupsection: '100',
        followupremarks: localStorage.getItem('Name') + ' was busy',
        userid: localStorage.getItem('UserId'),
        assignid: this.onCallLeadData.assignee,
        autoremarks: localStorage.getItem('Name') + ' did not pick the Call.',
        property: this.selectedSuggestedProp?.propid,
        feedbackid: 0,
      };
    }

    // if (this.htype == 'mandate') {
    this._mandateService.addfollowuphistory(followups).subscribe((success) => {
      if (success['status'] == 'True') {
        this.showSpinner = false;
        if (this.callStatus == 'Executive Busy') {
          this.executiveBusyAlert();
        } else if (this.callStatus == 'BUSY') {
          this.clientBusyAlert();
        }
      }
    });
    // } else if (this.htype == 'retail') {
    //   this._retailservice.addfollowuphistory(followups).subscribe(
    //     (success) => {
    //       if (success['status'] == 'True') {
    //         if (this.callStatus == 'Executive Busy') {
    //           this.executiveBusyAlert();
    //         } else if (this.callStatus == 'BUSY') {
    //           this.clientBusyAlert();
    //         }
    //       }
    //     },
    //     (err) => {
    //       console.log('Failed to Update');
    //     }
    //   );
    // }
  }

  clientBusyAlert() {
    Swal.fire({
      title: 'Follow-up Updated Successfully',
      text: 'Client did not answer the call. A new reminder has been set as RNR',
      icon: 'success',
      heightAuto: false,
      showConfirmButton: true,
    }).then((val) => {
      if (val.value == true) {
        this._location.back();
      }
    });
  }

  executiveBusyAlert() {
    let stagestatus;

    if (this.activestagestatus?.[0]?.stage !== 'Fresh') {
      if (this.activestagestatus?.[0]?.stagestatus == '1') {
        stagestatus = '1';
      } else if (this.activestagestatus?.[0]?.stagestatus == '2') {
        stagestatus = '2';
      } else if (this.activestagestatus?.[0]?.stagestatus == '3') {
        stagestatus = '3';
      }
    } else {
      if (this.activestagestatus?.[0]?.stagestatus == null) {
        stagestatus = '0';
      } else {
        stagestatus = this.activestagestatus?.[0]?.stagestatus;
      }
    }

    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const time = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    Swal.fire({
      imageUrl: '../../../assets/CRMimages/animation/phone.gif',
      imageWidth: 150,
      imageHeight: 150,
      title: 'You Missed it',
      text: 'You initiated a call but didn’t pick up.',
      confirmButtonText: 'Initiate Call',
      showCloseButton: true,
      showDenyButton: true,
      denyButtonText: 'Move To Inactive',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: false,
    }).then((val) => {
      if (val.value == true) {
        setTimeout(() => {
          this.outboundCall();
        }, 500);
      } else if (val.isDenied) {
        var followups1 = {
          leadid: this.assignedrm?.[0]?.customer_IDPK,
          actiondate: date,
          actiontime: time,
          leadstatus: this.activestagestatus?.[0]?.stage,
          stagestatus: stagestatus,
          followupsection: '4',
          followupremarks: `${this.assignedrm[0].customer_name} was not reachable`,
          userid: localStorage.getItem('UserId'),
          assignid: this.onCallLeadData?.assignee
            ? this.onCallLeadData?.assignee
            : this.onCallLeadData?.Exec_IDFK,
          autoremarks:
            'Status changed to Not Connected, as the call could not be established with the client.',
          property: this.selectedSuggestedProp?.propid,
          feedbackid: 0,
        };
        this.showSpinner = true;
        this._mandateService
          .addfollowuphistory(followups1)
          .subscribe((success) => {
            this.showSpinner = false;
            if (success['status'] == 'True') {
              location.reload();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                heightAuto: false,
                text: 'Something went wrong. Please try again.',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              });
            }
          });
      } else {
        location.reload();
      }
    });
  }

  getcustomerview() {
    this.showSpinner = true;
    this._mandateService.getcustomeredit(this.leadId).subscribe((cust) => {
      this.show_cnt = cust['Customerview'][0];
      this.mergedleads = cust['Customerview'][0]?.mergedleads;
      this.getName = this.show_cnt?.enquiry_name
        ? this.show_cnt.enquiry_name
        : this.show_cnt.customer_name;
      this.getMail = this.show_cnt.enquiry_mail
        ? this.show_cnt.enquiry_mail
        : this.show_cnt.customer_mail;
    });

    this._mandateService
      .getassignedrm(
        this.leadId,
        this.userid,
        this.selectedExecId,
        this.feedbackID
      )
      .subscribe((cust) => {
        if (
          cust.lead == '1' &&
          this.selectedExecId == this.userid &&
          this.isCSlogin
        ) {
          this.confirmLeadConversionToMandate();
        }

        if (cust['status'] == 'True') {
          this.assignedrm = cust['RMname'];
          this.leadsDetailsInfo = cust['RMname']; //To display the executive name

          this.assignedrm = this.assignedrm.filter((exec) => {
            return exec.RMID == this.selectedExecId;
          });

          this.suggestedPropertiesweekplan =
            this.assignedrm?.[0]?.suggestedprop;

          this.assignedrm?.[0]?.suggestedprop?.forEach((prop, index) => {
            console.log(this.propid == prop.propid);
            if (this.propid == prop.propid) {
              console.log(prop);
              this.selectedSuggestedProp = prop;
              console.log(this.selectedSuggestedProp);
            } else {
              // this.selectedSuggestedProp = {};
            }
          });

          console.log(this.assignedrm);
          if (this.propid == '') {
            this.propid = this.assignedrm?.[0]?.['suggestedprop']?.[0]?.propid;
          }

          if (this.assignedrm) {
            if (
              this.assignedrm.length > 0 &&
              this.assignedrm?.[0]?.rnrcount >= 5 &&
              this.roleid != '1' &&
              this.roleid != '2'
            ) {
              Swal.fire({
                text: 'Access Denied , Do contact the Admin',
                icon: 'error',
                heightAuto: false,
              }).then(() => {
                this.router.navigate(['mandate-lead-stages'], {
                  queryParams: {
                    status: 'inactive',
                    type: 'Inactive',
                    isDropDown: 'false',
                    followup: '2',
                  },
                });
              });
            }
          }

          // if (this.assignedrm?.[0]?.suggestedprop?.length > 1) {
          //   let propertyData;
          //   this.selectedSuggestedProp =
          //     this.assignedrm?.[0]?.suggestedprop.forEach((prop, index) => {
          //       return this.propid == prop.propid;
          //     });
          //   if (
          //     (propertyData.selection == 1 &&
          //       propertyData.leadstage == 'USV' &&
          //       propertyData.actions == 0) ||
          //     (propertyData.selection == 2 &&
          //       propertyData.leadstage == 'RSV' &&
          //       propertyData.actions == 1)
          //   ) {
          //     this.selectedSuggestedProp = propertyData;
          //   } else {
          //     setTimeout(() => {
          //       this.selectedSuggestedProp =
          //         this.assignedrm?.[0]?.suggestedprop?.[0];
          //     }, 100);
          //   }
          // } else {
          //   this.selectedSuggestedProp =
          //     this.assignedrm?.[0]?.suggestedprop?.[0];
          // }

          // setTimeout(() => {
          // this.isAccompanyBy = false;
          // if ((this.userid != this.selectedExecId) && this.roleid != '1' && this.roleid != '2' && ((this.role_type == '1' && (this.assignedrm.roleid == '50003' || this.assignedrm.roleid == '50004')) || this.role_type != '1') && this.feedbackID != '1') {
          //   $(".updateActivities").removeClass("active");
          //   $(".allActivities").removeClass("active");
          // }
          // else if ((this.userid == this.selectedExecId) && this.roleid != '1' && this.roleid != '2' && ((this.role_type == '1' && this.assignedrm.roleid != '50003' && this.assignedrm.roleid != '50004')) && this.feedbackID !='1') {
          //   console.log('triggered',this.assignedrm)
          //   if(this.assignedrm && this.assignedrm[0].visitaccompaniedid && (this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID)){
          //     this.isAccompanyBy = true;
          //     console.log(this.isAccompanyBy)
          //   } else {
          //   }
          // }
          // else if((this.userid != this.selectedExecId) && this.roleid != '1' && this.roleid != '2' && ((this.role_type == '1' && this.assignedrm.roleid != '50003' && this.assignedrm.roleid != '50004') || this.role_type != '1') && this.feedbackID != '1'){
          //   console.log(this.assignedrm,this.isAccompanyBy)
          //   if(this.assignedrm && this.assignedrm[0].visitaccompaniedid && (this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID) || this.role_type == '1'){
          //     this.isAccompanyBy = true;
          //     console.log(this.isAccompanyBy)
          //   } else {
          //   }
          // }
          // }, 1000)

          if (this.role_type == '1') {
            if (
              this.assignedrm &&
              this.assignedrm[0].visitaccompaniedid &&
              this.selectedExecId != this.assignedrm[0].RMID &&
              this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID
            ) {
              // this.isAccompanyBy = true;
            } else if (
              this.assignedrm &&
              this.assignedrm[0].visitaccompaniedid &&
              this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID
            ) {
              // this.isAccompanyBy = true;
            } else {
              // this.isAccompanyBy = false;
            }
          }

          this.getstages();
          this.verifyrequest(
            this.leadId,
            this.propid,
            this.selectedExecId,
            this.selectedSuggestedProp?.name
          );
          this.triggerhistory();
          if (this.assignedrm && this.assignedrm?.[0]?.suggestedprop) {
            this.visitpanelselection =
              this.assignedrm?.[0]?.suggestedprop.filter((prop) => {
                return !(prop.weekplan == null);
              });

            if (
              this.visitpanelselection.length > 0 &&
              this.visitpanelselection?.[0]?.weekplan == '1'
            ) {
              this.selectedPlanType = 'weekdays';
            } else if (
              this.visitpanelselection.length > 0 &&
              this.visitpanelselection?.[0]?.weekplan == '2'
            ) {
              this.selectedPlanType = 'weekend';
            } else if (
              this.visitpanelselection.length > 0 &&
              this.visitpanelselection?.[0]?.weekplan == '0'
            ) {
              this.selectedPlanType = 'ytc';
            }
          }
          this.selectedPlanType === ''
            ? this.selectedplan('')
            : this.selectedplan(this.selectedPlanType);
        }
        this.getAllCallLogs(false);
      });
  }

  allCallLogs = [];
  getAllCallLogs(isLoadmore) {
    const params = {
      loginid: this.userid,
      execid: this.selectedExecId,
      clientnum: this.leadsDetailsInfo?.[0]?.customer_number,
      limit: 0,
      limitrows: 30,
    };
    return new Promise((resolve, reject) => {
      this._sharedservice.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'success') {
            this.allCallLogs = isLoadmore
              ? this.allCallLogs.concat(response['success'])
              : response['success'];
            this.groupByDate(this.allCallLogs);
            resolve(true);
          } else {
            this.showSpinner = false;
            this.allCallLogs = [];
            this.groupedByDate = [];
            resolve(false);
          }
        },
        error: (err) => {
          console.log('error', err);
          this.allCallLogs = [];
          this.groupedByDate = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }

  groupedByDate: any[] = [];
  groupByDate(records: any[]) {
    const grouped = {};
    records?.forEach((call) => {
      if (!call?.starttime) return;
      const date = call?.starttime?.split(' ')[0]; // extract 'YYYY-MM-DD'
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(call);
    });
    // Convert object to array (Angular 5 doesn’t support keyvalue pipe)
    this.groupedByDate = Object.keys(grouped).map((date) => ({
      date,
      calls: grouped[date],
    }));
  }

  async toggleAudio(audioElement: HTMLAudioElement, event: Event) {
    const clickedIcon = event.target as HTMLElement;

    // Pause all other audios
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach((audio) => {
      if (audio !== audioElement) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Reset all other icons to play
    const allIcons = document.querySelectorAll('ion-icon.play-icon');
    allIcons.forEach((icon) => {
      icon.setAttribute('name', 'play');
    });

    // Toggle current audio
    if (audioElement.paused) {
      try {
        await audioElement.play();
        clickedIcon.setAttribute('name', 'pause');

        // Reset icon when audio ends
        audioElement.onended = () => {
          clickedIcon.setAttribute('name', 'play');
        };
      } catch (err) {
        console.warn('Audio play interrupted:', err);
      }
    } else {
      audioElement.pause();
      audioElement.currentTime = 0;
      clickedIcon.setAttribute('name', 'play');
    }
  }
  isleadcloseupdate = false;
  getstages() {
    this._mandateService
      .getactiveleadsstatus(
        this.leadId,
        this.userid,
        this.selectedExecId,
        this.propid,
        this.feedbackID
      )
      .subscribe((stagestatus) => {
        if (stagestatus['status'] == 'True') {
          this.activestagestatus = stagestatus['activeleadsstatus'];
          if (this.activestagestatus[0].stage == 'Deal Closed') {
            this.isleadcloseupdate = true;
          } else if (
            this.activestagestatus[0].stage == 'Lead Closed' ||
            this.activestagestatus[0].stage == 'Move to Junk'
          ) {
            this.USV = false;
            this.RSV = true;
            this.negotiation = true;
            this.leadclose = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = true;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'Deal Closing Requested' &&
            (this.activestagestatus[0].followupstatus == '0 ' ||
              this.activestagestatus[0].followupstatus == null ||
              this.activestagestatus[0].followupstatus == '4')
          ) {
            this.USV = false;
            this.RSV = false;
            this.negotiation = false;
            this.leadclose = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = true;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'Closing Request Rejected' &&
            (this.activestagestatus[0].followupstatus == '0 ' ||
              this.activestagestatus[0].followupstatus == null ||
              this.activestagestatus[0].followupstatus == '4')
          ) {
            this.RSV = false;
            this.negotiation = false;
            this.USV = false;
            this.leadclose = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = true;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'Fresh' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.USV = true;
            this.RSV = false;
            this.negotiation = false;
            this.leadclose = false;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = true;
            this.RSV = false;
            this.negotiation = false;
            this.leadclose = false;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'USV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.negotiation = true;
            this.leadclose = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'USV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
          ) {
            this.RSV = false;
            this.negotiation = false;
            this.leadclose = false;
            this.USV = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = false;
            this.negotiation = false;
            this.leadclose = false;
            this.RSV = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'RSV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.negotiation = true;
            this.leadclose = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'RSV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
          ) {
            this.USV = false;
            this.RSV = true;
            this.negotiation = false;
            this.leadclose = false;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = false;
            this.RSV = false;
            this.leadclose = false;
            this.negotiation = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'Final Negotiation' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.leadclose = true;
            this.negotiation = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (
            this.activestagestatus[0].stage == 'Final Negotiation' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
          ) {
            this.USV = false;
            this.RSV = false;
            this.leadclose = false;
            this.negotiation = true;
            this.followup = true;
            this.junk = true;
            this.isleadcloseupdate = false;
            this.leadMoveJunkExec = false;
          } else if (this.activestagestatus[0].stage == 'Junk') {
            if (this.roleid == '1') {
              this.USV = false;
              this.RSV = false;
              this.negotiation = false;
              this.leadclose = false;
              this.followup = false;
              this.junk = false;
              this.leadMoveJunkExec = true;
              this.isleadcloseupdate = false;
            } else if (this.roleid != '1' && this.roleid != '2') {
              if (this.feedbackID == '') {
                this.USV = false;
                this.RSV = false;
                this.negotiation = false;
                this.leadclose = false;
                this.followup = false;
                this.junk = false;
                this.leadMoveJunkExec = false;
                this.isleadcloseupdate = false;
              } else {
                this.USV = true;
                this.RSV = true;
                this.negotiation = true;
                this.leadclose = true;
                this.followup = true;
                this.junk = true;
                this.leadMoveJunkExec = true;
                this.isleadcloseupdate = false;
              }
            } else {
            }
          } else {
            if (
              this.activestagestatus[0].stage == 'Fresh' &&
              this.activestagestatus[0].followupstatus == null
            ) {
              this.USV = true;
              this.RSV = false;
              this.negotiation = false;
              this.leadclose = false;
              this.followup = true;
              this.junk = true;
              this.isleadcloseupdate = false;
              this.leadMoveJunkExec = false;
            }
          }
          if (this.activestagestatus[0].stage == 'Fresh') {
            this.usvform = false;
          }
        } else if (stagestatus['status'] == 'False') {
          this.RSV = false;
          this.negotiation = false;
          this.leadclose = false;
          this.USV = true;
          this.followup = true;
          this.junk = true;
          this.isleadcloseupdate = false;
          this.leadMoveJunkExec = false;
          this.activestagestatus = [];
        }
      });
  }

  getlocalitylist() {
    this._mandateService.getlocality().subscribe((localities) => {
      this.locality = localities['Localities'];
    });
  }

  // LEAD CONVERSION POPUP
  confirmLeadConversionToMandate() {
    Swal.fire({
      title: 'Do you want to convert lead to Mandate.',
      icon: 'warning',
      heightAuto: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'OK',
      cancelButtonText: 'NO',
    }).then((result) => {
      console.log(result.isConfirmed);
      if (result.isConfirmed) {
        this.unlockleadtomandateModal.present();
        this.mandatepropertyfetch();
      } else {
        this.router.navigate(['assigned-leads-detail'], {
          queryParams: {
            htype: 'retail',
          },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  //fetch properties
  mandatepropertyfetch() {
    this._mandateService.getmandateprojects().subscribe((mandates) => {
      if (mandates['status'] == 'True') {
        this.projectNames = mandates['Properties'];
        this.mandateproperties = mandates['Properties'];
        if (this.assigntype == 'visit') {
          const selectedPropIds = this.fixedPropertiesList.map((p) => p.propId);
          this.mandateproperties = this.mandateproperties.map((item) => {
            return {
              ...item,
              isSelected: selectedPropIds.includes(item.property_idfk),
            };
          });
        } else {
          this.mandateproperties = this.mandateproperties.map((item) => {
            return {
              ...item,
              isSelected: true,
            };
          });
        }
      } else {
      }
    });
  }

  getExecutive() {
    this._mandateService
      .fetchmandateexecutives(
        this.propid,
        this.selectedMandateTeam,
        this.selectedExecTeam ? this.selectedExecTeam?.code : '50002'
      )
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.selectedExecIds = [];
          this.mandateExecutives = executives['mandateexecutives'];
          this.mandateExecutives = this.mandateExecutives.filter(
            (executive) => {
              return !this.leadsDetailsInfo.some(
                (rmids) => rmids.RMID == executive.id
              );
            }
          );
        }
      });
  }
  //UNBLOCK THE LEAD METHOD
  unlockleadtomandate() {
    let param = {
      leadid: this.leadId,
      propid: this.selectedProperty?.property_idfk,
      execid: this.userid,
    };
    this._mandateService.unlockleadtomandate(param).subscribe((response) => {
      console.log(response);
      if (response['status'] == 'True') {
        this.unlockleadtomandateModal.dismiss();
        location.reload();
      }
    });
  }

  //NAVIGATING TO RETAIL DETAILS PAGE
  // onHtype(htype) {
  //   this.router.navigate(['mandate-lead-details'], {
  //     queryParams: {
  //       htype: 'mandate',
  //     },
  //     queryParamsHandling: 'merge',
  //   });
  //   // if (this.isRetail) {
  //   //   this.router.navigate(['assigned-leads-detail'], {
  //   //     queryParams: {
  //   //       htype: 'retail',
  //   //       execid: !this.isAdmin ? this.userid : this.selectedExecId,
  //   //     },
  //   //     queryParamsHandling: 'merge',
  //   //   });
  //   // } else {
  //   //   this.router.navigate(['mandate-lead-details'], {
  //   //     queryParams: {
  //   //       htype: 'mandate',
  //   //     },
  //   //     queryParamsHandling: 'merge',
  //   //   });
  //   // }
  // }

  openEndMenu() {
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    let elementId = '';
    if (this.stageForm) {
      elementId = 'statusSection';
    } else if (this.isEditFixedPlan) {
      elementId = 'fixedPlanSection';
    } else if (this.isActivityHistory) {
      elementId = 'activitySection';
    }

    setTimeout(() => {
      if (
        elementId &&
        this.stageForm == '' &&
        !this.isEditFixedPlan &&
        !this.isActivityHistory
      ) {
        const selectedElement = document.getElementById(elementId);
        if (selectedElement) {
          this.scrollContent.scrollToPoint(0, selectedElement.offsetTop, 500);
        } else {
          console.warn('Element not found:', elementId);
        }
      } else {
        this.scrollContent.scrollToTop();
      }
    }, 300);

    if (
      this.stageForm ||
      this.isEditFixedPlan ||
      this.isActivityHistory ||
      this.isEditProDetails
    ) {
      if (this.stageForm) {
        this.stageForm = '';
      } else if (this.isEditFixedPlan) {
        this.isEditFixedPlan = false;
      } else if (this.isActivityHistory) {
        this.isActivityHistory = false;
      } else if (this.isEditProDetails) {
        this.isEditProDetails = false;
      }

      this.router.navigate([], {
        queryParams: {
          stageForm: null,
          isEditFixedPlan: null,
          isActivityHistory: null,
          isCallHistory: null,
          isEditProDetails: null,
          execid:
            this.isAdmin && this.selectedExecId == ''
              ? this.leadsDetailsInfo[0].RMID
              : this.selectedExecId,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      this._location.back();
    }
  }
  canScroll;
  //Scroll event handler
  onScroll(event: CustomEvent) {
    // const scrollTop = event.detail.scrollTop;

    // this.scrollContent.getScrollElement().then((scrollEl) => {
    //   const scrollHeight = scrollEl.scrollHeight;
    //   const clientHeight = scrollEl.offsetHeight;

    //   const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    //   this.isAtBottom = isNearBottom;
    // });

    this._sharedservice.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.scrollContent.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  //CALLED WHEN WE CLICK ON WHATS APP, CALL AND MAIL ICONS
  onContactIconClick(type: 'email' | 'call' | 'whatsapp', contact): void {
    if (type === 'email') {
      window.open(`mailto:${contact}`, '_system');
    } else if (type === 'call') {
      // window.open(`tel:${contact}`, '_system');
      Swal.fire({
        title: 'Lead in Junk',
        text: 'This lead is currently marked as Junk. Please revert the lead first to make a call.',
        icon: 'warning',
        confirmButtonText: 'OK',
        heightAuto: false,
      });
    } else if (type === 'whatsapp') {
      window.open(`https://wa.me/+91 ${contact}`, '_system');
    }
  }

  alternateNumbercheck(event) {
    if (event.target.value == this.show_cnt.customer_number) {
      this.show_cnt.enquiry_altnumber = '';
      $('#enquiry_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please enter different contact number')
        .val('');
    }
  }

  async onEditPropDetails() {
    this.isEditProDetails = true;
    this.router.navigate([], {
      queryParams: {
        isEditProDetails: true,
      },
      queryParamsHandling: 'merge',
    });
    await this.popoverController.dismiss();
  }

  updateProfile() {
    // primary name
    if ($('#customer_name').val() === '') {
      $('#customer_name')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Name');
      return false;
    } else {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#customer_name').val()))) {
        $('#customer_name').removeAttr('style');
      } else {
        $('#customer_name')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid name')
          .val('');
        return false;
      }
    }

    //primary mail
    if ($('#customer_mail').val() != '') {
      let enameFilter =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (enameFilter.test(String($('#customer_mail').val()))) {
        $('#customer_mail').removeAttr('style');
      } else {
        $('#customer_mail')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid email')
          .val('');
        return false;
      }
    }

    //alternate mail
    if ($('#enquiry_mail').val() != '') {
      let enameFilter =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (enameFilter.test(String($('#enquiry_mail').val()))) {
        $('#enquiry_mail').removeAttr('style');
      } else {
        $('#enquiry_mail')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid email')
          .val('');
        return false;
      }
    }
    //alternate name
    if ($('#enquiry_name').val() != '') {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#enquiry_name').val()))) {
        $('#enquiry_name').removeAttr('style');
      } else {
        $('#enquiry_name')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid name')
          .val('');
        return false;
      }
    }

    //alternate number
    var mobileno = /^[0-9]{10}$/;
    if ($('#enquiry_number').val() != '') {
      if (mobileno.test(String($('#enquiry_number').val()))) {
        $('#enquiry_number').removeAttr('style');
      } else {
        $('#enquiry_number')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid contact number')
          .val('');
        return false;
      }
    }
    var propertyselect = $('#property_select').val();
    var param = {
      primaryname: $('#customer_name').val(),
      primarynumber: $('#customer_number').val(),
      primarymail: $('#customer_mail').val(),
      name: this.show_cnt.enquiry_altname,
      number: this.show_cnt.enquiry_altnumber,
      mail: this.show_cnt.enquiry_altmail,
      budget: this.show_cnt.enquiry_budget,
      location: this.show_cnt.localityid,
      proptype: this.show_cnt.enquiry_proptype,
      size: this.show_cnt.enquiry_bhksize,
      property: propertyselect,
      priority: this.show_cnt.lead_priority,
      address: this.show_cnt.address,
      leadid: this.leadId,
      possession: this.show_cnt.enquiry_possession,
    };

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Updating lead details is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      }).then((result) => {
        this.showSpinner = false;
      });
    } else {
      this._sharedservice.updateProfile(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            Swal.fire({
              title: 'Updated Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              this.scrollContent.scrollToTop(500);
              this.onBackbutton();
            });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
    return true;
  }

  toViewMergedLeads() {
    this.viewToMergedLeads.present();
  }

  mergeLeadDetails = [];
  onMergeIcon() {
    this.mergeLeadDetails = [];
    const obj = {
      id: this.assignedrm[0].customer_IDPK,
      name: this.assignedrm[0].customer_name,
    };

    this.mergeLeadDetails.push(obj);

    console.log(this.mergeLeadDetails);
    this.mergeModal.present();
  }

  leadSearchTerm;
  filteredLeads = [];
  filteredLead = [];
  isActiveMerge = false;
  searchSubject = new Subject<string>();
  selectedRelation;
  relationShips = [
    { name: 'Father', code: 'Father' },
    { name: 'Mother', code: 'Mother' },
    { name: 'Sister', code: 'Sister' },
    { name: 'Brother', code: 'Brother' },
    { name: 'Husband', code: 'Husband' },
    { name: 'Wife', code: 'Wife' },
    { name: 'Friend', code: 'Friend' },
    { name: 'Others', code: 'Others' },
  ];
  onCloseMergeModal() {
    this.filteredLead = [];
    this.filteredLeads = [];
    this.leadSearchTerm = '';
    this.isActiveMerge = false;
    this.mergeModal.dismiss();
  }

  searchClient(event): void {
    this.showSpinner = true;
    const query = event.target.value;
    if (query.length >= 5) {
      this.searchSubject.next(query);
    } else {
      this.filteredLeads = [];
      this.showSpinner = false;
    }
  }

  onFilteredLead(lead) {
    this.filteredLead = [];
    this.filteredLead.push(lead);
    this.isActiveMerge = true;
    this.leadSearchTerm = '';
    this.filteredLeads = [];

    const obj = {
      id: this.filteredLead[0].customer_IDPK,
      name: this.filteredLead[0].customer_name,
    };

    this.mergeLeadDetails.push(obj);
    console.log(this.mergeLeadDetails);
  }

  onMergeLead() {
    if (
      this.selectedRelation == '' ||
      this.selectedRelation == undefined ||
      this.selectedRelation == null
    ) {
      Swal.fire({
        title: 'Relation',
        text: 'Please select the Relationship',
        timer: 2000,
        heightAuto: false,
        showConfirmButton: false,
        icon: 'error',
      });
      $('#relationship_dropdown')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select the Relation');
      return false;
    }

    let param = {
      leadId: this.leadId,
      mergeLeadId: this.filteredLead[0].customer_IDPK,
      relation: this.selectedRelation.name,
      LeadP: this.selectedLeadP.id,
    };

    this._sharedservice.postMergeLeads(param).subscribe((resp) => {
      Swal.fire({
        title: 'Merge Lead',
        text: 'The Lead has been successfully Merged',
        showConfirmButton: false,
        timer: 2000,
        heightAuto: false,
        icon: 'success',
      }).then(() => {
        location.reload();
      });
    });
    return true;
  }

  fetchData(query: string) {
    let searchedData;
    if (/^[\d\s+]+$/.test(query)) {
      searchedData = query.replace(/\s+/g, '');
      searchedData = searchedData.slice(-10);
    } else {
      searchedData = query;
    }
    this._sharedservice.searchLeads(searchedData, '', '', '').subscribe({
      next: (response) => {
        if (response['status'] == 'True') {
          this.filteredLeads = response['Searchlist'];
          this.showSpinner = false;
        } else {
          this.filteredLeads = [];
          this.showSpinner = false;
        }
      },
      error: (error) => {
        this.filteredLeads = [];
        this.showSpinner = false;
      },
    });
  }

  getexecutiveId(exec) {
    console.log(exec);
    console.log(exec.roleid == '50004');
    if (exec.RMID != this.userid && !this.isAdmin && this.role_type != '1') {
      this.router.navigate([], {
        queryParams: {
          execid: exec.RMID,
          propid: exec.suggestedprop[0].propid,
          isActivityHistory: true,
          stageForm: null,
          isCallHistory: 'leads',
          isEditFixedPlan: null,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      if (this.stageForm) {
        this.router.navigate([], {
          queryParams: {
            execid: exec.RMID,
            propid: exec.suggestedprop[0].propid,
            stageForm: 'onleadStatus',
          },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      } else {
        this.router.navigate([], {
          queryParams: {
            execid: exec.RMID ? exec.RMID : null,
            propid: exec.suggestedprop?.[0]?.propid,
          },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    }
  }

  displayAssignLeadModal(type) {
    this.assignteam = type;
    if (type == 'mandate') {
      this.mandatepropertyfetch();
    }
    this.retailReassignModal.present();
  }

  modeldismis_reset() {
    this.visitAssignModal.dismiss();
    this.retailReassignModal.dismiss();
    this.selectedMandateTeam = '';
    this.selectedExecTeam = '';
    this.selectedProperty = '';
    this.retailTeamId = '';
    this.mandateExecutives = [];
    this.retailExecutives = [];
    this.selectedMandatePropId = '';
    this.selectedExecIds = [];
    this.selectedEXEC = null;
  }

  getselectedteam(vals) {
    if (this.assignteam == 'mandate') {
      this.selectedMandateTeam = vals.detail.value;
      this._mandateService
        .fetchmandateexecutives(this.selectedMandatePropId, vals.detail.value)
        .subscribe((executives) => {
          if (executives['status'] == 'True') {
            this.selectedExecIds = [];
            this.mandateExecutives = executives['mandateexecutives'];
            this.mandateExecutives = this.mandateExecutives.filter(
              (executive) => {
                return !this.leadsDetailsInfo.some(
                  (rmids) => rmids.RMID == executive.id
                );
              }
            );
          }
        });
    } else if (this.assignteam == 'retail') {
      this.retailTeamId = vals.detail.value;
      this._mandateService
        .getexecutivesbasedid(this.retailTeamId)
        .subscribe((execute) => {
          this.selectedExecIds = [];
          this.retailExecutives = execute['Executiveslist'];
          this.retailExecutives = this.retailExecutives.filter((executive) => {
            return !this.leadsDetailsInfo.some(
              (rmids) => rmids.RMID == executive.ID
            );
          });
        });
    }
  }

  //here we get the selected  mandate property
  getselectedprop(event) {
    console.log(event);
    console.log(this.selectedExecTeam);
    this.selectedExecIds = [];
    this.selectedEXEC = [];
    this.selectedMandatePropId = event.detail.value;
    this._mandateService
      .fetchmandateexecutives(
        event.detail.value,
        this.selectedMandateTeam,
        this.selectedExecTeam ? this.selectedExecTeam?.code : '50002'
      )
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.selectedExecIds = [];
          this.mandateExecutives = executives['mandateexecutives'];
          this.mandateExecutives = this.mandateExecutives.filter(
            (executive) => {
              return !this.leadsDetailsInfo.some(
                (rmids) => rmids.RMID == executive.id
              );
            }
          );
        }
      });
  }

  // here we get the selected executive id's
  executiveSelect(event) {
    console.log(event);
    this.selectedExecIds = [];
    console.log(this.selectedEXEC);
    if (this.assigntype != 'visit') {
      this.selectedExecIds = this.selectedEXEC.map((exec) => exec.id);
      this.selectedExecIds = Array.from(new Set(this.selectedExecIds));
    } else if (this.assigntype == 'visit') {
      this.selectedExecIds = this.selectedEXEC.id;
    } else if (this.assignteam == 'retail') {
      this.selectedExecIds = this.selectedEXEC.map((exec) => exec.ID);
      this.selectedExecIds = Array.from(new Set(this.selectedExecIds));
    }
    console.log(this.selectedExecIds);
    // this.selectedExecIds = Array.from(new Set(this.selectedExecIds));
  }

  assignLead() {
    let comma_separated_data;
    if (this.selectedExecIds) {
      comma_separated_data = this.selectedExecIds.join(', ');
    }
    if (
      this.assignteam == 'retail' &&
      (this.retailTeamId == '' || this.retailTeamId == undefined)
    ) {
      Swal.fire({
        title: 'Please Select The Team!',
        text: 'Please try agin',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      });
    } else if (
      this.assignteam == 'mandate' &&
      this.selectedMandatePropId == ''
    ) {
      Swal.fire({
        title: 'Please Select The Property!',
        text: 'Please try agin',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      });
      $('#property')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select the Property');
    } else if (this.selectedExecIds.length === 0) {
      Swal.fire({
        title: 'Please Select The Executive!',
        text: 'Please try agin',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      }).then((result) => {});
      $('#rm_dropdown')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select the Executives');
    } else {
      $('#rm_dropdown').removeAttr('style');
      var param = {
        rmID: comma_separated_data,
        LeadID: this.leadId,
        random: '',
        propID: this.selectedMandatePropId,
        loginId: this.userid,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Lead assignment is not allowed for demo account.',
          icon: 'error',
          allowOutsideClick: false,
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          this.showSpinner = false;
        });
      } else {
        // if (this.assignteam == 'mandate') {
        //ASSIGNED TO MANDATE
        this._mandateService.lead_ReAssign(param).subscribe((success) => {
          if (success['status'] == 'True') {
            this.reassignedResponseInfo = success['assignedleads'];
            Swal.fire({
              title: 'Assigned Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              this.showSpinner = true;
              if (result.isConfirmed) {
                this.retailReassignModal.dismiss();
                this.viewAssignLeadDetail.present();
              } else if (result.dismiss === Swal.DismissReason.backdrop) {
                this.retailReassignModal.dismiss();
                this.viewAssignLeadDetail.present();
              }
            });
          }
        });
        // } else if (this.assignteam == 'retail') {
        //   //ASSIGNED TO RETAIL
        //   this._retailservice.leadassign(param).subscribe((success) => {
        //     if (success['status'] == 'True') {
        //       Swal.fire({
        //         title: 'Assigned Successfully',
        //         icon: 'success',
        //         heightAuto: false,
        //         confirmButtonText: 'OK!',
        //       }).then((result) => {
        //         this.selectedExecIds = [];
        //         this.selectedMandatePropId = '';
        //         this.selectedMandateTeam = '';
        //         location.reload();
        //       });
        //     } else {
        //       Swal.fire({
        //         title: 'Authentication Failed!',
        //         icon: 'error',
        //         heightAuto: false,
        //         confirmButtonText: 'OK!',
        //       }).then((result) => {
        //         this.selectedExecIds = [];
        //         this.selectedMandatePropId = '';
        //         this.selectedMandateTeam = '';
        //         location.reload();
        //       });
        //     }
        //   });
        // }
      }
    }
  }

  actionChange(val) {
    $('#sectionselector').val('');
    if (val == 'Follow Up') {
      this.stageForm = 'followupform';
      $('#customer_phase4').val('Follow Up');
      $('#sectionselector').val('Follow Up');
    } else if (val == 'USV') {
      this.stageForm = 'usvform';
      $('#customer_phase4').val('USV');
      $('#sectionselector').val('USV');
    } else if (val == 'RSV') {
      this.stageForm = 'rsvform';
      $('#customer_phase4').val('RSV');
      $('#sectionselector').val('RSV');
    } else if (val == 'Final Negotiation') {
      this.stageForm = 'finalnegoform';
      $('#customer_phase4').val('Final Negotiation');
      $('#sectionselector').val('Final Negotiation');
    } else if (val == 'Lead Closed') {
      this.stageForm = 'leadclosedform';
      $('#customer_phase4').val('Lead Closed');
      $('#sectionselector').val('Lead Closed');
    } else if (val == 'Move to Junk') {
      this.stageForm = 'junkform';
      $('#customer_phase4').val('Move to Junk');
      $('#sectionselector').val('Move to Junk');
    } else if (val == 'onleadStatus') {
      this.stageForm = 'onleadStatus';
    }
    this.router.navigate([], {
      queryParams: {
        stageForm: this.stageForm,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    // const baseUrl = this.router.url.split('?')[0];
    // const params = new URLSearchParams(this.activeroute.snapshot.queryParams);
    // params.set('stageForm', this.stageForm);

    // this._location.replaceState(baseUrl, params.toString());
  }

  //to get activity of leads
  triggerhistory() {
    this.roleid = localStorage.getItem('Role');
    this.userid = localStorage.getItem('UserId');

    let execId;
    if (this.isCallHistory == 'executive') {
      execId = this.selectedExecId;
    } else {
      execId = '';
    }

    var param2 = {
      leadid: this.leadId,
      roleid: this.roleid,
      userid: this.userid,
      execid: this.selectedExecId,
      feedbackid: this.feedbackID,
    };
    this._mandateService.gethistory(param2).subscribe((history) => {
      this.showSpinner = false;
      if (history['status'] == 'True') {
        // this.leadtrack = history['Leadhistory'];

        const uniquehistory = history['Leadhistory'].filter((val, i, self) => {
          return (
            i ==
            self.findIndex((t) => {
              return (
                t.autoremarks == val.autoremarks && t.Saveddate == val.Saveddate
              );
            })
          );
        });
        this.leadtrack = uniquehistory;
      } else {
        this.leadtrack = [];
      }
    });
  }

  onViewAllActivity(data) {
    if (data == 'history') {
      this.router.navigate([], {
        queryParams: {
          isActivityHistory: true,
          isCallHistory: 'leads',
          execid: this.selectedExecId,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else if (data == 'calls') {
      this.router.navigate([], {
        queryParams: {
          isActivityHistory: true,
          isCallHistory: 'calls',
          execid: this.selectedExecId,
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }
  onFixingPlan() {
    this.router.navigate([], {
      queryParams: {
        isEditFixedPlan: true,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  selectedPlanType = '';
  selectedplan(plantype) {
    this.selectedPlanType = plantype;
    if (this.assignedrm && this.assignedrm?.[0]?.leadstage == 'USV') {
      this.visitPlanNextDate = this.selectedSuggestedProp?.nextdate;
      this.visitPlanNextTime = this.selectedSuggestedProp?.nexttime;
    } else if (
      this.assignedrm &&
      this.assignedrm?.[0]?.leadstage == 'RSV' &&
      this.assignedrm?.[0]?.suggestedprop
    ) {
      this.visitPlanNextDate = this.selectedSuggestedProp?.nextdate;
      this.visitPlanNextTime = this.selectedSuggestedProp?.nexttime;
    } else if (
      this.assignedrm &&
      this.assignedrm?.[0]?.leadstage == 'Final Negotiation' &&
      this.assignedrm?.[0]?.suggestedprop
    ) {
      this.visitPlanNextDate = this.selectedSuggestedProp?.nextdate;
      this.visitPlanNextTime = this.selectedSuggestedProp?.nexttime;
    }
    setTimeout(() => {
      this.checkWeekDay();
    }, 0);
  }

  checkWeekDay() {
    let date = new Date(this.assignedrm?.[0]?.suggestedprop?.[0]?.actiondate);
    let day = date.getDay();
    let isWeekend = day === 6 || day === 0;
    if (isWeekend) {
      if (this.selectedPlanType == 'weekend') {
        if (
          this.assignedrm &&
          this.assignedrm?.[0]?.suggestedprop[0].weekplan == '2'
        ) {
          this.visitPlanDone = true;
        } else {
          this.visitPlanDone = false;
        }
      } else {
        if (this.selectedPlanType == '2') {
          this.visitPlanDone = false;
        } else {
          this.visitPlanDone = true;
        }
      }
    } else {
      if (this.selectedPlanType == 'weekdays') {
        if (
          this.assignedrm &&
          this.assignedrm?.[0]?.suggestedprop[0].weekplan == '1'
        ) {
          this.visitPlanDone = true;
        } else {
          this.visitPlanDone = false;
        }
      } else {
        if (this.selectedPlanType == '1') {
          this.visitPlanDone = false;
        } else {
          this.visitPlanDone = true;
        }
      }
    }
  }

  editvisitPlan(type) {
    if (
      this.assignedrm &&
      this.assignedrm?.[0]?.suggestedprop &&
      this.assignedrm?.[0]?.suggestedprop[0].weekplan == '2'
    ) {
      this.selectedPlanType = 'weekend';
      setTimeout(() => {
        $('#visitPlandate').val(
          this.assignedrm?.[0]?.suggestedprop[0].actiondate
        );
        $('#visitPlantime').val(
          this.assignedrm?.[0]?.suggestedprop[0].actiontime
        );
        this.visitPlandate = this.assignedrm?.[0]?.suggestedprop[0].actiondate;
        this.visitPlantime = this.assignedrm?.[0]?.suggestedprop[0].actiontime;
      }, 100);
    } else if (
      this.assignedrm &&
      this.assignedrm?.[0]?.suggestedprop &&
      this.assignedrm?.[0]?.suggestedprop[0].weekplan == '1'
    ) {
      this.selectedPlanType = 'weekdays';
      setTimeout(() => {
        $('#visitPlandate').val(
          this.assignedrm?.[0]?.suggestedprop[0].actiondate
        );
        $('#visitPlantime').val(
          this.assignedrm?.[0]?.suggestedprop[0].actiontime
        );
        this.visitPlandate = this.assignedrm?.[0]?.suggestedprop[0].actiondate;
        this.visitPlantime = this.assignedrm?.[0]?.suggestedprop[0].actiontime;
      }, 100);
    } else if (
      this.assignedrm &&
      this.assignedrm?.[0]?.suggestedprop &&
      this.assignedrm?.[0]?.suggestedprop[0].weekplan == '0'
    ) {
      this.selectedPlanType = 'ytc';
    } else if (
      this.assignedrm &&
      this.assignedrm?.[0]?.suggestedprop &&
      this.assignedrm?.[0]?.suggestedprop[0].weekplan == null
    ) {
      if (type == 'edit') {
        setTimeout(() => {
          $('#visitPlandate').val(
            this.assignedrm?.[0]?.suggestedprop[0].nextdate
          );
          $('#visitPlantime').val(
            this.assignedrm?.[0]?.suggestedprop[0].nexttime
          );
          this.visitPlandate = this.assignedrm?.[0]?.suggestedprop[0].nextdate;
          this.visitPlantime = this.assignedrm?.[0]?.suggestedprop[0].nexttime;
          // this.scriptfunctions();
        }, 100);
      }
    }
    // this.scriptfunctions();
    this.editplan = true;
  }

  confirmPlan() {
    this.confirmbtnClicked = true;
    setTimeout(() => {
      this.fixPlan();
    }, 0);
  }
  fixPlan() {
    const rawValue = $('#visitPlandate').val();

    let selectPlanid: any;
    if (this.selectedPlanType == 'weekend') {
      selectPlanid = 2;
    } else if (this.selectedPlanType == 'weekdays') {
      selectPlanid = 1;
    } else if (this.selectedPlanType == 'ytc') {
      selectPlanid = 0;
    }

    if (
      this.selectedPlanType == '' ||
      this.selectedPlanType == undefined ||
      this.selectedPlanType == null
    ) {
      Swal.fire({
        title: 'Please select the correct weekdays date',
        text: 'Select the correct date',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: true,
      });
    } else if (
      this.confirmbtnClicked == false &&
      $('#visitPlandate').val() == ''
    ) {
      $('#visitPlandate')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else if ($('#visitPlantime').val() == '') {
      $('#visitPlandate').removeAttr('style');
      $('#visitPlantime')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select The Time');
    } else if ($('#visitPlandate').val() != '') {
      let date = new Date(rawValue as string);
      let day = date.getDay();
      let isWeekend = day === 6 || day === 0;
      if (isWeekend && this.selectedPlanType != 'weekend') {
        $('#visitPlandate').removeAttr('style');
        Swal.fire({
          title: 'Please select the correct weekdays date',
          text: 'Select the correct date',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else if (!isWeekend && this.selectedPlanType != 'weekdays') {
        $('#visitPlandate').removeAttr('style');
        Swal.fire({
          title: 'Please select the correct weekend date',
          text: 'Select the correct date',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        $('#visitPlantime').removeAttr('style');
        if (this.confirmbtnClicked == true) {
          var nextdate = this.visitPlanNextDate;
          var nexttime = this.visitPlanNextTime;
        } else {
          var nextdate: any = $('#visitPlandate').val();
          var nexttime: any = $('#visitPlantime').val();
        }

        console.log(nextdate);
        console.log(nexttime);
        this.showSpinner = true;

        if (!this.isMoreThan14Days(nextdate)) {
          if (this.activestagestatus[0].stage == 'USV') {
            var param = {
              leadid: this.leadId,
              nextdate: nextdate,
              nexttime: nexttime,
              suggestproperties: this.selectedSuggestedProp?.propid,
              execid: this.userid,
              assignid: this.selectedExecId,
            };

            this._mandateService
              .addselectedsuggestedproperties(param)
              .subscribe((success) => {
                this._mandateService
                  .getselectedsuggestproperties(
                    this.leadId,
                    this.userid,
                    this.selectedExecId
                  )
                  .subscribe((selectsuggested) => {
                    this.selectedpropertylists =
                      selectsuggested['selectedlists'];
                    this.selectedlists = selectsuggested;
                    // Joining the object values as comma seperated when add the property for the history storing
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        .map((item) => {
                          return item.name;
                        })
                        .join(',');
                    // Joining the object values as comma seperated when add the property for the history storing

                    this.autoremarks =
                      'Scheduled the USV for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      nextdate +
                      ' ' +
                      nexttime;
                    var leadusvhistparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'USV',
                      stagestatus: '1',
                      textarearemarks: '',
                      userid: this.userid,
                      assignid: this.selectedExecId,
                      autoremarks: this.autoremarks,
                      property: this.selectedSuggestedProp?.propid,
                      feedbackid: this.feedbackID,
                    };
                    this._mandateService
                      .addleadhistory(leadusvhistparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            let params = {
                              execid: this.selectedExecId,
                              leadid: this.leadId,
                              planid: selectPlanid,
                              plandate: nextdate,
                              plantime: nexttime,
                              stage: this.assignedrm[0].leadstage,
                              stagestatus: this.assignedrm[0].leadstatus,
                              loginid: this.userid,
                              propid: this.selectedSuggestedProp?.propid,
                            };
                            this._mandateService
                              .updatemyplan(params)
                              .subscribe((response) => {
                                this.showSpinner = false;
                                if (response['status'] == 'True') {
                                  Swal.fire({
                                    title: 'Plan Confirmed',
                                    text: 'Visit Plan added Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    timer: 2000,
                                    showConfirmButton: false,
                                  }).then(() => {
                                    location.reload();
                                  });
                                }
                              });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  });
              });
          } else if (this.activestagestatus[0].stage == 'RSV') {
            var param1 = {
              leadid: this.leadId,
              nextdate: nextdate,
              nexttime: nexttime,
              suggestproperties: this.selectedSuggestedProp?.propid,
              execid: this.userid,
              assignid: this.selectedExecId,
            };
            this._mandateService.addrsvselected(param1).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                  var param = {
                    leadid: this.leadId,
                    execid: this.userid,
                    stage: 'RSV',
                    assignid: this.selectedExecId,
                  };

                  this._mandateService
                    .rsvselectproperties(param)
                    .subscribe((selectsuggested) => {
                      this.selectedpropertylists =
                        selectsuggested['selectedrsvlists'];
                      // Joining the object values as comma seperated when remove the property for the history storing
                      this.selectedproperty_commaseperated =
                        this.selectedpropertylists
                          .map((item) => {
                            return item.name;
                          })
                          .join(',');
                      // Joining the object values as comma seperated when remove the property for the history storing

                      this.autoremarks =
                        ' Scheduled the RSV for ' +
                        this.selectedproperty_commaseperated +
                        ' On ' +
                        nextdate +
                        ' ' +
                        nexttime;
                      var leadrsvfixparam = {
                        leadid: this.leadId,
                        closedate: nextdate,
                        closetime: nexttime,
                        leadstage: 'RSV',
                        stagestatus: '1',
                        textarearemarks: '',
                        userid: this.userid,
                        assignid: this.selectedExecId,
                        autoremarks: this.autoremarks,
                        property: this.selectedSuggestedProp?.propid,
                        feedbackid: this.feedbackID,
                      };
                      this._mandateService
                        .addleadhistory(leadrsvfixparam)
                        .subscribe(
                          (success) => {
                            if (success['status'] == 'True') {
                              let params = {
                                execid: this.selectedExecId,
                                leadid: this.leadId,
                                planid: selectPlanid,
                                plandate: nextdate,
                                plantime: nexttime,
                                stage: this.assignedrm[0].leadstage,
                                stagestatus: this.assignedrm[0].leadstatus,
                                loginid: this.userid,
                                propid: this.selectedSuggestedProp?.propid,
                              };
                              this._mandateService
                                .updatemyplan(params)
                                .subscribe((response) => {
                                  this.showSpinner = false;
                                  if (response['status'] == 'True') {
                                    Swal.fire({
                                      title: 'Plan Confirmed',
                                      text: 'Visit Plan added Successfully',
                                      icon: 'success',
                                      timer: 2000,
                                      heightAuto: false,
                                      showConfirmButton: false,
                                    }).then(() => {
                                      location.reload();
                                    });
                                  }
                                });
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    });
                }
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          } else if (this.activestagestatus[0].stage == 'Final Negotiation') {
            var param3 = {
              leadid: this.leadId,
              nextdate: nextdate,
              nexttime: nexttime,
              suggestproperties: this.selectedSuggestedProp?.propid,
              execid: this.userid,
              assignid: this.selectedExecId,
            };
            this._mandateService.addnegoselected(param3).subscribe(
              (success) => {
                this._mandateService
                  .negoselectproperties(
                    this.leadId,
                    this.userid,
                    this.selectedExecId,
                    this.feedbackID
                  )
                  .subscribe((selectsuggested) => {
                    this.selectedpropertylists =
                      selectsuggested['selectednegolists'];
                    this.selectedlists = selectsuggested;
                    // Joining the object values as comma seperated when add the property for the history storing
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        .map((item) => {
                          return item.name;
                        })
                        .join(',');
                    // Joining the object values as comma seperated when add the property for the history storing

                    this.autoremarks =
                      'Scheduled the Final Negotiation for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      nextdate +
                      ' ' +
                      nexttime;
                    var leadnegofixparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '1',
                      textarearemarks: '',
                      userid: this.userid,
                      assignid: this.selectedExecId,
                      autoremarks: this.autoremarks,
                      property: this.selectedSuggestedProp?.propid,
                      feedbackid: this.feedbackID,
                    };
                    this._mandateService
                      .addleadhistory(leadnegofixparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            let params = {
                              execid: this.selectedExecId,
                              leadid: this.leadId,
                              planid: selectPlanid,
                              plandate: nextdate,
                              plantime: nexttime,
                              stage: this.assignedrm[0].leadstage,
                              stagestatus: this.assignedrm[0].leadstatus,
                              loginid: this.userid,
                              propid: this.selectedSuggestedProp?.propid,
                            };
                            this._mandateService
                              .updatemyplan(params)
                              .subscribe((response) => {
                                this.showSpinner = false;
                                if (response['status'] == 'True') {
                                  Swal.fire({
                                    title: 'Plan Confirmed',
                                    text: 'Visit Plan added Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    timer: 2000,
                                    showConfirmButton: false,
                                  }).then(() => {
                                    location.reload();
                                  });
                                }
                              });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  });
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          }
        } else {
          Swal.fire({
            title: 'Plan Confirmation',
            text: 'You can Confirm the plan only within 14 days',
            icon: 'warning',
            heightAuto: false,
          }).then(() => {
            this.showSpinner = false;
          });
        }
      }
    }
  }
  timeError: boolean = false;
  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.visitPlandate = selectedDate.toLocaleDateString('en-CA');
  }

  validateTime(): void {
    if (this.visitPlantime) {
      const [time, modifier] = this.visitPlantime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }
      const selectedTime = new Date(
        `1970-01-01T${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:00`
      );
      const startLimit = new Date(`1970-01-01T20:00:00`);
      const endLimit = new Date(`1970-01-01T08:00:00`);
      this.timeError = selectedTime >= startLimit || selectedTime < endLimit;
    } else {
      this.timeError = false;
    }

    if (this.timeError) {
      this.visitPlantime = '';
      $('#visitPlantime').val('');
      $('#refixtime').val('');
      $('#RSVvisitedtime').val('');
      $('#subrsvnextactiontime').val('');
    }
  }
  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();

    this.cdf.detectChanges();
    return this.selectedPlanType == 'weekdays'
      ? utcDay !== 0 && utcDay !== 6
      : utcDay === 0 || utcDay === 6;
  };

  @ViewChild('closeddeal') closeddeal: any;
  @ViewChild('reSubmitLead') reSubmitLead: any;
  // to trigger modal
  async openModal(modalId, closedleadid) {
    if (closedleadid) {
      this.requestedunits = this.requestedunits.filter((id) => {
        return id.closedlead_id == closedleadid;
      });
    }
    if (modalId == 'resubmit') {
      this.reSubmitLead.present();
    } else if (modalId == 'closeddeal') {
      this.closeddeal.present();
    }
  }

  public getExstendsion(image) {
    if (
      image.endsWith('jpg') ||
      image.endsWith('jpeg') ||
      image.endsWith('png')
    ) {
      return 'jpg';
    }
    if (image.endsWith('pdf')) {
      return 'pdf';
    }
    return false;
  }
  verifyrequest(leadid, propid, execid, propname) {
    this.closepropertyname = propname;
    var param = {
      leadid: leadid,
      propid: propid,
      execid: execid,
    };
    this._mandateService.fetchrequestedvalues(param).subscribe((requested) => {
      this.requestedunits = requested?.['requestedvals']?.map(
        (request: any) => {
          // Trim the spaces from bhk
          request.bhk = request.bhk.trim();
          return request;
        }
      );
    });
  }

  onFileSelected(event: any, leadid, execid, propid) {
    let myFile = event.target.files;
    let allFilesValid = true;
    for (let i = 0; i < myFile.length; i++) {
      const file = myFile[i];
      if (file.size > 1110000) {
        allFilesValid = false;
        Swal.fire({
          title: 'File Size Exceeded',
          text: 'File Size limit is 1MB',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // input.value = '';
          this.closurefiles = [];
        });
        break;
      }
    }

    if (allFilesValid) {
      for (let i = 0; i < myFile.length; i++) {
        const file = myFile[i];
        const fileName = file.name;
        $('#customFile' + i)
          .siblings('.file-label-' + i)
          .addClass('selected')
          .html(fileName);
        // Push the file to closurefiles and read the file
        this.closurefiles.push(file);
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.uploads.push(event.target.result);
        };
        // this.uploadFile(leadid,execid,propid);
        reader.readAsDataURL(file);
      }
    }
    this.uploadFile(leadid, execid, propid);
  }
  uploadFile(leadid, execid, propid) {
    const formData = new FormData();
    formData.append('PropID', propid);
    formData.append('LeadID', leadid);
    formData.append('ExecID', localStorage.getItem('UserId'));
    formData.append('assignID', execid);
    for (var k = 0; k < this.closurefiles.length; k++) {
      formData.append('file[]', this.closurefiles[k]);
    }
    this._mandateService.uploadFile(formData).subscribe((res) => {
      if (res['status'] == 'True') {
        this._mandateService
          .getassignedrm(
            this.leadId,
            this.userid,
            this.selectedExecId,
            this.feedbackID
          )
          .subscribe((cust) => {
            this.assignedrm = cust['RMname'];
            this.leadsDetailsInfo = cust['RMname'];

            this.assignedrm = this.assignedrm.filter((exec) => {
              return exec.RMID == this.selectedExecId;
            });

            this.verifyrequest(
              this.assignedrm[0].customer_IDPK,
              this.propid,
              this.selectedExecId,
              this.assignedrm[0].suggestedprop[0].name
            );
          });
        this.uploads = [];
        this.closurefiles = [];
      }
    });
  }
  removeImage(file) {
    this._mandateService
      .removeUploadedImage(file.files_IDPK, file.file_name, file.lead_IDFK)
      .subscribe(() => {
        this.requestedunits?.forEach((element) => {
          element.images = element.images.filter((ele) => {
            return !(ele.file_name == file.file_name);
          });
        });
        this.closurefiles = [];
      });
  }

  requestrejection(leadid, execid, propid) {
    if (this.requestedunits[0].images.length == 0) {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else if ($('.rejectedtextarea').val() == '') {
      $('.rejectedtextarea')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please add the reason for rejection');
    } else if (!/^(?!\s*$).+$/g.test(String($('.rejectedtextarea').val()))) {
      $('.rejectedtextarea')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please add the reason for rejection');
    } else {
      $('.rejectedtextarea').removeAttr('style');
      var remarkscontent = $('.rejectedtextarea').val();
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        statusid: '2',
        remarks: remarkscontent,
        assignid: execid,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._mandateService
          .closingrequestresponse(param)
          .subscribe((requestresponse) => {
            if (requestresponse['status'] == 'True-1') {
              Swal.fire({
                title: 'Request Rejected',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK!',
              }).then((result) => {
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
              });
              this.ngOnInit();
            } else {
              Swal.fire({
                title: 'Some Error Occured',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'OK!',
              }).then((result) => {
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
              });
            }
          });
      }
    }
  }

  requestapproval(leadid, execid, propid) {
    // this.verifyrequest(leadid, propid, this.selectedExecId, this.selectedSuggestedProp.name);

    if (this.requestedunits[0].images.length == 0) {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        allowOutsideClick: false,
        confirmButtonText: 'ok',
      });
    } else {
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        statusid: '1',
        remarks: 'No Comments',
        assignid: this.selectedExecId,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._mandateService
          .closingrequestresponse(param)
          .subscribe((requestresponse) => {
            if (requestresponse['status'] == 'True-0') {
              this.autoremarks = ' Send the Deal Closing Request successfully.';
              var leadhistparam = {
                leadid: leadid,
                closedate: this.requestedunits[0].closed_date,
                closetime: this.requestedunits[0].closed_time,
                textarearemarks: 'Deal closed Request Approved',
                leadstage: 'Lead Closed',
                stagestatus: '0',
                userid: this.userid,
                assignid: this.selectedExecId,
                property: propid,
                autoremarks: this.autoremarks,
                feedbackid: this.feedbackID,
              };
              this._mandateService.addleadhistory(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Request Approved Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                    }).then(() => {
                      this.showRejectionForm = false;
                      this.showSpinner = false;
                      const currentParams =
                        this.activeroute.snapshot.queryParams;
                      this.router.navigate([], {
                        relativeTo: this.activeroute,
                        queryParams: {
                          ...currentParams,
                          stageForm: 'onleadStatus',
                        },
                        queryParamsHandling: 'merge',
                      });
                      this.ngOnInit();
                    });
                  } else if (success['status'] == 'Duplicate Request') {
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      allowOutsideClick: false,
                      showConfirmButton: false,
                    }).then(() => {
                      const currentParams =
                        this.activeroute.snapshot.queryParams;
                      this.router.navigate([], {
                        relativeTo: this.activeroute,
                        queryParams: {
                          ...currentParams,
                          stageForm: 'onleadStatus',
                        },
                        queryParamsHandling: 'merge',
                      });
                      this.ngOnInit();
                    });
                  }
                },
                (err) => {
                  console.log('Failed to Update');
                }
              );
            } else {
              Swal.fire({
                title: 'Some Error Occured',
                icon: 'error',
                heightAuto: false,
                timer: 2000,
                allowOutsideClick: false,
                showConfirmButton: false,
              }).then(() => {
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
              });
            }
          });
      }
    }
  }

  // method to update data for booking form
  resubmitdata(leadid, execid, propid, i) {
    var bhk = $('#unit').val();
    var bhkunit = $('#unit_number').val();
    var dimension = $('#dimension').val();
    var ratepersqft = $('#rate_per_sqft').val();

    if ($('#unit').val() == '') {
      $('#unit')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Unit Size');
    } else if ($('#unit_number').val() == '') {
      $('#unit_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the unit number');
    } else if ($('#dimension').val() == '') {
      $('#dimension')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Dimension');
    } else if ($('#rate_per_sqft').val() == '') {
      $('#rate_per_sqft')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Rate Per Squarefeet');
    } else if (this.requestedunits[0].images.length == 0) {
      $('#remarks-' + i).removeAttr('style');
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        bhk: bhk,
        bhkunit: bhkunit,
        dimension: dimension,
        ratepersqft: ratepersqft,
        assignid: this.selectedExecId,
      };
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._mandateService
          .requestresubmition(param)
          .subscribe((requestsubmition) => {
            if (requestsubmition['status'] == 'True') {
              Swal.fire({
                title: 'Resubmited Successfully',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK!',
              }).then((result) => {
                // window.location.reload();
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
                this.ngOnInit();
              });
            } else {
              Swal.fire({
                title: 'Some Error Occured',
                icon: 'error',
                timer: 2000,
                heightAuto: false,
                showConfirmButton: false,
              }).then(() => {
                // window.location.reload();
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
                this.ngOnInit();
              });
            }
          });
      }
    }
  }
  // Modal animation
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  //here the we can revert the lead that is pushed to junk
  revertStage() {
    Swal.fire({
      title: `Do you want to Revert the lead for ${this.assignedrm[0].customer_assign_name}`,
      icon: 'question',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        let param = {
          leadid: this.leadId,
          propid: this.selectedSuggestedProp?.propid,
          executid: this.selectedExecId,
        };
        this._mandateService
          .revertBackToPreStage(param)
          .subscribe((resposne) => {
            if (resposne['status'] == 'True') {
              this.getstages();
              location.reload();
            }
          });
      }
    });
  }

  unblockleadModalDismiss() {
    this.visitAssigModalDismiss = true;
    this.unlockleadtomandateModal.dismiss();
    this.router.navigate(['assigned-leads-detail']);
  }

  //here we get the fixed property names.
  getFixedProperties() {
    let param = {
      leadid: this.leadId,
      execid: this.selectedExecId,
      loginid: this.userid,
    };
    this._mandateService.getFixedMandateProperties(param).subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.fixedPropertiesList = resp['result'];
      } else {
        this.fixedPropertiesList = [];
      }
    });
  }

  presentVisit_AssignPopover(event) {
    this.mandatepropertyfetch();
    this.assignteam = 'mandate';
    this.assigntype = 'visit';
    this.visitAssignModal.present();
  }

  visitAssign() {
    let dbclinet = '';
    if (this.selectedMandatePropId == '28773') {
      dbclinet = '1';
    }

    console.log(this.selectedEXEC);
    if (!this.selectedEXEC) {
      Swal.fire({
        title: 'Please Select The Executive!',
        text: 'Please try agin',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      }).then((result) => {});
      $('#rm_dropdown')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select the Executives');
    } else {
      let param = {
        leadid: this.leadId,
        propid: this.propid,
        loginid: this.userid,
        fromexecutives: this.userid,
        toexecutives: this.selectedEXEC.id,
        crmtype: '1',
        dbclinet: dbclinet,
      };
      this._mandateService.visitAssign(param).subscribe((resp) => {
        if (resp['status'] == 'True') {
          Swal.fire({
            title: 'Visit Assigned Successfully',
            icon: 'success',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.selectedExecIds = [];
            this.selectedMandatePropId = '';
            this.selectedMandateTeam = '';
            location.reload();
          });
        } else {
          Swal.fire({
            title: 'Authentication Failed!',
            text: 'Please try agin',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  }

  accessNow() {
    // this.isAccompanyBy = false;
    let accompapiedData = this.leadsDetailsInfo.filter(
      (exec) => exec.RMID == this.assignedrm[0].visitaccompaniedid
    );
    this.router.navigate([], {
      queryParams: {
        execid: accompapiedData[0].RMID,
      },
      queryParamsHandling: 'merge',
    });
  }

  editNow(leadId, execid, propid, closeid) {
    if ($('#unit').val() == '') {
      Swal.fire({
        title: 'Units Not Selected',
        text: 'Select any Unit for ',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
      // return false;
    } else if (String($('#unit_number').val()).trim() == '') {
      $('#unit_number').val('');
      $('#unit_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Unit Number');
      // return false;
    } else if (
      String($('#dimension').val()).trim() == '' ||
      !/^[0-9]+$/.test(String($('#dimension').val()))
    ) {
      $('#dimension').val('');
      $('#dimension')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Dimension');
      // return false;
    } else if (
      String($('#rate_per_sqft').val()).trim() == '' ||
      !/^[0-9]+$/.test(String($('#rate_per_sqft').val()))
    ) {
      $('#rate_per_sqft').val('');
      $('#rate_per_sqft')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Rate Per Squarefeet');
      // return false;
    } else if ($('#customFile').val() == '') {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file for ',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
      // return false;
    } else {
      $('#unit_number').removeAttr('style');
      $('#dimension').removeAttr('style');
      $('#rate_per_sqft').removeAttr('style');

      var unitsselected = $('#unit').val();
      var unitnumbers = $('#unit_number').val();
      var dimensions = $('#dimension').val();
      var rpsft = $('#rate_per_sqft').val();

      var closedate = this.requestedunits[0].closed_date;
      var closetime = this.requestedunits[0].closed_time;
      var textarearemarks = this.requestedunits[0].suggested[0].remarks;
      this.autoremarks = 'The Deal Closed has been edited successfully.';
      var leadhistparam = {
        leadid: this.leadId,
        closedate: closedate,
        closetime: closetime,
        leadstage: 'Edit Closed Lead',
        stagestatus: '0',
        textarearemarks: textarearemarks,
        userid: this.userid,
        assignid: this.selectedExecId,
        property: propid,
        bhk: unitsselected,
        bhkunit: unitnumbers,
        dimension: dimensions,
        ratepersft: rpsft,
        autoremarks: this.autoremarks,
        closedleadID: closeid,
        feedbackid: this.feedbackID,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._mandateService.addleadhistory(leadhistparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              Swal.fire({
                title:
                  this.activestagestatus?.[0]?.stage === 'Deal Closed'
                    ? 'Updated Successfully'
                    : ' Deal Closed Successfully',
                icon: 'success',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                // window.location.reload();
                const currentParams = this.activeroute.snapshot.queryParams;
                this.router.navigate([], {
                  relativeTo: this.activeroute,
                  queryParams: {
                    ...currentParams,
                    stageForm: 'onleadStatus',
                  },
                  queryParamsHandling: 'merge',
                });
              });
            } else if (success['status'] == 'Duplicate Request') {
              Swal.fire({
                title: 'Already got the request for this same Unit number',
                icon: 'error',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                window.location.reload();
              });
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    }
  }

  onProperty(propid) {
    // if (
    //   this.activestagestatus?.[0]?.stage == 'Deal Closing Requested' ||
    //   this.activestagestatus?.[0]?.stage == 'Closing Request Rejected' ||
    //   this.activestagestatus?.[0]?.stage == 'Deal Closing Pending' ||
    //   this.activestagestatus?.[0]?.stage == 'Deal Closed'
    // ) {
    //   alert('if');
    //   this.router.navigate([], {
    //     queryParams: {
    //       propid: propid,
    //       stageForm: 'onleadStatus',
    //     },
    //     queryParamsHandling: 'merge',
    //   });
    // } else {
    this.router.navigate([], {
      queryParams: {
        propid: propid,
        stageForm:
          !this.isEditFixedPlan && !this.isActivityHistory
            ? 'onleadStatus'
            : '',
      },
      queryParamsHandling: 'merge',
    });
    // }
  }

  onCallLeadHistory(isCall: any) {
    this.router.navigate([], {
      queryParams: {
        isCallHistory: isCall,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  reassignedResponseInfo;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  // enableAccess() {
  //   console.log(this.assignedrm);
  //   let param = {
  //     LeadID: this.assignedrm[0].customer_IDPK,
  //     rmID: this.assignedrm[0].RMID,
  //     propID: this.assignedrm[0].propid,
  //     loginId: this.userid,
  //     fromExecids: this.assignedrm[0].RMID,
  //   };
  //   this._mandateService.leadreassign(param).subscribe({
  //     next: (success) => {
  //       this.showSpinner = false;
  //       if (success['status'] == 'True') {
  //         this.reassignedResponseInfo = success['assignedleads'];
  //         Swal.fire({
  //           title: 'Access Enabled Successfully',
  //           icon: 'success',
  //           heightAuto: false,
  //           confirmButtonText: 'Show Details',
  //         }).then(() => {
  //           this.viewAssignLeadDetail.present();
  //         });
  //       } else {
  //         Swal.fire({
  //           title: 'Authentication Failed!',
  //           text: 'Please try again',
  //           icon: 'error',
  //           heightAuto: false,
  //           confirmButtonText: 'OK',
  //         });
  //       }
  //     },
  //     error: () => {
  //       console.log('Connection Failed');
  //     },
  //   });
  // }

  enableAccess() {
    const params = {
      leadid: this.assignedrm[0].customer_IDPK,
      execid: this.selectedExecId,
      propid: this.propid,
    };
    this._mandateService.givevisitaccess(params).subscribe((resp) => {
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Access Enabled Successfully',
          text: 'Lead Access reverted Successfully',
          icon: 'success',
          timer: 2000,
          heightAuto: false,
          showConfirmButton: false,
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire({
          title: 'Some Error Occured',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }

  @ViewChild('callConfirmationModal') callConfirmationModal;
  callStatus;
  onCallLeadData;
  headerType;
  outboundCall() {
    this.showSpinner = true;
    const cleanedNumber =
      this.show_cnt?.customer_number.startsWith('91') &&
      this.show_cnt?.customer_number.length > 10
        ? this.show_cnt?.customer_number.slice(2)
        : this.show_cnt?.customer_number;

    const param = {
      execid: this.localStorage.getItem('UserId'),
      callto: cleanedNumber,
      leadid: this.show_cnt.customer_IDPK,
      starttime: this.getCurrentDateTime(),
      modeofcall: 'mobile-' + 'mandate',
      leadtype: 'mandate',
      assignee: this.selectedExecId,
    };
    this._sharedservice.outboundCall(param).subscribe(() => {
      this.showSpinner = false;
      this.getLiveCallsData(this.show_cnt.customer_IDPK);
      this.callConfirmationModal.dismiss();
    });
  }

  getLiveCallsData(leadId) {
    this._sharedservice
      .fetchLiveCall(localStorage.getItem('UserId'))
      .subscribe({
        next: (response) => {
          if (response['status'] == 'success') {
            this.callStatus =
              leadId == response['success'][0].Lead_IDFK
                ? response['success'][0].dialstatus
                : '';
            this.onCallLeadData = response['success'][0];
            this.startTimer(response.success[0].starttime);
            if (
              leadId != response['success'][0].Lead_IDFK &&
              this.router.url.includes('mandate-customers')
            ) {
              Swal.fire({
                title: 'Call Details',
                text: 'You’re already on a call with another client',
                icon: 'warning',
                heightAuto: false,
                allowOutsideClick: false,
                confirmButtonText: 'Go to client details page',
              }).then((result) => {
                if (result.isConfirmed) {
                  this._sharedservice.isMenuOpen = false;
                  this.onCallDetails();
                } else {
                }
              });
            }
            this._sharedservice.isMenuOpen = false;
          } else {
            this._sharedservice.isMenuOpen = true;
          }

          if (
            this.onCallLeadData?.modeofcall == 'Desktop-mandate' ||
            this.onCallLeadData?.modeofcall == 'mobile-mandate' ||
            this.onCallLeadData?.modeofcall == 'Mobile-Mandate' ||
            this.onCallLeadData?.modeofcall == 'Mobile-mandate'
          ) {
            this.headerType = 'mandate';
          } else if (
            this.onCallLeadData?.modeofcall == 'Desktop-retail' ||
            this.onCallLeadData?.modeofcall == 'mobile-retail' ||
            this.onCallLeadData?.modeofcall == 'Mobile-Retail' ||
            this.onCallLeadData?.modeofcall == 'Mobile-retail'
          ) {
            this.headerType = 'retail';
          }
        },
        error: () => {
          this.showSpinner = false;
        },
      });
  }

  onCallDetails() {
    setTimeout(() => {
      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: true,
          leadId: this.onCallLeadData.Lead_IDFK,
          execid: this.onCallLeadData.assignee,
          leadTabData: 'status',
          headerType: this.headerType,
        },
        queryParamsHandling: 'merge',
      });
    }, 500);
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

  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];
  selectedExecutiveName;
  selectedExecTeam;
  onExecTeamSelect(event) {
    console.log(event);
    this.showSpinner = true;
    this.selectedExecutiveName = [];

    this._mandateService
      .fetchmandateexecutives(this.selectedMandatePropId, '', event.value.code)
      .subscribe((response) => {
        this.selectedExecIds = [];
        this.mandateExecutives = response['mandateexecutives'];
        this.mandateExecutives = this.mandateExecutives.filter((executive) => {
          return !this.leadsDetailsInfo.some(
            (rmids) => rmids.RMID == executive.id
          );
        });
        this.showSpinner = false;
      });
  }
  onWillDismiss(event) {
    location.reload();
  }

  getItemsCountForDate(index: number): number {
    let count = 0;

    // go backward to find the date header
    let dateIndex = index;
    while (
      dateIndex >= 0 &&
      this.leadtrack[dateIndex].item_type !== 'message_date'
    ) {
      dateIndex--;
    }

    // count items until next date header
    for (let i = dateIndex + 1; i < this.leadtrack.length; i++) {
      if (this.leadtrack[i].item_type === 'message_date') {
        break;
      }
      count++;
    }

    return count;
  }
  isLastItemUnderDate(index: number): boolean {
    // next item is either date header or end of array
    return (
      index + 1 === this.leadtrack.length ||
      this.leadtrack[index + 1].item_type === 'message_date'
    );
  }

  // to open suggested property modal
  displaySuggProperty() {
    const param = {
      leadid: this.leadId,
      execid: this.selectedExecId,
      feedback: this.feedbackID,
      loginid: localStorage.getItem('UserId'),
    };
    this._mandateService.getPropertylist(param).subscribe((res) => {
      this.properties = res['Properties'];
    });
    // this.getProperty();
    this.suggestedproperties = [];
    this.suggModal.present();
  }
  onSelectSuggProp(item) {
    this.suggestedproperties.push(item.id);
  }

  deSelectSuggProp(item) {
    this.suggestedproperties = this.suggestedproperties.filter((id) => {
      return id != item.id;
    });
  }

  addpropertiestolist() {
    let param = {
      LeadID: this.leadId,
      Stage: this.activestagestatus?.[0].stage,
      Execid: this.userid,
      assignID: this.selectedExecId,
      PropertyID: this.suggestedproperties,
    };
    this._mandateService.addsuggestedproperties(param).subscribe((success) => {
      if (success['status'] == 'True') {
        Swal.fire({
          title: 'Suggested Successfully Added',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK!',
        }).then((result) => {
          this.getAssignedRM();
          this.suggModal.dismiss();
          // this._retailservice.isCloseSuggModal = true;
        });
      }
    });
  }

  getAssignedRM() {
    this._mandateService
      .getassignedrm(
        this.leadId,
        this.userid,
        this.selectedExecId,
        this.feedbackID,
        localStorage.getItem('RoleType') == '1'
          ? localStorage.getItem('UserId')
          : ''
      )
      .subscribe((cust) => {
        if (
          cust.lead == '1' &&
          this.selectedExecId == this.userid &&
          (localStorage.getItem('Role') === '50003' ||
            localStorage.getItem('Role') === '50004')
        ) {
          this.confirmLeadConversionToMandate();
        }

        this.assignedrm = cust['RMname'];
        this.leadsDetailsInfo = cust['RMname'];

        // this.usvstagedetection = cust['RMname'][0].leadstage;
        // this.usvstagestatusdetection = cust['RMname'][0].leadstatus;
        this.assignedrm = this.assignedrm.filter((exec) => {
          return exec.RMID == this.selectedExecId;
        });

        if (this.assignedrm) {
          if (
            this.assignedrm.length > 0 &&
            this.assignedrm?.[0]?.rnrcount >= 5 &&
            this.roleid != '1' &&
            this.roleid != '2'
          ) {
            Swal.fire({
              text: 'Access Denied , Do contact the Admin',
              icon: 'error',
              heightAuto: false,
            }).then(() => {
              this.router.navigate(['mandate-lead-stages'], {
                queryParams: {
                  status: 'inactive',
                  type: 'Inactive',
                  isDropDown: 'false',
                  followup: '2',
                },
              });
            });
          }
        }

        setTimeout(() => {
          // this.isAccompanyBy = false;
          if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              (this.assignedrm.roleid == '50003' ||
                this.assignedrm.roleid == '50004')) ||
              this.role_type != '1') &&
            this.feedbackID != '1'
          ) {
            $('.updateActivities').removeClass('active');
            $('.allActivities').removeClass('active');
            setTimeout(() => {
              const tab = document.getElementById('allActivitiesTab');
              if (tab) {
                tab.click();
              }
            }, 100);
          } else if (
            this.userid == this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            this.role_type == '1' &&
            this.assignedrm.roleid != '50003' &&
            this.assignedrm.roleid != '50004' &&
            this.feedbackID != '1'
          ) {
            if (
              this.assignedrm &&
              this.assignedrm?.[0]?.visitaccompaniedid &&
              this.assignedrm?.[0]?.visitaccompaniedid !=
                this.assignedrm?.[0]?.RMID
            ) {
              // this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          } else if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              this.assignedrm.roleid != '50003' &&
              this.assignedrm.roleid != '50004') ||
              this.role_type != '1') &&
            this.feedbackID != '1'
          ) {
            if (
              (this.assignedrm &&
                this.assignedrm?.[0]?.visitaccompaniedid &&
                this.assignedrm?.[0]?.visitaccompaniedid !=
                  this.assignedrm?.[0]?.RMID) ||
              this.role_type == '1'
            ) {
              // this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          }
        }, 1000);

        if (this.assignedrm?.[0]?.suggestedprop?.length > 1) {
          // this.isSuggestedPropBoolean = false;
          let propertyData, propIndex;
          this.assignedrm?.[0]?.suggestedprop.forEach((prop, index) => {
            propertyData = prop;
            propIndex = index;
          });
        } else {
        }

        if (this.assignedrm && this.assignedrm?.[0]?.suggestedprop) {
          this.visitpanelselection = this.assignedrm?.[0]?.suggestedprop.filter(
            (prop) => {
              return !(prop.weekplan == null);
            }
          );
          if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '1'
          ) {
            this.selectedPlanType = 'weekdays';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '2'
          ) {
            this.selectedPlanType = 'weekend';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '0'
          ) {
            this.selectedPlanType = 'ytc';
          }
        }

        setTimeout(() => {
          this.selectedplan(this.selectedPlanType);
        }, 100);

        if (
          (this.selectedSuggestedProp &&
            this.selectedSuggestedProp?.actions == '7' &&
            this.selectedSuggestedProp?.currentstage == '5') ||
          (this.selectedSuggestedProp?.actions == '8' &&
            this.selectedSuggestedProp?.currentstage == '5') ||
          (this.selectedSuggestedProp?.actions == '6' &&
            this.selectedSuggestedProp?.currentstage == '5')
        ) {
          this.showRejectionForm = true;
          this.verifyrequest(
            this.assignedrm?.[0]?.customer_IDPK,
            this.selectedSuggestedProp?.propid,
            this.assignedrm?.[0]?.RMID,
            this.selectedSuggestedProp?.name
          );
        }
      });
  }

  revertToActive(exec) {
    Swal.fire({
      title: 'Convert Lead to Active?',
      text: 'Are you sure you want to change this lead from inactive to active status?',
      icon: 'info',
      cancelButtonText: 'NO',
      confirmButtonText: 'OK',
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value == true) {
        this.showSpinner = true;
        let param = {
          execid: exec.RMID,
          leadid: exec.customer_IDPK,
        };

        this._mandateService.revertBackToActive(param).subscribe((resp) => {
          this.showSpinner = false;
          if (resp['status'] == 'True') {
            location.reload();
          }
        });
      }
    });
  }
  onBack() {
    this._location.back();
  }
  isLeadAssign = false;
  @ViewChild('retailMandate') retailMandate;
  onAssign_btn(lead_visits) {
    lead_visits == 'leads' ? '' : this.getExecutive();
    this.isLeadAssign = lead_visits == 'leads' ? true : false;
    this.mandatepropertyfetch();
    this.retailMandate.present();
  }

  isMoreThan14Days(selectedDateStr: string) {
    const today = new Date();
    const selectedDate = new Date(selectedDateStr);

    // Remove time part (VERY IMPORTANT)
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    console.log('Days Difference:', diffDays);

    if (diffDays > 14) {
      console.log('More than 14 days');
    } else {
      console.log('Within 14 days');
    }

    return diffDays > 14;
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
        this._sharedservice
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
      },
      queryParamsHandling: 'merge',
    });
  }
  timer: string = '00h:00m:00s';
  private intervalId: any;
  isAfterOneminute;
  isAfterTwominute = false;
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
        (this.callStatus == 'CONNECTING' || this.callStatus == 'Call Connected')
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
}
