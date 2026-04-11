import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationExtras,
  Route,
  Router,
} from '@angular/router';
import {
  IonModal,
  IonPopover,
  ModalController,
  NavController,
} from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';
declare var $: any;
interface visitedproperties {
  accompany: string;
  remarks: string;
  actionid: number;
  propid: number;
  prop_name: string;
}

@Component({
  selector: 'app-usvform',
  templateUrl: './usvform.component.html',
  styleUrls: ['./usvform.component.scss'],
})
export class UsvformComponent implements OnInit, AfterViewChecked {
  @ViewChild('popover') popover: IonPopover;
  @Input() selectedExecId: any;
  @Output() openModal = new EventEmitter<void>();
  @ViewChild(IonModal) modal: IonModal;
  @Input() selectedBtn: any;
  @Input() refreshTrigger: any;
  date: String = new Date().toISOString();
  followdownform: boolean;
  followupdown: boolean;
  usvFixed: boolean = true;
  usvreFix: boolean = false;
  usvDone: boolean;
  junkform: boolean;
  junk: boolean;
  followform: boolean;
  followup: boolean;

  hideafterfixed = true;
  hidebeforefixed = false;
  userid: string;
  username: string;
  usvexecutiveId: any;
  executeid: any;
  leadId: string;
  leadDetails: any;
  activestagestatus: any;
  properties: Object;
  othersvisitedlists: any;
  suggestedpropertylists = [];
  selectedpropertylists: any;
  selectedlists: any;
  suggestchecked: any = '';
  visitedpropertylists: any;
  cancelledpropertylists: any;
  autoremarks: string;
  selectedproperty_commaseperated: any;
  showSpinner = true;
  hasOnlySpaces: boolean;
  usvDate: string;
  usvRemark;
  usvTime;
  nonsuggestedpropertylists: any;
  selectedIndex: string;
  svform: boolean;
  svFixed: boolean;
  rsvFixed: boolean;
  rsvform: boolean;
  finalnegoform: boolean;
  negofixed: boolean;
  leadclosedform: boolean;
  leadclosed: boolean;
  proploopArray: visitedproperties[];
  categoryid: string;
  isEdit: boolean = true;

  constructor(
    private _retailservice: CpApiService,
    private activeroute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private location: Location,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewDidEnter() {
    this.ngOnInit();
  }

  assignedRM;
  feedbackID;
  ngOnInit() {
    this.cdr.detectChanges();
    this.userid = localStorage.getItem('UserId');
    this.username = localStorage.getItem('Name');

    this.activeroute.queryParamMap.subscribe((params) => {
      this.showSpinner = true;
      const paramMap = params.get('leadid');
      this.categoryid = params.get('categoryid');
      this.leadId = params.get('leadid');
      const isEmpty = !paramMap;
      if (!isEmpty) {
        // to get exceId
        let rmid;
        if (this.feedbackID == 1) {
          rmid = this.selectedExecId;
        } else {
          rmid = this.userid;
        }
        this.feedbackID = params.get('feedback') ? params.get('feedback') : '';
        this._retailservice
          .getassignedrmretail(
            this.leadId,
            rmid,
            this.feedbackID,
            this.categoryid
          )
          .pipe(
            switchMap((cust) => {
              this.leadDetails = cust['RMname'][0];
              this.executeid = cust['RMname'][0].executiveid;
              if (this.userid == '1') {
                this.usvexecutiveId = this.selectedExecId;
              } else {
                this.usvexecutiveId = this.selectedExecId;
              }
              this.assignedRM = cust['RMname'].filter((lead) => {
                return lead.RMID == this.selectedExecId;
              });
              this.loadimportantapi();

              //First, get the visit property others
              return this.usvexecutiveId
                ? this._retailservice.getvisitpropertyothers(
                    this.leadId,
                    this.userid,
                    this.usvexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            }),
            switchMap((visitedwithothers) => {
              this.othersvisitedlists = visitedwithothers['visitedothers'];
              // Then, get the active leads status
              return this.usvexecutiveId
                ? this._retailservice.getactiveleadsstatus(
                    this.leadId,
                    this.userid,
                    this.usvexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            })
          )
          .subscribe((stagestatus) => {
            if (stagestatus) {
              this.activestagestatus = stagestatus['activeleadsstatus'];

              this.activestagestatus = stagestatus['activeleadsstatus'];
              if (
                this.activestagestatus[0].stage == 'USV' &&
                this.activestagestatus[0].stagestatus == '1'
              ) {
                this.hideafterfixed = false;
                this.usvFixed = false;
                this.hidebeforefixed = true;
                if (this.selectedBtn == 'rescheduled') {
                  this.usvreFix = true;
                  this.usvDone = false;
                } else if (this.selectedBtn == 'updatevisit') {
                  this.usvreFix = false;
                  this.usvDone = true;
                }
                $('#sectionselector').val('USV');
              } else if (
                this.activestagestatus[0].stage == 'USV' &&
                this.activestagestatus[0].stagestatus == '2'
              ) {
                this.hideafterfixed = false;
                this.usvFixed = false;
                this.hidebeforefixed = true;
                if (this.selectedBtn == 'rescheduled') {
                  this.usvreFix = true;
                  this.usvDone = false;
                } else if (this.selectedBtn == 'updatevisit') {
                  this.usvreFix = false;
                  this.usvDone = true;
                }
                $('#sectionselector').val('USV');
              } else if (
                this.activestagestatus[0].stage == 'USV' &&
                this.activestagestatus[0].stagestatus == '3'
              ) {
                this.hideafterfixed = true;
                this.hidebeforefixed = false;
                this.usvDone = false;
                this.usvFixed = true;
              } else {
                this.hideafterfixed = true;
              }
            }
            this.showSpinner = false;
          });

        var param = {
          leadid: this.leadId,
          execid: this.userid,
        };

        this._retailservice.propertylist(param).subscribe((propertylist) => {
          this.properties = propertylist;
        });
      }
    });
  }

  loadimportantapi() {
    var param = {
      leadid: this.leadId,
      execid: this.userid,
      assignid: this.usvexecutiveId,
      stage: $('#customer_phase4').val(),
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };

    this._retailservice.getsuggestedproperties(param).subscribe((suggested) => {
      this.suggestedpropertylists = suggested['suggestedlists'];
    });

    this._retailservice
      .getnonselectedpropertiesretail(param)
      .subscribe((suggested) => {
        this.nonsuggestedpropertylists = suggested['nonselectedlists'];
      });

    this._retailservice
      .getselectedsuggestpropertiesretail(param)
      .subscribe((selectsuggested) => {
        if (selectsuggested['status'] == 'True') {
          this.selectedpropertylists = selectsuggested['selectedlists'];
          this.selectedlists = selectsuggested;
          this.suggestchecked = this.selectedpropertylists
            ?.map((item) => {
              return item.propid;
            })
            .join(',');
        }
      });

    this._retailservice
      .getvisitedsuggestpropertiesretail(param)
      .subscribe((visitsuggested) => {
        this.visitedpropertylists = visitsuggested['visitedlists'];
      });

    this._retailservice
      .getcancelledsuggestpropertiesretail(param)
      .subscribe((cancelsuggested) => {
        this.cancelledpropertylists = cancelsuggested['cancelledlists'];
      });

    this._retailservice
      .getvisitpropertyothers(
        this.leadId,
        this.userid,
        this.usvexecutiveId,
        this.feedbackID,
        this.categoryid
      )
      .subscribe((visitedwithothers) => {
        this.othersvisitedlists = visitedwithothers['visitedothers'];
      });

    var params = {
      leadid: this.leadId,
      execid: this.userid,
      categoryid: this.categoryid,
    };

    this._retailservice.propertylist(params).subscribe((propertylist) => {
      this.properties = propertylist;
    });
  }

  onusvDone() {
    this.usvDate = '';
    this.usvTime = '';
    this.usvRemark = '';
    this.followdownform = false;
    this.followupdown = false;
    this.usvFixed = false;
    this.usvreFix = false;
    this.usvDone = true;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    $('#sectionselector').val('USV');
  }

  onusvreFix() {
    this.usvDate = '';
    this.usvTime = '';
    this.usvRemark = '';
    this.usvFixed = false;
    this.usvreFix = true;
    this.usvDone = false;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
  }

  // Selecting the suggested properties for fix the USV
  selectsuggested(i, id, propname) {
    if ($('#checkbox' + i).is(':checked')) {
      var checkid = $("input[name='programming']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for USV while fixing the meeting.';
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'USV',
        execid: this.usvexecutiveId,
      };
      var param = {
        leadid: this.leadId,
        execid: this.userid,
        assignid: this.selectedExecId,
        feedback: this.feedbackID,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the USV scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          this._retailservice
            .getselectedsuggestpropertiesretail(param)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedlists'];
              this.selectedlists = selectsuggested;
              // Joining the object values as comma seperated when remove the property for the history storing
              this.selectedproperty_commaseperated = this.selectedpropertylists
                ?.map((item) => {
                  return item.name;
                })
                .join(',');
              // Joining the object values as comma seperated when remove the property for the history storing
            });
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  removeValue(list, value) {
    return list.replace(new RegExp(',?' + value + ',?'), function (match) {
      var first_comma = match.charAt(0) === ',',
        second_comma;

      if (
        first_comma &&
        (second_comma = match.charAt(match.length - 1) === ',')
      ) {
        return ',';
      }
      return '';
    });
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.usvDate = selectedDate.toLocaleDateString('en-CA');
  }

  //when click on date, popup of datepicker closed after selecting date
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  // to test whether the text area input contain only space
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.usvRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.usvRemark);
  }

  removeids: any[] = [];
  // Selecting the suggested properties for fix the USV
  refixsuggested(i, id, propname) {
    if ($('#suggestcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programming']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      let selectedProperties = checkid.split(',');
      var removeduplictaes = Array.from(new Set(selectedProperties));
      this.suggestchecked = removeduplictaes.join(',');
      this.autoremarks =
        ' added the ' + propname + ' for USV while refixing the meeting.';
    } else {
      this.removeids.push(id);
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      // var param = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: "USV",
      //   execid: this.userid,
      //   assignid:this.selectedExecId,
      //   }
      //   this.suggestchecked = this.removeValue(this.suggestchecked, id);

      //   console.log(this.suggestchecked)
      //   this.autoremarks = " removed the "+propname+" from the USV scheduled lists while refixing the meeting.";
      //   this._retailservice.removeselectedproperties(param).subscribe((success) => {
      //   if(success['status'] == "True"){
      //       this._retailservice.getselectedsuggestpropertiesretail(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      //   }
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    }
  }

  // USV FIXING
  usvfixing() {
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      this.showSpinner = true;
      var nextdate = $('#nextactiondate').val();
      var nexttime = $('#nextactiontime').val();
      var textarearemarks = $('#textarearemarks').val();
      var dateformatchange = new Date(nextdate).toDateString();
      var param = {
        leadid: this.leadId,
        nextdate: nextdate,
        nexttime: nexttime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.usvexecutiveId,
        feedback: this.feedbackID,
        categoryid: this.categoryid,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing USV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._retailservice
          .addselectedsuggestedproperties(param)
          .subscribe((success) => {
            var param2 = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.selectedExecId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice
              .getselectedsuggestpropertiesretail(param2)
              .subscribe((selectsuggested) => {
                if (selectsuggested['status'] == 'True') {
                  this.selectedpropertylists = selectsuggested['selectedlists'];
                  this.selectedlists = selectsuggested;
                  // Joining the object values as comma seperated when add the property for the history storing
                  if (this.selectedpropertylists) {
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        ?.map((item) => {
                          return item.name;
                        })
                        .join(',');
                  }
                  // Joining the object values as comma seperated when add the property for the history storing

                  this.autoremarks =
                    'Scheduled the USV for ' +
                    this.selectedproperty_commaseperated +
                    ' On ' +
                    dateformatchange +
                    ' ' +
                    nexttime;
                  let usvassignedid;
                  if (this.userid == '1') {
                    usvassignedid = this.selectedExecId;
                  } else {
                    usvassignedid = this.executeid;
                  }

                  var leadusvhistparam = {
                    leadid: this.leadId,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'USV',
                    stagestatus: '1',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    property: this.suggestchecked,
                    assignid: this.usvexecutiveId,
                    weekplan: '',
                    autoremarks: this.autoremarks,
                    feedback: this.feedbackID,
                    categoryid: this.categoryid,
                  };
                  this._retailservice
                    .addleadhistoryretail(leadusvhistparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          (this.showSpinner = false),
                            $('#nextactiondate').val('');
                          $('#nextactiontime').val('');
                          $('#customer_phase4').val('');
                          $('#textarearemarks').val('');
                          Swal.fire({
                            title: 'USV Fixed Successfully',
                            icon: 'success',
                            allowOutsideClick: false,
                            heightAuto: false,
                            confirmButtonText: 'OK!',
                          }).then((result) => {
                            if (result.value) {
                              this.modalController.dismiss();
                              // const currentParams = this.activeroute.snapshot.queryParams;
                              //     this.router.navigate([], {
                              //     relativeTo: this.activeroute,
                              //     queryParams: {
                              //       ...currentParams,
                              //       stageForm: 'onleadStatus'
                              //     },
                              //     queryParamsHandling: 'merge'
                              //   });
                              location.reload();
                            }
                          });
                        }
                      },
                      (err) => {
                        console.log('Failed to Update');
                      }
                    );
                }
              });
          });
      }
    }
  }

  // USV RE-FIX
  usvrefixing() {
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      var nextdate = $('#refixdate').val();
      var nexttime = $('#refixtime').val();
      var textarearemarks = $('#refixtextarearemarks').val();
      var dateformatchange = new Date(nextdate).toDateString();
      this.showSpinner = true;
      var param = {
        leadid: this.leadId,
        nextdate: nextdate,
        nexttime: nexttime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.usvexecutiveId,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Re-Fixing USV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._retailservice
          .addselectedsuggestedpropertiesrefix(param)
          .subscribe(
            (success) => {
              var param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.selectedExecId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              this._retailservice
                .getselectedsuggestpropertiesretail(param2)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedlists'];
                    this.selectedlists = selectsuggested;
                    // Joining the object values as comma seperated when add the property for the history storing
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        ?.map((item) => {
                          return item.name;
                        })
                        .join(',');
                    // Joining the object values as comma seperated when add the property for the history storing

                    this.autoremarks =
                      ' ReFixed the USV for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      nexttime;
                    let usvassignedid;
                    if (this.userid == '1') {
                      usvassignedid = this.selectedExecId;
                    } else {
                      this.executeid;
                    }
                    var leadusvhistparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'USV',
                      stagestatus: '2',
                      property: this.suggestchecked,
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      weekplan: '',
                      assignid: this.usvexecutiveId,
                      autoremarks: this.autoremarks,
                      feedback: this.feedbackID,
                      categoryid: this.categoryid,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadusvhistparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'USV Refixed Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              heightAuto: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              this.modalController.dismiss();
                              // const currentParams = this.activeroute.snapshot.queryParams;
                              //   this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'
                              // });
                              location.reload();
                            });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  }
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
      }
    }
  }

  // to open suggested prop modal present in parent component
  notifyParent() {
    this.openModal.emit();
  }

  @ViewChild('usvDoneModel', { static: true }) usvDoneModel: IonModal;
  openUSVDoneModal() {
    $('body').addClass('parentmodal');
    let apidate, apitime;
    if (this.isEdit && this.assignedRM && this.assignedRM.length) {
      let visiteddate = this.assignedRM[0].latest_action_date;
      let visitedtime = this.assignedRM[0].latest_action_time;
      apidate = $('#USVvisiteddate_dis').text();
      apitime = $('#USVvisitedtime_dis').text();
      $('#USVvisiteddate').val(this.assignedRM[0].latest_action_date);
      $('#USVvisitedtime').val(this.assignedRM[0].latest_action_time);

      console.log(visiteddate, visitedtime);

      // Convert date string → JS Date
      let dateObj = visiteddate ? new Date(visiteddate) : null;

      // Convert "1:00 PM" → Date object
      let timeObj = null;
      // setTimeout(() => {
      //   // ✅ Set Date
      //   if (visiteddate) {
      //     let dateObj = new Date(visiteddate);
      //     $('.usvvisitedcalendardate').calendar('set date', dateObj);
      //   }

      //   // ✅ Set Time
      //   if (visitedtime) {
      //     let timeObj = new Date();

      //     let [time, modifier] = visitedtime.split(' ');
      //     let [hours, minutes] = time.split(':');

      //     if (modifier === 'PM' && hours !== '12') {
      //       hours = parseInt(hours) + 12;
      //     }
      //     if (modifier === 'AM' && hours === '12') {
      //       hours = 0;
      //     }

      //     timeObj.setHours(hours);
      //     timeObj.setMinutes(minutes);
      //     timeObj.setSeconds(0);

      //     $('.calendartime').calendar('set date', timeObj);
      //   }
      // }, 300);

      // ✅ Use Semantic UI API
      // $('.usvvisitedcalendardate').calendar('set date', dateObj);
      // $('.calendartime').calendar('set date', timeObj);
    } else {
      var visiteddate = $('#USVvisiteddate').val();
      var visitedtime = $('#USVvisitedtime').val();
      apidate = $('#USVvisiteddate').val();
      apitime = $('#USVvisitedtime').val();
    }

    var visiteddate = $('#USVvisiteddate').val();
    var visitedtime = $('#USVvisitedtime').val();
    var param = {
      leadid: this.leadId,
      nextdate: visiteddate,
      nexttime: visitedtime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignid: this.usvexecutiveId,
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };
    if (visiteddate != '' && visitedtime != '') {
      this._retailservice.addselectedsuggestedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            var param2 = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.selectedExecId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice
              .getselectedsuggestpropertiesretail(param2)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists = selectsuggested['selectedlists'];
                this.selectedlists = selectsuggested;
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
    console.log(this.selectedpropertylists);
    this.usvDoneModel.present();
  }

  selectedpropertylists1;
  moresuggested(i, id, propname, property) {
    console.log(this.selectedpropertylists);
    if ($('#moresuggestcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programming']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      console.log(this.suggestchecked);
      this.selectedpropertylists.push(property);
      console.log(this.selectedpropertylists);

      // if ($('#USVvisiteddate').val() == "") {
      //   Swal.fire({
      //     title: 'Please select a date',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#moresuggestcheckbox' + i).prop('checked', false);
      //     })
      // }else if($('#USVvisitedtime').val() == ""){
      //   Swal.fire({
      //     title: 'Please select a time',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#moresuggestcheckbox' + i).prop('checked', false);
      //     })
      //   $('#SVvisitedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select One Date');
      // }else{
      //   var visiteddate = $('#USVvisiteddate').val();
      //   var visitedtime = $('#USVvisitedtime').val();
      //     var param = {
      //     leadid: this.leadId,
      //     nextdate: visiteddate,
      //     nexttime: visitedtime,
      //     suggestproperties: this.suggestchecked,
      //     execid: this.userid,
      //     assignid:this.usvexecutiveId
      //     }
      //     this.autoremarks = " added the "+propname+" for USV during the sitevisit.";
      //   this._retailservice.addselectedsuggestedproperties(param).subscribe((success) => {
      //     if(success['status'] == "True"){
      //       var param2 = {
      //         leadid: this.leadId,
      //         execid: this.userid,
      //         assignid:this.selectedExecId,
      //       }
      //         this._retailservice.getselectedsuggestpropertiesretail(param2).subscribe(selectsuggested => {
      //       this.selectedpropertylists = selectsuggested['selectedlists'];
      //       this.selectedlists = selectsuggested;
      //     });
      //     }
      //   }, (err) => {
      //     console.log("Failed to Update");
      //   })
      // }
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'USV',
        execid: this.usvexecutiveId,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the USV scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          var param2 = {
            leadid: this.leadId,
            execid: this.userid,
            assignid: this.selectedExecId,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          // this.status = success.status;
          this._retailservice
            .getselectedsuggestpropertiesretail(param2)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedlists'];
              this.selectedlists = selectsuggested;
              // Joining the object values as comma seperated when remove the property for the history storing
              this.selectedproperty_commaseperated = this.selectedpropertylists
                ?.map((item) => {
                  return item.name;
                })
                .join(',');
              // Joining the object values as comma seperated when remove the property for the history storing
            });
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  selectedItem = 0;
  defaultclick: any;
  buttonclick: any;
  parsedarray = [];

  nextoverride(i) {
    this.buttonclick = i;
    this.defaultclick = i;
    $('.lists').removeClass('active');
    $('.projectlists' + this.defaultclick).trigger('click');
  }

  visitedprop: visitedproperties[] = [];
  autolocksession = true;
  lockedsession = false;

  notvisitclick(val, propname, i, last) {
    // localStorage.removeItem('visitedprop')
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;
    this.selectedIndex = 'notvisit';
    $('.visitupdatearea' + i).css('display', 'none');
    if (this.buttonclick == undefined) {
      this.buttonclick = i + 1;
      $('.projectlists' + this.buttonclick).trigger('click');
    } else if (this.buttonclick == i) {
      this.buttonclick = i + 1;
    } else {
      this.buttonclick = this.defaultclick + 1;
    }
    if (last == true) {
      // Reached Lastrow
    } else {
      $('.lists').removeClass('active');
      $('.projectlists' + this.buttonclick).trigger('click');
    }

    if (this.selectedpropertylists?.length != this.visitedprop.length) {
      if (this.visitedprop.length == 0) {
        const selectedpropertyarray = {
          accompany: 'NOT Visited',
          remarks: 'NOT Visited',
          actionid: 0,
          propid: val,
          prop_name: propname,
        };
        this.visitedprop.push({ ...selectedpropertyarray });
        localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      } else {
        const existingPropIds = this.visitedprop.map((obj) => obj.propid);
        if (!existingPropIds.includes(val)) {
          const selectedpropertyarray = {
            accompany: 'NOT Visited',
            remarks: 'NOT Visited',
            actionid: 0,
            propid: val,
            prop_name: propname,
          };
          this.visitedprop.push({ ...selectedpropertyarray });
          localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
        } else {
        }
      }
      if (this.selectedpropertylists?.length == this.visitedprop.length) {
        this.autolocksession = false;
        this.lockedsession = true;
      }
    } else {
      this.autolocksession = false;
      this.lockedsession = true;
    }

    if ('propertyloops' in localStorage) {
      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
        this.visitedprop = this.visitedprop.map((item) => {
          if (item.propid == val) {
            return {
              ...item,
              accompany: 'NOT Visited',
              remarks: 'NOT Visited',
              actionid: 0,
            };
          }
          return item;
        });
        localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      }
    } else {
      localStorage.setItem('propertyloops', '[]');

      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      }
    }
    $('.x-circle' + i).removeAttr('style');
    $('.check-circle' + i).css('display', 'block');
    $('#visitUpdate' + i).removeClass('notVisitUpdate');
    $('#visitUpdate' + i).addClass('donevisitUpdate');

    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
  }

  // to display the tick mark icon
  isDoneVisitUpdate(index: number): boolean {
    const element = document.getElementById(`visitUpdate${index}`);
    return element ? element.classList.contains('donevisitUpdate') : false;
  }

  //to display the question mark icon
  isNotDoneVisitUpdate(index: number): boolean {
    const element = document.getElementById(`visitUpdate${index}`);
    return element ? element.classList.contains('notVisitUpdate') : false;
  }

  interestclick(val, propname, i) {
    // this.lockedsession = false;
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;
    // $('#accompaniedname'+i).val('');
    // $('#propertyremarks'+i).val('');
    $('.visitupdatearea' + i).css('display', 'block');
    const action = 1;

    if ($('#accompaniedname' + i).val() == '') {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
    } else if ($('#propertyremarks' + i).val() == '') {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
    } else {
    }

    if (this.selectedpropertylists?.length != this.visitedprop.length) {
      if (this.visitedprop.length == 0) {
        const selectedpropertyarray = {
          accompany: '',
          remarks: '',
          actionid: action,
          propid: val,
          prop_name: propname,
        };
        this.visitedprop.push({ ...selectedpropertyarray });
        localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      } else {
        const existingPropIds = this.visitedprop.map((obj) => obj.propid); // Extract existing propIds
        const existingIndex = this.visitedprop.findIndex(
          (obj) => obj.propid === val
        );
        if (!existingPropIds.includes(val)) {
          const selectedpropertyarray = {
            accompany: '',
            remarks: '',
            actionid: action,
            propid: val,
            prop_name: propname,
          };
          this.visitedprop.push({ ...selectedpropertyarray });
          localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
        } else {
          this.visitedprop[existingIndex].actionid = action;
          localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
        }
      }
    } else {
      const existingIndex = this.visitedprop.findIndex(
        (obj) => obj.propid === val
      );
      this.visitedprop[existingIndex].actionid = action;
      localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      if (this.visitedprop[existingIndex].accompany == '') {
        this.autolocksession = true;
        this.lockedsession = false;
      } else if (this.visitedprop[existingIndex].accompany == 'NOT Visited') {
        this.autolocksession = true;
        this.lockedsession = false;
        $('#propertyremarks' + i).val('');
        $('#accompaniedname' + i).val('');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        $('#visitUpdate' + i).removeClass('donevisitUpdate');
      } else {
        if (this.visitedprop[existingIndex].remarks == '') {
          this.autolocksession = true;
          this.lockedsession = false;
        } else if (this.visitedprop[existingIndex].remarks == 'NOT Visited') {
          this.autolocksession = true;
          this.lockedsession = false;
          $('#propertyremarks' + i).val('');
          $('#accompaniedname' + i).val('');
        } else {
          this.autolocksession = false;
          // this.lockedsession = true;
        }
      }
    }

    if ('propertyloops' in localStorage) {
      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
        this.parsedarray.push(val);
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
      }
    } else {
      localStorage.setItem('propertyloops', '[]');
      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
        this.parsedarray.push(val);
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
      }
    }
    this.proploopArray = this.visitedprop.filter((da) => {
      return da.actionid == 1;
    });
  }

  notinterestclick(val, propname, i) {
    // this.lockedsession = false;
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;
    // $('#accompaniedname'+i).val('');
    // $('#propertyremarks'+i).val('');
    $('.visitupdatearea' + i).css('display', 'block');
    const action = 3;

    if ($('#accompaniedname' + i).val() == '') {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
    } else if ($('#propertyremarks' + i).val() == '') {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
    } else {
    }
    if (this.selectedpropertylists?.length != this.visitedprop.length) {
      if (this.visitedprop.length == 0) {
        const selectedpropertyarray = {
          accompany: '',
          remarks: '',
          actionid: action,
          propid: val,
          prop_name: propname,
        };
        this.visitedprop.push({ ...selectedpropertyarray });
        localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      } else {
        const existingPropIds = this.visitedprop.map((obj) => obj.propid); // Extract existing propIds
        const existingIndex = this.visitedprop.findIndex(
          (obj) => obj.propid === val
        );
        if (!existingPropIds.includes(val)) {
          const selectedpropertyarray = {
            accompany: '',
            remarks: '',
            actionid: action,
            propid: val,
            prop_name: propname,
          };
          this.visitedprop.push({ ...selectedpropertyarray });
          localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
        } else {
          this.visitedprop[existingIndex].actionid = action;
          localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
        }
      }
    } else {
      const existingIndex = this.visitedprop.findIndex(
        (obj) => obj.propid === val
      );
      this.visitedprop[existingIndex].actionid = action;
      localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
      if (this.visitedprop[existingIndex].accompany == '') {
        this.autolocksession = true;
        this.lockedsession = false;
      } else if (this.visitedprop[existingIndex].accompany == 'NOT Visited') {
        this.autolocksession = true;
        this.lockedsession = false;
        $('#propertyremarks' + i).val('');
        $('#accompaniedname' + i).val('');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        $('#visitUpdate' + i).removeClass('donevisitUpdate');
      } else {
        if (this.visitedprop[existingIndex].remarks == '') {
          this.autolocksession = true;
          this.lockedsession = false;
        } else if (this.visitedprop[existingIndex].remarks == 'NOT Visited') {
          this.autolocksession = true;
          this.lockedsession = false;
          $('#propertyremarks' + i).val('');
          $('#accompaniedname' + i).val('');
        } else {
          this.autolocksession = false;
          this.lockedsession = true;
        }
      }
    }

    if ('propertyloops' in localStorage) {
      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
        this.parsedarray.push(val);
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
      }
    } else {
      localStorage.setItem('propertyloops', '[]');
      const proparray = localStorage.getItem('propertyloops');
      const jsonpars = JSON.parse(proparray);
      const itemToRemoveIndex = jsonpars.indexOf(val);
      this.parsedarray = JSON.parse(proparray);

      if (itemToRemoveIndex == -1) {
        this.parsedarray.push(val);
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      } else {
        // Same data Removal from the localstorage if its exist in array
        this.parsedarray = this.parsedarray.filter(function (item) {
          return item !== val;
        });
      }
    }

    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
  }

  visitremarkscheck(val, id, i) {
    const existingIndex = this.visitedprop.findIndex(
      (obj) => obj.propid === id
    );
    if (existingIndex !== -1) {
      // Object found at index existingIndex
      this.visitedprop[existingIndex].remarks = val.target.value;
      localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
    } else {
    }

    if (
      !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
        $('#propertyremarks' + i).val()
      )
    ) {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
      this.autolocksession = true;
      this.lockedsession = false;
      // return false;
    } else {
      if (
        !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
          $('#accompaniedname' + i).val()
        )
      ) {
        $('.check-circle' + i).removeAttr('style');
        $('.x-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('donevisitUpdate');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        this.autolocksession = true;
        this.lockedsession = false;
        // return false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
        } else {
          const hasEmptyProperties = this.checkEmptyProperties(
            this.visitedprop
          );
          if (hasEmptyProperties) {
            this.autolocksession = false;
            this.lockedsession = true;
          } else {
            this.autolocksession = true;
            this.lockedsession = false;
          }
        }
        $('.x-circle' + i).removeAttr('style');
        $('.check-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('notVisitUpdate');
        $('#visitUpdate' + i).addClass('donevisitUpdate');
      }
    }
  }

  checkEmptyProperties(myArray: any[]): boolean {
    for (const obj of myArray) {
      for (const prop in obj) {
        if (
          obj.hasOwnProperty(prop) &&
          (obj[prop] === null || obj[prop] === undefined || obj[prop] === '')
        ) {
          return false; // Early exit if an empty property is found
        }
      }
    }
    return true; // All properties have values if the loop completes
  }

  accompanycheck(val, id, i) {
    const existingIndex = this.visitedprop.findIndex(
      (obj) => obj.propid === id
    );
    if (existingIndex !== -1) {
      // Object found at index existingIndex
      this.visitedprop[existingIndex].accompany = val.target.value;
      localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
    } else {
    }
    if (
      !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
        $('#accompaniedname' + i).val()
      )
    ) {
      $('.check-circle' + i).removeAttr('style');
      $('.x-circle' + i).css('display', 'block');
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
      this.autolocksession = true;
      this.lockedsession = false;
      // return false;
    } else {
      if (
        !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
          $('#propertyremarks' + i).val()
        )
      ) {
        $('.check-circle' + i).removeAttr('style');
        $('.x-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('donevisitUpdate');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        this.autolocksession = true;
        this.lockedsession = false;
        // return false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
        } else {
          const hasEmptyProperties = this.checkEmptyProperties(
            this.visitedprop
          );
          if (hasEmptyProperties) {
            this.autolocksession = false;
            this.lockedsession = true;
          } else {
            this.autolocksession = true;
            this.lockedsession = false;
          }
        }
        $('.x-circle' + i).removeAttr('style');
        $('.check-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('notVisitUpdate');
        $('#visitUpdate' + i).addClass('donevisitUpdate');
      }
    }
  }

  followupdownbtn() {
    $('#customer_phase4').val('USV');
    this.followdownform = true;
    this.followupdown = true;
    this.svform = false;
    this.svFixed = false;
    this.rsvFixed = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
  }

  onsvFixed() {
    $('#customer_phase4').val('USV');
    this.followdownform = false;
    this.followupdown = false;
    this.svform = true;
    this.svFixed = true;
    this.rsvFixed = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
  }
  onrsvFixed() {
    $('#customer_phase4').val('USV');
    this.rsvform = true;
    this.rsvFixed = true;
    this.svform = false;
    this.svFixed = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onnegofixed() {
    $('#customer_phase4').val('USV');
    this.finalnegoform = true;
    this.negofixed = true;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svform = false;
    this.svFixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onleadclosed() {
    $('#customer_phase4').val('USV');
    this.leadclosedform = true;
    this.leadclosed = true;
    this.junkform = false;
    this.junk = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svform = false;
    this.svFixed = false;
    this.followdownform = false;
    this.followupdown = false;
  }
  onjunk() {
    $('#customer_phase4').val('USV');
    this.junkform = true;
    this.junk = true;
    this.usvFixed = false;
    this.usvreFix = false;
    this.usvDone = false;
    this.followform = false;
    this.followup = false;
    this.svform = false;
    this.svFixed = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.leadclosedform = false;
    this.leadclosed = false;
  }

  ngAfterViewChecked() {
    if (this._retailservice.isCloseSuggModal) {
      this.loadimportantapi();
      this._retailservice.isCloseSuggModal = false;
    }
    this.cdr.detectChanges();
  }

  onUpdateBackbutton() {
    this.lockedsession = false;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;

    this.visitedprop = [];
    localStorage.removeItem('propertyloops');
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.usvTime) {
      const [time, modifier] = this.usvTime.split(' ');
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
      this.usvTime = '';
      $('#nextactiontime').val('');
      $('#refixtime').val('');
      $('#USVvisitedtime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  updateUsvDone() {
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      this.showSpinner = true;
      var visiteddate = $('#USVvisiteddate').val();
      var visitedtime = $('#USVvisitedtime').val();
      var usvfinalremarks = 'USV Done';

      let date = new Date($('#USVvisiteddate').val());
      let day = date.getDay();
      let isWeekend = day === 6 || day === 0;
      var checkedDay;
      if (isWeekend) {
        checkedDay = 2;
      } else {
        checkedDay = 1;
      }

      var param = {
        leadid: this.leadId,
        nextdate: visiteddate,
        nexttime: visitedtime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.usvexecutiveId,
        feedback: this.feedbackID,
        categoryid: this.categoryid,
      };
      if (visiteddate != '' && visitedtime != '') {
        this._retailservice.addselectedsuggestedproperties(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.selectedExecId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              this._retailservice
                .getselectedsuggestpropertiesretail(param2)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedlists'];
                    this.selectedlists = selectsuggested;
                    for (const existingObject of this.selectedpropertylists) {
                      var visitparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        stage: 'USV',
                        stagestatus: '4',
                        propid: existingObject['propid'],
                        execid: this.userid,
                        visitupdate: 9,
                        remarks: 'Usv Done for' + ' ' + existingObject['name'],
                        accompany: this.usvexecutiveId,
                        assignid: this.usvexecutiveId,
                        categoryid: this.categoryid,
                      };
                      this._retailservice
                        .retailpropertyvisitupdate(visitparam)
                        .subscribe(
                          (success) => {
                            if (success['status'] == 'True') {
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    }
                    let selectedpropertylists = this.selectedpropertylists.map(
                      (prop) => {
                        return prop.propid;
                      }
                    );
                    this.autoremarks = ' USV Done Successfully';
                    var leadusvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'USV',
                      stagestatus: '1',
                      textarearemarks: usvfinalremarks,
                      userid: this.userid,
                      assignid: this.usvexecutiveId,
                      autoremarks: this.autoremarks,
                      property: selectedpropertylists.join(','),
                      weekplan: checkedDay,
                      feedback: this.feedbackID,
                      categoryid: this.categoryid,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadusvdoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.showSpinner = false;
                            // let currentUrl = this.router.url;
                            // let pathWithoutQueryParams = currentUrl.split('?')[0];
                            // let currentQueryparams = this.activeroute.snapshot.queryParams;
                            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            //   this.router.navigate([pathWithoutQueryParams], { queryParams: currentQueryparams });
                            // });
                            location.reload();
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  }
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

  enableVisitdate(num) {
    if (num == 1) {
      this.isEdit = false;
      setTimeout(() => {
        this.scriptfunctions();

        if (this.assignedRM && this.assignedRM.length > 0) {
          const date = this.assignedRM[0].latest_action_date;
          const time = this.assignedRM[0].latest_action_time;

          $('#USVvisiteddate').val(date);
          $('#USVvisitedtime').val(time);

          // Optional: update calendar internal state
          $('.usvvisitedcalendardate').calendar('set date', new Date(date));
          $('.calendartime').calendar('set date', this.convertToDateTime(time));
        }
      }, 0);
    } else if ((num = 2)) {
      this.usvDate = this.assignedRM[0].latest_action_date;
      this.usvTime = this.assignedRM[0].latest_action_time;
      this.isEdit = true;
    }
  }

  scriptfunctions() {
    // $('.ui.dropdown').dropdown();
    // $('.calendardate').calendar({
    //   type: 'date',
    //   // minDate: this.date,
    //   // maxDate: this.priorDate,
    //   formatter: {
    //     date: function (date, settings) {
    //       if (!date) return '';
    //       var day = date.getDate();
    //       var month = date.getMonth() + 1;
    //       var year = date.getFullYear();
    //       return year + '-' + month + '-' + day;
    //     },
    //   },
    // });
    // $('.usvvisitedcalendardate').calendar({
    //   type: 'date',
    //   // minDate: this.priorDatebefore,
    //   // maxDate: this.date,
    //   formatter: {
    //     date: function (date, settings) {
    //       if (!date) return '';
    //       var day = date.getDate();
    //       var month = date.getMonth() + 1;
    //       var year = date.getFullYear();
    //       return year + '-' + month + '-' + day;
    //     },
    //   },
    // });
    // var minDate = new Date();
    // var maxDate = new Date();
    // minDate.setHours(7);
    // maxDate.setHours(20);
    // $('.calendartime').calendar({
    //   type: 'time',
    //   disableMinute: true,
    //   minDate: minDate,
    //   maxDate: maxDate,
    // });
    // $.extend($.expr[':'], {
    //   unchecked: function (obj) {
    //     return (
    //       (obj.type == 'checkbox' || obj.type == 'radio') &&
    //       !$(obj).is(':checked')
    //     );
    //   },
    // });
  }

  convertToDateTime(timeStr: string): Date {
    const now = new Date();

    if (!timeStr) return now;

    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    now.setHours(hours);
    now.setMinutes(minutes);
    now.setSeconds(0);

    return now;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger']) {
      this.loadimportantapi();
    }
  }
}
