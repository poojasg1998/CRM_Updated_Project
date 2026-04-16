import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonPopover, ModalController } from '@ionic/angular';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';
declare var $: any;

@Component({
  selector: 'app-retail-followupform',
  templateUrl: './retail-followupform.component.html',
  styleUrls: ['./retail-followupform.component.scss'],
})
export class RetailFollowupformComponent implements OnInit {
  @ViewChild('popover') popover: IonPopover;
  @Input() selectedExecId: any;
  date: String = new Date().toISOString();
  followupDate;
  followupTime;
  followUpRemark;

  followupsections;
  selectedOption: any;
  followsectiondata: any;
  followsectionname: any;
  showSpinner = true;
  leadId;
  userid;
  executeid;
  suggestchecked;
  followexecutiveId;
  currentstage;
  stagestatusapi;
  stagestatus;
  autoremarks;
  hasOnlySpaces;

  currentdateforcompare = new Date();
  todaysdateforcompare: any;
  currenttime: any;
  isFreshLead: boolean = false;
  categoryid: string;
  private destroy$ = new Subject<void>();

  subscription: import('rxjs').Subscription;

  constructor(
    private router: Router,
    private _retailservice: CpApiService,
    private activeroute: ActivatedRoute,
    private modalController: ModalController
  ) {}

  feedbackID = '';

  ngOnInit() {
    this.userid = localStorage.getItem('UserId');
    this.subscription = this.activeroute.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const paramMap = params.get('leadid');
        this.leadId = params.get('leadid');
        this.categoryid = params.get('categoryid');
        const isEmpty = !paramMap;
        this.feedbackID = params.get('feedback') ? params.get('feedback') : '0';
        var curmonth = this.currentdateforcompare.getMonth() + 1;
        var curmonthwithzero = curmonth.toString().padStart(2, '0');
        var curday = this.currentdateforcompare.getDate();
        var curdaywithzero = curday.toString().padStart(2, '0');
        this.todaysdateforcompare =
          this.currentdateforcompare.getFullYear() +
          '-' +
          curmonthwithzero +
          '-' +
          curdaywithzero;
        const options: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
        };
        const timeString = new Date().toLocaleTimeString([], options);
        this.currenttime = timeString;

        if (!isEmpty) {
          this._retailservice.getfollowupsections().subscribe((response) => {
            if (response['status'] == 'True') {
              this.followupsections = response['followupCategories'];
              this.showSpinner = false;
            }
          });

          let rmid;
          if (this.feedbackID == '1') {
            rmid = this.selectedExecId;
          } else {
            rmid = this.userid;
          }
          // to get exceId
          this._retailservice
            .getassignedrmretail(
              this.leadId,
              rmid,
              this.feedbackID,
              this.categoryid
            )
            .pipe(
              takeUntil(this.destroy$),
              switchMap((cust) => {
                console.log(cust);
                console.log(
                  cust?.['RMname']?.[0]?.['suggestedprop']?.[0]?.propid
                );

                this.selectedPriority = cust?.['RMname']?.[0]?.priority;
                if (cust && cust['RMname'] && cust['RMname'][0]) {
                  this.executeid = cust['RMname'][0].executiveid;
                  this.suggestchecked =
                    cust?.['RMname']?.[0]?.['suggestedprop']?.[0]?.propid;
                  this.followexecutiveId =
                    this.userid === '1' ? this.selectedExecId : this.executeid;
                }
                // Return an observable for the second API call
                return this.followexecutiveId
                  ? this._retailservice.getactiveleadsstatus(
                      this.leadId,
                      this.userid,
                      this.followexecutiveId,
                      this.feedbackID,
                      this.categoryid
                    )
                  : of(null);
              })
            )
            .subscribe((stagestatus) => {
              if (stagestatus) {
                if (stagestatus['status'] === 'True') {
                  this.currentstage = stagestatus['activeleadsstatus'][0].stage;
                  this.stagestatusapi =
                    stagestatus['activeleadsstatus'][0].stagestatus;
                  if (this.currentstage == null) {
                    this.currentstage = 'Fresh';
                    this.stagestatus = '0';
                  }

                  if (stagestatus['activeleadsstatus'][0].stage == 'Fresh') {
                    this.isFreshLead = false;
                  } else {
                    this.isFreshLead = true;
                  }
                } else {
                  this.currentstage = 'Fresh';
                  this.stagestatus = '0';
                }
              }
            });
        }
      });
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.followupDate = selectedDate.toLocaleDateString('en-CA');
  }

  // to test whether the text area input contain only space
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces =  !/^(?!\s*$).+$/.test(this.followUpRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.followUpRemark);
  }

  //when click on date, popup of datepicker closed after selecting date
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  //to get the reson of followup
  followupactionclick(i, id, name) {
    $('.actions').addClass('actionbtns');
    $('.selectMark').addClass('iconmark');
    $('.actionbtns').removeClass('actions');
    $('.iconmark').removeClass('selectMark');

    $('.actions' + i).removeClass('actionbtns');
    $('.actions' + i).addClass('actions');
    $('.selectMark' + i).removeClass('iconmark');
    $('.selectMark' + i).addClass('selectMark');

    this.followsectiondata = id;
    this.followsectionname = name;

    if (
      (id == 1 && name == 'Callback') ||
      (id == 8 && name == 'NC' && this.currentstage == 'Fresh')
    ) {
      this.isFreshLead = true;
      $('#folloupdate').val('');
      $('#followuptime').val('');
      $('#followuptextarearemarks').val('');
    } else if (this.currentstage == 'Fresh') {
      this.isFreshLead = false;
      $('#folloupdate').val(this.todaysdateforcompare);
      $('#followuptime').val(this.currenttime);
      $('#followuptextarearemarks').val(this.followsectionname);
    }
  }

  addfollowupdata() {
    var followdate;
    var followtime;
    var followuptextarearemarks;
    if (
      this.followsectiondata == 1 &&
      this.followsectiondata == 8 &&
      this.currentstage == 'Fresh'
    ) {
      followdate = $('#folloupdate').val();
      followtime = $('#followuptime').val();
      followuptextarearemarks = $('#followuptextarearemarks').val();
    } else if (
      this.currentstage == 'Fresh' &&
      this.followsectiondata != 1 &&
      this.followsectiondata != 8
    ) {
      $('#folloupdate').val(this.todaysdateforcompare);
      $('#followuptime').val(this.currenttime);
      $('#followuptextarearemarks').val(this.followsectionname);
      followdate = this.todaysdateforcompare;
      followtime = this.currenttime;
      followuptextarearemarks = this.followsectionname;
    } else {
      followdate = $('#folloupdate').val();
      followtime = $('#followuptime').val();
      followuptextarearemarks = $('#followuptextarearemarks').val();
    }

    var leadstage = $('#sectionselector').val();
    var leadid = this.leadId;
    var userid = localStorage.getItem('UserId');
    var username = localStorage.getItem('Name');

    if (this.currentstage !== 'Fresh') {
      if (this.stagestatusapi == '1') {
        this.stagestatus = '1';
      } else if (this.stagestatusapi == '2') {
        this.stagestatus = '2';
      } else if (this.stagestatusapi == '3') {
        this.stagestatus = '3';
      }
    } else {
      if (this.stagestatusapi == null) {
        this.stagestatus = '0';
      } else {
        this.stagestatus = this.stagestatusapi;
      }
    }
    let followexecutiveId: any;
    if (this.userid == 1) {
      followexecutiveId = this.selectedExecId;
    } else {
      followexecutiveId = this.selectedExecId;
    }
    var dateformatchange = new Date(followdate).toDateString();
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Followup fixed restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with Followup Fixing
      if ($('#sectionselector').val() == 'USV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
        var followupscommon = {
          leadid: leadid,
          actiondate: followdate,
          actiontime: followtime,
          leadstatus: leadstage,
          stagestatus: '3',
          followupsection: this.followsectiondata,
          followupremarks: followuptextarearemarks,
          userid: userid,
          assignid: followexecutiveId,
          property: propIds,
          autoremarks:
            ' Set the next followup on - ' +
            dateformatchange +
            ' ' +
            followtime,
          feedback: this.feedbackID,
          categoryid: this.categoryid,
        };
        if (this.followsectiondata == '') {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          });
        } else {
          $('#followupsection').removeAttr('style');
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the USV of ' +
              propnames +
              ', because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the USV of ' +
              propnames +
              ' but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit after the USV of ' +
              propnames +
              '';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the USV - ' +
              this.followsectionname;
          }

          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var usvfinalremarks = 'USV Done';

          // parameters & API Submissions for the property sitevisit update

          // parameters & API Submissions for the property sitevisit update

          var leadusvdoneparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'USV',
            stagestatus: '3',
            textarearemarks: usvfinalremarks,
            userid: userid,
            assignid: followexecutiveId,
            autoremarks: this.autoremarks,
            property: propIds,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          for (const existingObject of allValuesExist) {
            var visitparam = {
              leadid: this.leadId,
              closedate: visiteddate,
              closetime: visitedtime,
              stage: 'USV',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: followexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice.retailpropertyvisitupdate(visitparam).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                }
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          }

          this._retailservice.addleadhistoryretail(leadusvdoneparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice
                  .addretailfollowup(followupscommon)
                  .subscribe(
                    (success) => {
                      if (success['status'] == 'True') {
                        this._retailservice
                          .updatehotwarmcold(this.selectedPriority, this.leadId)
                          .subscribe((resp) => {
                            if (resp['status'] == 'True') {
                              Swal.fire({
                                title: 'Followup Fixed Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                heightAuto: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  location.reload();
                                }
                              });
                            }
                          });
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // USV DONE with Followup Fixing

      // SV DONE with Followup Fixing
      else if ($('#sectionselector').val() == 'SV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
        var followupscommon = {
          leadid: leadid,
          actiondate: followdate,
          actiontime: followtime,
          leadstatus: leadstage,
          stagestatus: '3',
          followupsection: this.followsectiondata,
          followupremarks: followuptextarearemarks,
          userid: userid,
          assignid: followexecutiveId,
          property: propIds,
          autoremarks:
            ' Set the next followup on - ' +
            dateformatchange +
            ' ' +
            followtime,
          feedback: this.feedbackID,
          categoryid: this.categoryid,
        };

        if (this.followsectiondata == '') {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          });
        } else {
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the SV, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the SV but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the SV but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the SV but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the SV but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the SV but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the SV but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the SV - ' +
              this.followsectionname;
          }

          var visiteddate = $('#SVvisiteddate').val();
          var visitedtime = $('#SVvisitedtime').val();
          var svfinalremarks = 'SV Done';

          var leadsvdoneparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'SV',
            stagestatus: '3',
            textarearemarks: svfinalremarks,
            userid: userid,
            assignid: followexecutiveId,
            autoremarks: this.autoremarks,
            property: propIds,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };

          for (const existingObject of allValuesExist) {
            var visitparam = {
              leadid: this.leadId,
              closedate: visiteddate,
              closetime: visitedtime,
              stage: 'SV',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: followexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice.retailpropertyvisitupdate(visitparam).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                }
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          }

          this._retailservice.addleadhistoryretail(leadsvdoneparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice
                  .addretailfollowup(followupscommon)
                  .subscribe(
                    (success) => {
                      if (success['status'] == 'True') {
                        Swal.fire({
                          title: 'Followup Updated Successfully',
                          text: 'Please check your followup bucket for the Lead reminders',
                          icon: 'success',
                          heightAuto: false,
                          confirmButtonText: 'OK!',
                        }).then((result) => {
                          if (result.value) {
                            this.modalController.dismiss();
                            //  const currentParams = this.activeroute.snapshot.queryParams;
                            //            this.router.navigate([], {
                            //             relativeTo: this.activeroute,
                            //             queryParams: {
                            //               ...currentParams,
                            //               stageForm: 'onleadStatus'
                            //             },
                            //             queryParamsHandling: 'merge'
                            //           });
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
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // SV DONE with Followup Fixing

      // RSV DONE with Followup Fixing
      else if ($('#sectionselector').val() == 'RSV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        var followupscommon = {
          leadid: leadid,
          actiondate: followdate,
          actiontime: followtime,
          leadstatus: leadstage,
          stagestatus: '3',
          followupsection: this.followsectiondata,
          followupremarks: followuptextarearemarks,
          userid: userid,
          assignid: followexecutiveId,
          property: propIds,
          autoremarks:
            ' Set the next followup on - ' +
            dateformatchange +
            ' ' +
            followtime,
          feedback: this.feedbackID,
          categoryid: this.categoryid,
        };
        if (this.followsectiondata == '') {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          });
        } else {
          $('#followupsection').removeAttr('style');

          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the RSV, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the RSV - ' +
              this.followsectionname;
          }
          // parameters & API Submissions for the property sitevisit update
          var visitedparam = {
            leadid: this.leadId,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: $('#visitupdate').val(),
            remarks: $('#propertyremarks').val(),
            stage: 'RSV',
          };
          // parameters & API Submissions for the property sitevisit update

          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();
          var rsvfinalremarks = 'RSV Done';

          var leadrsvdoneparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'RSV',
            stagestatus: '3',
            textarearemarks: rsvfinalremarks,
            userid: userid,
            assignid: followexecutiveId,
            autoremarks: this.autoremarks,
            property: propIds,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          for (const existingObject of allValuesExist) {
            var visitparam = {
              leadid: this.leadId,
              closedate: visiteddate,
              closetime: visitedtime,
              stage: 'RSV',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: followexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            console.log(visitparam);

            this._retailservice.retailpropertyvisitupdate(visitparam).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                }
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          }

          this._retailservice.addleadhistoryretail(leadrsvdoneparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice
                  .addretailfollowup(followupscommon)
                  .subscribe(
                    (success) => {
                      if (success['status'] == 'True') {
                        this._retailservice
                          .updatehotwarmcold(this.selectedPriority, this.leadId)
                          .subscribe((resp) => {
                            if (resp['status'] == 'True') {
                              Swal.fire({
                                title: 'Followup Fixed Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                heightAuto: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  location.reload();
                                }
                              });
                            }
                          });
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // RSV DONE with Followup Fixing

      // NEGOTIATION DONE with Followup Fixing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        var followupscommon = {
          leadid: leadid,
          actiondate: followdate,
          actiontime: followtime,
          leadstatus: leadstage,
          stagestatus: '3',
          followupsection: this.followsectiondata,
          followupremarks: followuptextarearemarks,
          userid: userid,
          assignid: followexecutiveId,
          property: propIds,
          autoremarks:
            ' Set the next followup on - ' +
            dateformatchange +
            ' ' +
            followtime,
          feedback: this.feedbackID,
          categoryid: this.categoryid,
        };

        if (this.followsectiondata == '') {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          });
        } else {
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the Finalnegotiation, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the Finalnegotiation - ' +
              this.followsectionname;
          }

          var negovisitparam = {
            leadid: this.leadId,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: $('#visitupdate').val(),
            remarks: $('#propertyremarks').val(),
            stage: 'Final Negotiation',
          };

          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var negofinalremarks = 'Final Negotiation Finished';

          var leadnegodoneparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'Final Negotiation',
            stagestatus: '3',
            textarearemarks: negofinalremarks,
            userid: userid,
            assignid: followexecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };

          for (const existingObject of allValuesExist) {
            var visitparam = {
              leadid: this.leadId,
              closedate: visiteddate,
              closetime: visitedtime,
              stage: 'Final Negotiation',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: followexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice.retailpropertyvisitupdate(visitparam).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                }
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
          }

          this._retailservice.addleadhistoryretail(leadnegodoneparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice
                  .addretailfollowup(followupscommon)
                  .subscribe(
                    (success) => {
                      if (success['status'] == 'True') {
                        this._retailservice
                          .updatehotwarmcold(this.selectedPriority, this.leadId)
                          .subscribe((resp) => {
                            if (resp['status'] == 'True') {
                              Swal.fire({
                                title: 'Followup Fixed Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                heightAuto: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  location.reload();
                                }
                              });
                            }
                          });
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // NEGOTIATION DONE with Followup Fixing

      // Direct Followup Fixing
      else {
        if (this.followsectiondata == '') {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          });
        } else {
          $('#followupsection').removeAttr('style');

          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' Changed the status to Followup, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client but, client didnt pick the call. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client but, number is swtiched off. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client but, number is not connecting. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client but, number is busy. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client but, client is not answering the call. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client but, number is in out of coverage area. So Changed the status to Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' Changed the status to Followup, Need to callback the client for fix the sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup - ' + this.followsectionname;
          }

          var followups = {
            leadid: leadid,
            actiondate: followdate,
            actiontime: followtime,
            leadstatus: this.currentstage,
            stagestatus: this.stagestatus,
            followupsection: this.followsectiondata,
            followupremarks: followuptextarearemarks,
            userid: userid,
            assignid: followexecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          console.log(followups);
          this._retailservice.addfollowuphistory(followups).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice
                  .updatehotwarmcold(this.selectedPriority, this.leadId)
                  .subscribe((resp) => {
                    if (resp['status'] == 'True') {
                      Swal.fire({
                        title: 'Followup Fixed Successfully',
                        text: 'Please check your followup bucket for the Lead reminders',
                        icon: 'success',
                        heightAuto: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        if (result.value) {
                          location.reload();
                        }
                      });
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
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.followupTime) {
      const [time, modifier] = this.followupTime.split(' ');
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
      this.followupTime = '';
      $('#closedtime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closeAlert() {
    Swal.close();
  }

  selectedPriority: string = '';

  setPriority(value: string) {
    this.selectedPriority = this.selectedPriority === value ? '' : value;
  }
}
