import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/realEstate/shared.service';
import {
  IonContent,
  IonModal,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-cp-lead-details',
  templateUrl: './cp-lead-details.component.html',
  styleUrls: ['./cp-lead-details.component.scss'],
})
export class CpLeadDetailsComponent implements OnInit {
  @ViewChild('mergeModal') mergeModal;
  @ViewChild('suggModal', { static: true }) suggModal: IonModal;
  @ViewChild('scrollContent', { static: false }) scrollContent!: IonContent;
  @ViewChild('viewToMergedLeads') viewToMergedLeads;
  refreshFlag = false;
  leadSearchTerm;
  filteredLeads = [];
  selectedLeadP;
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
  mergedleads: any = [];
  leadtrack: any;
  addCategoryForm!: FormGroup;
  isCrmTypeSelection = false;
  showSpinner = false;
  selectedExecId: any;
  leadid: any;
  categoryid: any;
  customerView: any;
  stageForm = '';
  isEditProDetails = false;
  isActivityHistory = false;
  mergeLeadDetails: any[];
  assignedrm: any;
  leadsDetailsInfo: any;
  adminview: boolean;
  execview: boolean;
  properties: any;
  dropdownSettings: {};
  suggestedproperties: any[];
  userid: string;
  feedbackID = 0;
  activestagestatus: any;

  USV = true;
  SV = true;
  RSV = true;
  FOLLOWUP = true;
  JUNK = true;
  Negotiation = true;
  leadclose = true;
  aftervisit = true;
  filterLoader: boolean = true;
  rescheduledUsv = true;
  rescheduledrsv = true;
  rescheduledfn = true;
  leadMoveJunkExec: boolean = true;
  roleid;

  followupform = false;
  junkform = false;
  commonformbtn = false;
  followupformbtn = false;
  junkformbtn = false;
  followform = false;
  f2fform = false;
  usvform = false;
  svform = false;
  rsvform = false;
  finalnegoform = false;
  leadclosedform = false;
  selectedBtn: any;
  canScroll: boolean;
  selectedSuggestedProp: any;

  getName;
  getMail;
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

  villaSizes = [
    { id: '3', size: '3 BHK' },
    { id: '3.5', size: '3.5 BHK' },
    { id: '4', size: '4 BHK' },
    { id: '4.5', size: '4.5 BHK' },
    { id: '5', size: '5 BHK' },
    { id: '5.5', size: '5.5 BHK' },
  ];

  sizeOptionsMap: any = {
    '1': [
      // Apartment
      { id: '1', size: '1 BHK' },
      { id: '2', size: '2 BHK' },
      { id: '3', size: '3 BHK' },
      { id: '4', size: '4 BHK' },
      { id: '5', size: '5 BHK' },
    ],
    '2': this.villaSizes, // Villa
    '4': this.villaSizes, // Villament (same reference)
  };
  size_array: any[] = [];

  budget_array = ['1.5Cr - 2Cr', '2Cr - 3Cr', '3Cr - 4Cr', '> 4Cr'];
  locality: any;
  subscription: import('rxjs').Subscription;
  closestObject: any;

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private popoverController: PopoverController,
    private menuCtrl: MenuController,
    public _location: Location
  ) {}

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      allowSearchFilter: true,
    };

    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      category: [[], Validators.required],
    });
    this.subscription = this.activeroute.queryParams.subscribe((params) => {
      this.showSpinner = true;
      this.selectedExecId = params['execid'];
      this.leadid = params['leadid'];
      this.categoryid = params['categoryid'];
      this.stageForm = params['stageForm'] || '';

      this.roleid = localStorage.getItem('Role');
      this.userid = localStorage.getItem('UserId');
      if (localStorage.getItem('Role') == '1') {
        this.adminview = true;
        this.execview = false;
      } else {
        this.adminview = false;
        this.execview = true;
      }
      this.getcustomeredit(this.leadid);
      this.triggerhistory();
      this.getLocalityList();
    });
  }

  getLocalityList() {
    this.api.localitylist().subscribe((resp) => {
      this.locality = resp['Localities'];
    });
  }
  getcustomeredit(leadid) {
    this.api.getcustomeredit(leadid).subscribe((resp) => {
      this.customerView = resp['Customerview']?.[0];
      this.mergedleads = resp['Customerview'][0]?.mergedleads;
      this.getName = this.customerView?.enquiry_name
        ? this.customerView.enquiry_name
        : this.customerView.customer_name;
      this.getMail = this.customerView.enquiry_mail
        ? this.customerView.enquiry_mail
        : this.customerView.customer_mail;
      this.onPropertyTypeChange(this.customerView.enquiry_proptype);

      if (
        resp['Customerview']?.[0].listing_category &&
        resp['Customerview']?.[0].listing_category.length > 0
      ) {
        this.isCrmTypeSelection = false;
      } else {
        this.isCrmTypeSelection = true;
      }

      if (resp['Customerview']?.[0].latestaction) {
        this.closestObject = resp['Customerview']?.[0].latestaction;
      }

      if (
        this.categoryid == '' ||
        this.categoryid == null ||
        this.categoryid == undefined
      ) {
        this.categoryid = resp['Customerview'][0]?.listing_category['0'].id;
      }
      this.getAssignedRM();
      this.getstages();
    });
  }
  getAssignedRM() {
    this.api
      .getassignedrmretail(this.leadid, this.userid, 0, this.categoryid)
      .subscribe((resp) => {
        this.leadsDetailsInfo = resp['RMname'];
        this.assignedrm = resp['RMname'].filter((exec) => {
          return exec.RMID == this.selectedExecId;
        });

        this.selectedSuggestedProp = this.assignedrm?.[0]?.suggestedprop;

        console.log(this.selectedSuggestedProp);

        console.log(resp);
      });
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

  // to open suggested property modal
  displaySuggProperty() {
    const param = {
      leadid: this.leadid,
      execid: this.selectedExecId,
      feedback: 0,
      loginid: localStorage.getItem('UserId'),
    };
    this.api.propertylist(param).subscribe((res) => {
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
      leadid: this.leadid,
      stage: 'Common Area',
      execid: this.userid,
      assignid: this.selectedExecId,
      suggestproperties: this.suggestedproperties,
      categoryid: this.categoryid,
    };

    this.api.addsuggestedproperties(param).subscribe((success) => {
      if (success['status'] == 'True') {
        Swal.fire({
          title: 'Suggested Successfully Added',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK!',
        }).then((result) => {
          this.getAssignedRM();
          this.refreshFlag = !this.refreshFlag;
          this.suggModal.dismiss();
        });
      }
    });
  }

  actionChange(val) {
    $('#sectionselector').val('');
    if (val == 'Follow Up') {
      this.followform = true;
      this.followupform = true;
      this.followupformbtn = true;
      this.f2fform = false;
      this.usvform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.commonformbtn = false;
      $('#customer_phase4').val('Follow Up');
      $('#sectionselector').val('Follow Up');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'USV') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.usvform = true;
      this.f2fform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'rescheduled';
      $('#customer_phase4').val('USV');
      $('#sectionselector').val('USV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'USVUpdate') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.usvform = true;
      this.f2fform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'updatevisit';
      $('#customer_phase4').val('USV');
      $('#sectionselector').val('USV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'SV') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.svform = true;
      this.usvform = false;
      this.f2fform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('SV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'RSV') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.rsvform = true;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'rescheduled';
      $('#customer_phase4').val('RSV');
      $('#sectionselector').val('RSV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'RSVUpdate') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.rsvform = true;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'updatevisit';
      $('#customer_phase4').val('RSV');
      $('#sectionselector').val('RSV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Final Negotiation') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.finalnegoform = true;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'rescheduled';
      $('#customer_phase4').val('Final Negotiation');
      $('#sectionselector').val('Final Negotiation');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'FNUpdate') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.finalnegoform = true;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.selectedBtn = 'updatevisit';
      $('#customer_phase4').val('Final Negotiation');
      $('#sectionselector').val('Final Negotiation');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Lead Closed') {
      this.leadclosedform = true;
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.finalnegoform = false;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('Lead Closed');
      $('#sectionselector').val('Lead Closed');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Move to Junk') {
      this.junkform = true;
      this.junkformbtn = true;
      this.finalnegoform = false;
      this.f2fform = false;
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.commonformbtn = false;
      this.leadclosedform = false;
      $('#customer_phase4').val('Move to Junk');
      $('#sectionselector').val('Move to Junk');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else {
      this.followupform = false;
      this.junkform = false;
      this.commonformbtn = true;
      this.followupformbtn = false;
      this.junkformbtn = false;
    }
    this.router.navigate([], {
      queryParams: {
        stageForm: val,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  getstages() {
    this.api
      .getactiveleadsstatus(
        this.leadid,
        this.userid,
        this.selectedExecId,
        this.feedbackID,
        this.categoryid
      )
      .subscribe((stagestatus) => {
        this.showSpinner = false;
        if (stagestatus['status'] == 'True') {
          this.activestagestatus = stagestatus['activeleadsstatus'];
          if (
            this.activestagestatus[0].stage == 'Lead Closed' ||
            this.activestagestatus[0].stage == 'Move to Junk'
          ) {
            this.USV = false;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (
            this.activestagestatus[0].stage == 'Fresh' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.USV = true;
            this.FOLLOWUP = true;
            this.JUNK = true;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = true;
            this.SV = false;
            this.RSV = false;
            this.rescheduledUsv = true;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.aftervisit = false;
          } else if (
            this.activestagestatus[0].stage == 'USV' &&
            this.activestagestatus[0].stagestatus == '3'
          ) {
            this.USV = false;
            this.SV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
            // this.svform = true;
          } else if (
            (this.activestagestatus[0].stage == 'SV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'SV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'SV' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = false;
            this.SV = true; //
            this.RSV = false; //
            this.Negotiation = false; //
            this.leadclose = false; //
            this.rescheduledUsv = false;
            this.rescheduledrsv = true;
            this.rescheduledfn = false;
            // this.aftervisit = false;
          } else if (
            this.activestagestatus[0].stage == 'SV' &&
            this.activestagestatus[0].stagestatus == '3'
          ) {
            this.USV = false;
            this.SV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = false;
            this.SV = false; //;
            this.RSV = true;
            this.Negotiation = false; //;
            this.leadclose = false; //;
            this.rescheduledUsv = false;
            this.rescheduledrsv = true;
            this.rescheduledfn = false;
            // this.SV = false;
            // this.Negotiation = false;
            // this.leadclose = false;
          } else if (
            this.activestagestatus[0].stage == 'RSV' &&
            this.activestagestatus[0].stagestatus == '3'
          ) {
            this.USV = false;
            this.SV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '4')
          ) {
            this.USV = false;
            this.SV = false; //
            this.RSV = false; //
            this.Negotiation = true;
            this.leadclose = false; //
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = true;
            // this.SV = false;
            // this.RSV = false;
            // this.leadclose = false;
          } else if (
            this.activestagestatus[0].stage == 'Final Negotiation' &&
            this.activestagestatus[0].stagestatus == '3'
          ) {
            this.USV = false;
            this.SV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (this.activestagestatus[0].stage == 'Fresh') {
            this.USV = true;
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.aftervisit = false;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          } else if (this.activestagestatus[0].stage == 'Deal Closed') {
            if (this.roleid == '1') {
              this.USV = false;
              this.SV = false;
              this.RSV = true;
              this.Negotiation = true;
              this.leadclose = true;
              this.rescheduledUsv = false;
              this.rescheduledrsv = false;
              this.rescheduledfn = false;
            } else {
              this.USV = false;
              this.SV = false;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.FOLLOWUP = false;
              this.JUNK = false;
              this.rescheduledUsv = false;
              this.rescheduledrsv = false;
              this.rescheduledfn = false;
            }
          } else if (this.activestagestatus[0].stage == 'Junk') {
            if (this.roleid == 1) {
              this.USV = false;
              this.SV = false;
              this.RSV = true;
              this.Negotiation = true;
              this.leadclose = true;
              this.FOLLOWUP = true;
              this.JUNK = true;
              this.leadMoveJunkExec = true;
              this.rescheduledUsv = false;
              this.rescheduledrsv = false;
              this.rescheduledfn = false;
            } else if (this.roleid != '1') {
              this.FOLLOWUP = false;
              this.JUNK = false;
              this.USV = false;
              this.SV = false;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.leadMoveJunkExec = false;
              this.rescheduledUsv = false;
              this.rescheduledrsv = false;
              this.rescheduledfn = false;
            }
          } else {
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.rescheduledUsv = false;
            this.rescheduledrsv = false;
            this.rescheduledfn = false;
          }
        } else if (stagestatus['status'] == 'False') {
          this.USV = true;
          this.SV = false;
          this.RSV = false;
          this.Negotiation = false;
          this.leadclose = false;
          this.rescheduledUsv = false;
          this.rescheduledrsv = false;
          this.rescheduledfn = false;
        }
      });
  }
  openEndMenu() {
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    let elementId = '';
    if (this.stageForm) {
      elementId = 'statusSection';
    } else if (this.isActivityHistory) {
      elementId = 'activitySection';
    }

    setTimeout(() => {
      if (elementId && this.stageForm == '' && !this.isActivityHistory) {
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

    if (this.stageForm || this.isActivityHistory || this.isEditProDetails) {
      if (this.stageForm) {
        this.stageForm = '';
      } else if (this.isActivityHistory) {
        this.isActivityHistory = false;
      } else if (this.isEditProDetails) {
        this.isEditProDetails = false;
      }

      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.f2fform = false;
      this.usvform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.commonformbtn = false;

      this.router.navigate([], {
        queryParams: {
          stageForm: null,
          isEditFixedPlan: null,
          isActivityHistory: null,
          isCallHistory: null,
          isEditProDetails: null,
          execid:
            this.selectedExecId == ''
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
  onScroll(event: CustomEvent) {
    this.sharedService.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.scrollContent.getScrollElement().then((scrollEl) => {
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

  togglecategory(value: string) {
    const current = this.addCategoryForm.value.category || [];

    if (current.includes(value)) {
      // remove
      this.addCategoryForm.patchValue({
        category: current.filter((v: string) => v !== value),
      });
    } else {
      // add
      this.addCategoryForm.patchValue({
        category: [...current, value],
      });
    }
  }
  hasError(controlName: string, error: string): boolean {
    const control = this.addCategoryForm.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }
  onSubmitcategory() {
    this.showSpinner = true;
    let param = {
      leadid: this.leadid,
      categoryid: this.addCategoryForm.value.category,
    };
    this.filterLoader = true;
    this.api.addLeadCrmType(param).subscribe({
      next: (resp: any) => {
        this.filterLoader = false;
        Swal.fire({
          title: 'Lead Segmentation',
          text: 'Updated Successfully',
          showConfirmButton: false,
          heightAuto: false,
          timer: 2000,
          icon: 'success',
        }).then(() => {
          location.reload();
          // this.showSpinner = false;
          // $('.modal-backdrop').closest('div').remove();
          // document.body.classList.remove('modal-open');
          // let currentUrl = this.router.url;
          // let pathWithoutQueryParams = currentUrl.split('?')[0];
          // let currentQueryparams = this.activeroute.snapshot.queryParams;
          // this.router
          //   .navigateByUrl('/', { skipLocationChange: true })
          //   .then(() => {
          //     this.router.navigate([pathWithoutQueryParams], {
          //       queryParams: currentQueryparams,
          //     });
          //   });
        });
      },
      error: (err) => {
        this.filterLoader = false;
        console.log(err, 'error');
      },
    });
  }

  toViewMergedLeads() {
    this.viewToMergedLeads.present();
  }

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

  onCloseMergeModal() {
    this.filteredLead = [];
    this.filteredLeads = [];
    this.leadSearchTerm = '';
    this.isActiveMerge = false;
    this.mergeModal.dismiss();
  }

  searchClient(event): void {
    const query = event.target.value;
    console.log(query);
    if (query.length >= 5) {
      this.showSpinner = true;
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
      leadId: this.leadid,
      mergeLeadId: this.filteredLead[0].customer_IDPK,
      relation: this.selectedRelation.name,
      LeadP: this.selectedLeadP.id,
    };

    this.api.postMergeLeads(param).subscribe((resp) => {
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
    this.api.searchLeads(searchedData, '', '', '').subscribe({
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

  triggerhistory() {
    this.roleid = localStorage.getItem('Role');
    this.userid = localStorage.getItem('UserId');

    var param2 = {
      leadid: this.leadid,
      roleid: this.roleid,
      userid: this.userid,
      execid: this.selectedExecId,
      feedbackid: this.feedbackID,
    };
    this.api.gethistory(param2).subscribe((history) => {
      this.showSpinner = false;
      if (history['status'] == 'True') {
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

  showAllActivities() {
    this.isActivityHistory = true;
  }

  alternateNumbercheck(event) {
    // if (event.target.value == this.customerView.customer_number) {
    //   this.customerView.enquiry_altnumber = '';
    //   $('#enquiry_number')
    //     .focus()
    //     .css('border-color', 'red')
    //     .attr('placeholder', 'Please enter different contact number')
    //     .val('');
    // }
    let value = event.detail.value || '';

    // 🔥 Remove everything except digits
    value = value.replace(/\D/g, '');

    // 🔥 Limit to 10 digits
    value = value.slice(0, 10);

    // 🔥 Update input value (important)
    event.target.value = value;
    this.customerView.enquiry_altnumber = value;

    // 🔥 Prevent same number
    if (value && value === this.customerView.customer_number) {
      this.customerView.enquiry_altnumber = '';
      event.target.value = '';
      $('#enquiry_number')
        .focus()
        .addClass('border-color')
        .attr('placeholder', 'Please enter different contact number')
        .val('');
    }
  }

  updateProfile() {
    // primary name
    if ($('#customer_name').val() === '') {
      $('#customer_name')
        .focus()
        .addClass('border-color')
        .attr('placeholder', 'Please Enter Name');
      return false;
    } else {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#customer_name').val()))) {
        $('#customer_name').removeClass('border-color');
      } else {
        $('#customer_name')
          .focus()
          .addClass('border-color')
          .attr('placeholder', 'Please enter valid Name')
          .val('');
        return false;
      }
    }

    //primary mail
    if ($('#customer_mail').val() != '') {
      let enameFilter =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (enameFilter.test(String($('#customer_mail').val()))) {
        $('#customer_mail').removeClass('border-color');
      } else {
        $('#customer_mail')
          .focus()
          .addClass('border-color')
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
        $('#enquiry_mail').removeClass('border-color');
      } else {
        $('#enquiry_mail')
          .focus()
          .addClass('border-color')
          .attr('placeholder', 'Please enter valid email')
          .val('');
        return false;
      }
    }
    //alternate name
    if ($('#enquiry_name').val() != '') {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#enquiry_name').val()))) {
        $('#enquiry_name').removeClass('border-color');
      } else {
        $('#enquiry_name')
          .focus()
          .addClass('border-color')
          .attr('placeholder', 'Please enter valid name')
          .val('');
        return false;
      }
    }

    //alternate number
    var mobileno = /^[0-9]{10}$/;
    if ($('#enquiry_number').val() != '') {
      if (mobileno.test(String($('#enquiry_number').val()))) {
        $('#enquiry_number').removeClass('border-color');
      } else {
        $('#enquiry_number')
          .focus()
          .addClass('border-color')
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
      execid: this.userid,
      name: this.customerView.enquiry_altname,
      number: this.customerView.enquiry_altnumber,
      mail: this.customerView.enquiry_altmail,
      budget: this.customerView.enquiry_budget,
      location: this.customerView.localityid,
      proptype: this.customerView.enquiry_proptype,
      size: this.customerView.enquiry_bhksize,
      property: propertyselect,
      priority: this.customerView.lead_priority,
      address: this.customerView.address,
      leadid: this.leadid,
      possession: this.customerView.enquiry_possession,
      categoryid: this.categoryid,
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
      this.api.datashortupdate(param).subscribe(
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

  onPropertyTypeChange(type: any) {
    if (type === '3') {
      this.size_array = [];
      this.customerView.enquiry_bhksize = null;
    } else if (type === '2' || type === '4') {
      this.size_array = this.villaSizes;
    } else {
      this.size_array = this.sizeOptionsMap['1'];
    }
  }

  onCategory(id) {
    this.junkform = false;
    this.leadclosedform = false;
    this.finalnegoform = false;
    this.rsvform = false;
    this.usvform = false;

    this.router.navigate([], {
      queryParams: {
        categoryid: id,
        stageForm: this.stageForm ? this.stageForm : '',
      },
      queryParamsHandling: 'merge',
    });
  }
  revertStage() {
    Swal.fire({
      title: `Do you want to Revert the lead for ${this.assignedrm[0].customer_assign_name}`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      heightAuto: false,
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.value == true) {
        let param = {
          leadid: this.leadid,
          executid: this.selectedExecId,
        };
        this.api.revertBackToPreStage(param).subscribe((resposne) => {
          if (resposne['status'] == 'True') {
            this.getstages();
          }
        });
      }
    });
  }
  onSwipe(event) {
    if (event == 'chat') {
      window.open(
        `https://wa.me/+91 ${this.customerView.enquiry_number}`,
        '_system'
      );
      // this.navigateToWhatsApp(lead.number);
    } else {
      window.open(`tel:${this.customerView?.enquiry_number}`, '_system');
      if (this.customerView?.enquiry_number) {
        // Trigger the call
        window.open(`tel:${this.customerView.enquiry_number}`, '_system');
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

  @ViewChild('closed_lead_details') closed_lead_details;
  onClosedLeadDetailsModal() {
    this.closed_lead_details.present();
  }
}
