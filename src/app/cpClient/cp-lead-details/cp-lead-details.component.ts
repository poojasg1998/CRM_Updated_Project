import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/realEstate/shared.service';
import { IonModal, PopoverController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cp-lead-details',
  templateUrl: './cp-lead-details.component.html',
  styleUrls: ['./cp-lead-details.component.scss'],
})
export class CpLeadDetailsComponent implements OnInit {
  @ViewChild('mergeModal') mergeModal;
  @ViewChild('suggModal', { static: true }) suggModal: IonModal;
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

  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private popoverController: PopoverController
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
    this.activeroute.queryParams.subscribe((params) => {
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
      this.getAssignedRM();
      this.getstages();
    });
  }

  getcustomeredit(leadid) {
    this.api.getcustomeredit(leadid).subscribe((resp) => {
      this.customerView = resp['Customerview']?.[0];
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
        this.assignedrm = this.assignedrm;
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
}
