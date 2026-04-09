import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, IonPopover, ModalController } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import Swal from 'sweetalert2';
// import { LeadassignedDetailsComponent } from '../leadassigned-details/leadassigned-details.component';
import { UsvformComponent } from '../usvform/usvform.component';
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
  selector: 'app-svform',
  templateUrl: './svform.component.html',
  styleUrls: ['./svform.component.scss'],
})
export class SvformComponent implements OnInit, AfterViewChecked {
  @Output() openModal = new EventEmitter<void>();
  @Input() selectedSuggestedProp: any;
  @Input() selectedExecId: any;
  @Input() selectedBtn: any;
  date: String = new Date().toISOString();
  @ViewChild('popover') popover: IonPopover;
  svDate;
  svTime;
  svRemark;
  buttonhiders = true;
  svreFix = false;
  svDone = false;
  svFixed = true;
  junkform = false;
  junk = false;
  followform = false;
  followup = false;
  followdownform = false;
  followupdown = false;
  hidebeforefixed = false;
  leadId;
  userid;
  executeid: any;
  svexecutiveId: any;
  othersvisitedlists: any;
  activestagestatus: any;
  hideafterfixed = true;
  showSpinner = true;
  properties: any;
  selectedpropertylists: any;
  selectedlists: any;
  suggestchecked = '';
  suggestedpropertylists: any;
  nonsuggestedpropertylists: any;
  visitedpropertylists: any;
  cancelledpropertylists: any;
  excludedIds: number[] = [];
  username: string;
  autoremarks: string;
  selectedproperty_commaseperated: any;
  hasOnlySpaces: boolean;
  selectedItem = 0;
  visitedprop: visitedproperties[] = [];
  autolocksession = true;
  lockedsession = false;
  categoryid: any;

  constructor(
    private activeroute: ActivatedRoute,
    private _retailservice: CpApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) {}

  assignedRM;
  feedbackID = '';
  ngOnInit() {
    this.activeroute.queryParams.subscribe((params) => {
      const paramMap = params['leadId'];
      this.leadId = params['leadId'];
      this.categoryid = params['categoryid'];
      if (params['feedback']) {
        this.feedbackID = params['feedback'];
      } else {
        this.feedbackID = '';
      }
      const isEmpty = !paramMap;
      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');
      if ('propertyloops' in localStorage) {
        this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
      } else {
        this.excludedIds = [0];
      }
      if (!isEmpty) {
        let rmid;
        if (this.feedbackID == '1') {
          rmid = this.selectedExecId;
        } else {
          rmid = this.userid;
        }
        this._retailservice
          .getassignedrmretail(
            this.leadId,
            rmid,
            this.feedbackID,
            this.categoryid
          )
          .pipe(
            switchMap((cust) => {
              this.showSpinner = false;
              this.executeid = cust['RMname'][0].executiveid;
              if (this.userid == '1') {
                this.svexecutiveId = this.selectedExecId;
              } else {
                this.svexecutiveId = this.selectedExecId;
              }

              this.assignedRM = cust['RMname'].filter((lead) => {
                return lead.RMID == this.selectedExecId;
              });
              this.loadimportantapi();

              //First, get the visit property others
              return this.svexecutiveId
                ? this._retailservice.getvisitpropertyothers(
                    this.leadId,
                    this.userid,
                    this.svexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            }),
            switchMap((visitedwithothers) => {
              this.othersvisitedlists = visitedwithothers['visitedothers'];

              // Then, get the active leads status
              return this.svexecutiveId
                ? this._retailservice.getactiveleadsstatus(
                    this.leadId,
                    this.userid,
                    this.svexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            })
          )
          .subscribe((stagestatus) => {
            this.showSpinner = false;
            this.cdr.detectChanges();
            if (stagestatus) {
              this.activestagestatus = stagestatus['activeleadsstatus'];
              if (
                this.activestagestatus[0].stage == 'SV' &&
                this.activestagestatus[0].stagestatus == '1'
              ) {
                this.hideafterfixed = false;
                this.svFixed = false;
                this.hidebeforefixed = true;
                this.svreFix = false;
                this.svDone = true;
                $('#sectionselector').val('SV');
              } else if (
                this.activestagestatus[0].stage == 'SV' &&
                this.activestagestatus[0].stagestatus == '2'
              ) {
                this.hideafterfixed = false;
                this.svFixed = false;
                this.hidebeforefixed = true;
                this.svreFix = false;
                this.svDone = true;
                $('#sectionselector').val('SV');
              } else if (
                this.activestagestatus[0].stage == 'SV' &&
                this.activestagestatus[0].stagestatus == '3'
              ) {
                this.hideafterfixed = true;
                this.hidebeforefixed = false;
                this.svDone = false;
                this.svFixed = true;
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
      assignid: this.svexecutiveId,
      stage: 'SV',
      feedback: this.feedbackID,
    };
    this._retailservice
      .svselectpropertiesretail(param)
      .subscribe((selectsuggested) => {
        this.showSpinner = false;
        this.selectedpropertylists = selectsuggested['selectedsvlists'];
        this.selectedlists = selectsuggested;
        this.suggestchecked = this.selectedpropertylists
          ?.map((item) => {
            return item.propid;
          })
          .join(',');
      });

    this._retailservice.getsuggestedproperties(param).subscribe((suggested) => {
      this.showSpinner = false;
      this.suggestedpropertylists = suggested['suggestedlists'];
    });

    this._retailservice
      .getnonselectedpropertiesretail(param)
      .subscribe((suggested) => {
        this.showSpinner = false;
        this.nonsuggestedpropertylists = suggested['nonselectedlists'];
      });

    this._retailservice
      .getvisitedsuggestpropertiesretail(param)
      .subscribe((visitsuggested) => {
        this.showSpinner = false;
        this.visitedpropertylists = visitsuggested['visitedlists'];
      });

    this._retailservice
      .getcancelledsuggestpropertiesretail(param)
      .subscribe((cancelsuggested) => {
        this.showSpinner = false;
        this.cancelledpropertylists = cancelsuggested['cancelledlists'];
      });

    var params = {
      leadid: this.leadId,
      execid: this.userid,
    };

    this._retailservice.propertylist(params).subscribe((propertylist) => {
      this.showSpinner = false;
      this.properties = propertylist;
    });
  }

  // to open suggested prop modal present in parent component
  notifyParent() {
    this.openModal.emit();
  }

  ngAfterViewChecked() {
    if (this._retailservice.isCloseSuggModal) {
      // this.loadimportantapi();
      var param = {
        leadid: this.leadId,
        execid: this.userid,
        assignid: this.svexecutiveId,
        stage: 'SV',
        feedback: this.feedbackID,
      };
      this._retailservice
        .getsuggestedproperties(param)
        .subscribe((suggested) => {
          this.suggestedpropertylists = suggested['suggestedlists'];
        });
      this._retailservice.isCloseSuggModal = false;
    }
  }

  // Selecting the suggested properties for fix the SV
  selectsuggested(i, id, propname) {
    if ($('#svcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programming1']:checked")
        .map(function () {
          return (this as HTMLInputElement).value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for SV while fixing the meeting.';
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'SV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the SV scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'SV',
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice
            .svselectpropertiesretail(param)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedsvlists'];
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
  // Selecting the suggested properties for fix the SV

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

  //when click on date, popup of datepicker closed after selecting date
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  // to test whether the text area input contain only space
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.svRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.svRemark);
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.svDate = selectedDate.toLocaleDateString('en-CA');
  }

  onsvDone() {
    this.svDate = '';
    this.svTime = '';
    this.svRemark = '';
    this.svFixed = false;
    this.svreFix = false;
    this.svDone = true;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    $('#sectionselector').val('SV');
  }

  onsvreFix() {
    this.svDate = '';
    this.svTime = '';
    this.svRemark = '';
    this.svreFix = true;
    this.svFixed = false;
    this.svDone = false;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    var param = {
      leadid: this.leadId,
      execid: this.userid,
      assignid: this.svexecutiveId,
      stage: 'SV',
    };
  }

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
    } else {
      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: "SV",
      //   execid: this.userid,
      // }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the SV scheduled lists.';
      // this._retailservice.removeselectedproperties(param2).subscribe((success) => {
      //   var param = {
      //     leadid: this.leadId,
      //     execid: this.userid,
      //     stage:  "SV",
      //     assignid:this.svexecutiveId
      //   }
      //   this._retailservice.svselectpropertiesretail(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedsvlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    }
  }
  //  @ViewChild('childComponent') child!: LeadassignedDetailsComponent;
  @ViewChild('usvComponent') usvDoneModel!: UsvformComponent;
  svfixing() {
    // Common Elements
    var nextdate = $('#svnextactiondate').val() as string;
    var nexttime = $('#svnextactiontime').val() as string;
    var textarearemarks = $('#svtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    // Common Elements
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing SV is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with SV Fixing
      if ($('#customer_phase4').val() == 'USV') {
        var allValuesExist;
        if (firstArray.length === 0) {
          allValuesExist = secondArray;
        } else {
          allValuesExist = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
        }
        // const propIds = allValuesExist.map((obj) => obj.propid).join(",");
        // const propnames = allValuesExist.map((obj) => obj.prop_name).join(",");
        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the Sitevisit',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var usvfinalremarks = 'USV Done';
          var weekplan = '';

          if (visiteddate) {
            var dateObject = new Date(visiteddate);
            if (!isNaN(dateObject.getTime())) {
              // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
              var dayNumber = dateObject.getDay();
              if (dayNumber == 0 || dayNumber == 6) {
                weekplan = '2';
              } else {
                weekplan = '1';
              }
            } else {
              console.error('Invalid date format:', visiteddate);
            }
          }
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
              assignid: this.svexecutiveId,
              feedback: this.feedbackID,
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
          var param = {
            leadid: this.leadId,
            nextdate: nextdate,
            nexttime: nexttime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice.addsvselectedproperties(param).subscribe(
            (success) => {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
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
                      ' Changed the status to SV after Successfully completed USV';
                    var leadusvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'USV',
                      stagestatus: '3',
                      textarearemarks: usvfinalremarks,
                      userid: this.userid,
                      assignid: this.svexecutiveId,
                      autoremarks: this.autoremarks,
                      weekplan: weekplan,
                      property: this.excludedIds,
                      feedback: this.feedbackID,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadusvdoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.autoremarks =
                              'Scheduled the SV for ' +
                              this.selectedproperty_commaseperated +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              nexttime;
                            var leadsvfixparam = {
                              leadid: this.leadId,
                              closedate: nextdate,
                              closetime: nexttime,
                              leadstage: 'SV',
                              stagestatus: '1',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.svexecutiveId,
                              weekplan: '',
                              autoremarks: this.autoremarks,
                              property: this.suggestchecked,
                              feedback: this.feedbackID,
                            };

                            this._retailservice
                              .addleadhistoryretail(leadsvfixparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    $('#svnextactiondate').val('');
                                    $('#svnextactiontime').val('');
                                    $('#customer_phase4').val('');
                                    $('#svtextarearemarks').val('');
                                    Swal.fire({
                                      title: 'SV Fixed Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        location.reload();
                                        // const currentParams = this.activeroute.snapshot.queryParams;
                                        // this.router.navigate([], {
                                        // relativeTo: this.activeroute,
                                        // queryParams: {
                                        //   ...currentParams,
                                        //   stageForm: 'onleadStatus'
                                        // },
                                        // queryParamsHandling: 'merge'
                                        // });
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
                  } else {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Some error Occured..! ',
                      icon: 'error',
                      allowOutsideClick: false,
                      heightAuto: false,
                      confirmButtonText: 'Try Again..!',
                    }).then(() => {
                      this.svfixing();
                    });
                  }
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // USV DONE with SV Fixing

      // DIRECT SV Fixing
      else if ($('#customer_phase4').val() == 'SV') {
        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the Sitevisit',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          var param = {
            leadid: this.leadId,
            nextdate: nextdate,
            nexttime: nexttime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this.showSpinner = true;
          this._retailservice.addsvselectedproperties(param).subscribe(
            (success) => {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
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
                      'Scheduled the SV for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      nexttime;
                    var leadsvfixparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'SV',
                      stagestatus: '1',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      assignid: this.svexecutiveId,
                      property: '',
                      weekplan: '',
                      autoremarks: this.autoremarks,
                      feedback: this.feedbackID,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadsvfixparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            $('#subsvnextactiondate').val('');
                            $('#subsvnextactiontime').val('');
                            $('#customer_phase4').val('');
                            $('#subsvtextarearemarks').val('');
                            Swal.fire({
                              title: 'SV Fixed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              this.modalController.dismiss();
                              //  const currentParams = this.activeroute.snapshot.queryParams;
                              //     this.router.navigate([], {
                              //     relativeTo: this.activeroute,
                              //     queryParams: {
                              //       ...currentParams,
                              //       stageForm: 'onleadStatus'
                              //     },
                              //     queryParamsHandling: 'merge'
                              //     });
                              location.reload();
                            });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  } else {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Some error Occured..! ',
                      icon: 'error',
                      allowOutsideClick: false,
                      heightAuto: false,
                      confirmButtonText: 'Try Again..!',
                    }).then(() => {
                      this.svfixing();
                    });
                  }
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // DIRECT SV Fixing

      // RSV DONE with SV Fixing
      else if ($('#customer_phase4').val() == 'RSV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the Sitevisit',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();

          if (visiteddate) {
            var dateObject = new Date(visiteddate);
            if (!isNaN(dateObject.getTime())) {
              // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
              var dayNumber = dateObject.getDay();
              if (dayNumber == 0 || dayNumber == 6) {
                weekplan = '2';
              } else {
                weekplan = '1';
              }
            } else {
              console.error('Invalid date format:', visiteddate);
            }
          }
          var rsvfinalremarks = 'RSV Done';
          this.showSpinner = true;
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
              assignid: this.svexecutiveId,
              feedback: this.feedbackID,
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

          var param = {
            leadid: this.leadId,
            nextdate: nextdate,
            nexttime: nexttime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };

          this._retailservice.addsvselectedproperties(param).subscribe(
            (success) => {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
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
                      ' Changed the status to SV after Successfully completed RSV';
                    var leadrsvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'RSV',
                      stagestatus: '3',
                      textarearemarks: rsvfinalremarks,
                      userid: this.userid,
                      assignid: this.svexecutiveId,
                      autoremarks: this.autoremarks,
                      weekplan: weekplan,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadrsvdoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.autoremarks =
                              'Scheduled the SV for ' +
                              this.selectedproperty_commaseperated +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              nexttime;
                            var leadsvfixparam = {
                              leadid: this.leadId,
                              closedate: nextdate,
                              closetime: nexttime,
                              leadstage: 'SV',
                              stagestatus: '1',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.svexecutiveId,
                              weekplan: '',
                              autoremarks: this.autoremarks,
                              property: this.suggestchecked,
                              feedback: this.feedbackID,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadsvfixparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    $('#svnextactiondate').val('');
                                    $('#svnextactiontime').val('');
                                    $('#customer_phase4').val('');
                                    $('#svtextarearemarks').val('');
                                    Swal.fire({
                                      title: 'SV Fixed Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        // const currentParams = this.activeroute.snapshot.queryParams;
                                        // this.router.navigate([], {
                                        // relativeTo: this.activeroute,
                                        // queryParams: {
                                        //   ...currentParams,
                                        //   stageForm: 'onleadStatus'
                                        // },
                                        // queryParamsHandling: 'merge'
                                        // });
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
                  } else {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Some error Occured..! ',
                      icon: 'error',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'Try Again..!',
                    }).then(() => {
                      this.svfixing();
                    });
                  }
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // RSV DONE with SV Fixing

      // NEGOTIATION DONE with SV Fixing
      else if ($('#customer_phase4').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the SV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          if (visiteddate) {
            var dateObject = new Date(visiteddate);
            if (!isNaN(dateObject.getTime())) {
              // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
              var dayNumber = dateObject.getDay();
              if (dayNumber == 0 || dayNumber == 6) {
                weekplan = '2';
              } else {
                weekplan = '1';
              }
            } else {
              console.error('Invalid date format:', visiteddate);
            }
          }

          var negofinalremarks = 'Final Negotiation Finished';
          this.showSpinner = true;
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
              assignid: this.svexecutiveId,
              feedback: this.feedbackID,
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
          var param = {
            leadid: this.leadId,
            nextdate: nextdate,
            nexttime: nexttime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice.addsvselectedproperties(param).subscribe(
            (success) => {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
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
                      ' Changed the status to SV after Successfully completed Final negotiation';
                    var leadnegodoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '3',
                      textarearemarks: negofinalremarks,
                      userid: this.userid,
                      weekplan: weekplan,
                      assignid: this.svexecutiveId,
                      autoremarks: this.autoremarks,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadnegodoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.autoremarks =
                              'Scheduled the SV for ' +
                              this.selectedproperty_commaseperated +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              nexttime;
                            var leadsvfixparam = {
                              leadid: this.leadId,
                              closedate: nextdate,
                              closetime: nexttime,
                              leadstage: 'SV',
                              stagestatus: '1',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.svexecutiveId,
                              weekplan: '',
                              autoremarks: this.autoremarks,
                              property: this.suggestchecked,
                              feedback: this.feedbackID,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadsvfixparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    $('#svnextactiondate').val('');
                                    $('#svnextactiontime').val('');
                                    $('#customer_phase4').val('');
                                    $('#svtextarearemarks').val('');
                                    Swal.fire({
                                      title: 'SV Fixed Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      this.modalController.dismiss();
                                      //  const currentParams = this.activeroute.snapshot.queryParams;
                                      // this.router.navigate([], {
                                      // relativeTo: this.activeroute,
                                      // queryParams: {
                                      //   ...currentParams,
                                      //   stageForm: 'onleadStatus'
                                      // },
                                      // queryParamsHandling: 'merge'
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
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  } else {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Some error Occured..! ',
                      icon: 'error',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'Try Again..!',
                    }).then(() => {
                      this.svfixing();
                    });
                  }
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // NEGOTIATION DONE with SV Fixing
    }
  }

  svrefixing() {
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
      var userid = localStorage.getItem('UserId');
      var param = {
        leadid: this.leadId,
        nextdate: nextdate,
        nexttime: nexttime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.svexecutiveId,
        feedback: this.feedbackID,
      };
      this.showSpinner = true;
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Re-Fixing SV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._retailservice.addsvselectedpropertiesrefix(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
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
                      ' ReFixed the SV for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      nexttime;
                    var leadsvrefixparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'SV',
                      stagestatus: '2',
                      textarearemarks: textarearemarks,
                      userid: userid,
                      weekplan: '',
                      assignid: this.svexecutiveId,
                      autoremarks: this.autoremarks,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadsvrefixparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            Swal.fire({
                              title: 'SV ReFixed Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              heightAuto: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              if (result.value) {
                                this.modalController.dismiss();
                                //  const currentParams = this.activeroute.snapshot.queryParams;
                                // this.router.navigate([], {
                                // relativeTo: this.activeroute,
                                // queryParams: {
                                //   ...currentParams,
                                //   stageForm: 'onleadStatus'
                                // },
                                // queryParamsHandling: 'merge'
                                // });

                                location.reload();
                              }
                            });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  } else {
                    this.showSpinner = false;
                    Swal.fire({
                      title: 'Some error Occured..! ',
                      icon: 'error',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'Try Again..!',
                    }).then(() => {
                      this.svrefixing();
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

  defaultclick: any;
  buttonclick: any;
  parsedarray = [];
  nextoverride(i) {
    this.buttonclick = i;
    this.defaultclick = i;
    $('.lists').removeClass('active');
    $('.projectlists' + this.defaultclick).trigger('click');
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

  notvisitclick(val, propname, i, last) {
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;
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
        const existingPropIds = this.visitedprop.map((obj) => obj.propid); // Extract existing propIds
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
      this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
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
      this.excludedIds = [0];
    }

    $('.x-circle' + i).removeAttr('style');
    $('.check-circle' + i).css('display', 'block');
    $('#visitUpdate' + i).removeClass('notVisitUpdate');
    $('#visitUpdate' + i).addClass('donevisitUpdate');
  }

  interestclick(val, propname, i) {
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;
    if (this.selectedpropertylists?.length <= '3') {
      $('#extendHeight').css('height', '210px');
    }
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
      } else {
        if (this.visitedprop[existingIndex].remarks == '') {
          this.autolocksession = true;
          this.lockedsession = false;
        } else if (this.visitedprop[existingIndex].remarks == 'NOT Visited') {
          this.autolocksession = true;
          this.lockedsession = false;
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
      this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
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
      this.excludedIds = [0];
    }
    this.proploopArray = this.visitedprop.filter((da) => {
      return da.actionid == 1;
    });
  }

  proploopArray: any;
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
    if (this.selectedpropertylists?.length <= '3') {
      $('#extendHeight').css('height', '210px');
    }
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
      } else {
        if (this.visitedprop[existingIndex].remarks == '') {
          this.autolocksession = true;
          this.lockedsession = false;
        } else if (this.visitedprop[existingIndex].remarks == 'NOT Visited') {
          this.autolocksession = true;
          this.lockedsession = false;
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
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      }
      this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
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
        localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      }
      this.excludedIds = [0];
    }

    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
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

      this.followdownform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.svform = false;

      this.followupdown = false;
      this.svFixedsubbtn = false;
      this.rsvFixed = false;
      this.negofixed = false;
      this.leadclosed = false;
      this.junk = false;

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
        this.followdownform = false;
        this.rsvform = false;
        this.finalnegoform = false;
        this.leadclosedform = false;
        this.junkform = false;
        this.svform = false;

        this.followupdown = false;
        this.svFixedsubbtn = false;
        this.rsvFixed = false;
        this.negofixed = false;
        this.leadclosed = false;
        this.junk = false;
        // return false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
          this.followdownform = false;
          this.rsvform = false;
          this.finalnegoform = false;
          this.leadclosedform = false;
          this.junkform = false;
          this.svform = false;

          this.followupdown = false;
          this.svFixedsubbtn = false;
          this.rsvFixed = false;
          this.negofixed = false;
          this.leadclosed = false;
          this.junk = false;
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
            this.followdownform = false;
            this.rsvform = false;
            this.finalnegoform = false;
            this.leadclosedform = false;
            this.junkform = false;
            this.svform = false;

            this.followupdown = false;
            this.svFixedsubbtn = false;
            this.rsvFixed = false;
            this.negofixed = false;
            this.leadclosed = false;
            this.junk = false;
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
      this.followdownform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.svform = false;

      this.followupdown = false;
      this.svFixedsubbtn = false;
      this.rsvFixed = false;
      this.negofixed = false;
      this.leadclosed = false;
      this.junk = false;
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
        this.followdownform = false;
        this.rsvform = false;
        this.finalnegoform = false;
        this.leadclosedform = false;
        this.junkform = false;
        this.svform = false;

        this.followupdown = false;
        this.svFixedsubbtn = false;
        this.rsvFixed = false;
        this.negofixed = false;
        this.leadclosed = false;
        this.junk = false;
        // return false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
          this.followdownform = false;
          this.rsvform = false;
          this.finalnegoform = false;
          this.leadclosedform = false;
          this.junkform = false;
          this.svform = false;

          this.followupdown = false;
          this.svFixedsubbtn = false;
          this.rsvFixed = false;
          this.negofixed = false;
          this.leadclosed = false;
          this.junk = false;
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
            this.followdownform = false;
            this.rsvform = false;
            this.finalnegoform = false;
            this.leadclosedform = false;
            this.junkform = false;
            this.svform = false;

            this.followupdown = false;
            this.svFixedsubbtn = false;
            this.rsvFixed = false;
            this.negofixed = false;
            this.leadclosed = false;
            this.junk = false;
          }
        }
        $('.x-circle' + i).removeAttr('style');
        $('.check-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('notVisitUpdate');
        $('#visitUpdate' + i).addClass('donevisitUpdate');
      }
    }
  }
  showDiv = {
    previous: true,
  };
  svFixedsubbtn = false;
  svform = false;
  rsvform = false;
  rsvFixed = false;
  finalnegoform = false;
  negofixed = false;
  leadclosedform = false;
  leadclosed = false;

  followupdownbtn() {
    this.showDiv.previous = !this.showDiv.previous;
    this.followdownform = true;
    this.followupdown = true;
    // this.followupdown = !this.followupdown;
    this.svFixedsubbtn = false;
    this.svform = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
  }

  onsvFixedmodal() {
    this.svDate = '';
    this.svTime = '';
    this.svRemark = '';
    this.rsvform = false;
    this.rsvFixed = false;
    this.leadclosed = false;
    this.svform = true;
    this.svFixed = true;
    this.svFixedsubbtn = true;
    this.leadclosedform = false;
    this.svreFix = false;
    this.leadclosedform = false;
    this.svDone = false;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    if ('propertyloops' in localStorage) {
      this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
    } else {
      this.excludedIds = [0];
    }
    var param = {
      leadid: this.leadId,
      execid: this.userid,
      assignid: this.svexecutiveId,
      stage: 'SV',
      feedback: this.feedbackID,
    };
    this._retailservice.getsuggestedproperties(param).subscribe((suggested) => {
      this.suggestedpropertylists = suggested['suggestedlists'];
    });
  }

  onrsvFixed() {
    this.rsvform = true;
    this.rsvFixed = true;
    this.svFixed = false;
    this.svFixedsubbtn = false;
    this.svform = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
    this.followdownform = false;
    this.followupdown = false;
  }
  onnegofixed() {
    this.finalnegoform = true;
    this.negofixed = true;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svform = false;
    this.svFixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
    this.followdownform = false;
    this.followupdown = false;
    this.svFixedsubbtn = false;
  }

  onleadclosed() {
    this.leadclosedform = true;
    this.leadclosed = true;
    this.finalnegoform = false;
    this.negofixed = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svform = false;
    this.svFixed = false;
    this.junkform = false;
    this.junk = false;
    this.followdownform = false;
    this.followupdown = false;
    this.svFixedsubbtn = false;
  }
  onjunk() {
    this.junkform = true;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;

    this.svFixed = false;
    this.svreFix = false;
    this.svDone = false;

    this.followup = false;
    this.leadclosedform = false;
    this.leadclosed = false;

    this.rsvFixed = false;
    this.svFixedsubbtn = false;
  }

  selectsuggestedsub(i, id, propname) {
    if ($('#subsvcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programmingsub']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for SV while fixing the meeting.';
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'SV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the SV scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'SV',
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice
            .svselectpropertiesretail(param)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedsvlists'];
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

  svdonewithfixing() {
    var nextdate = $('#subsvnextactiondate').val();
    var nexttime = $('#subsvnextactiondate').val();
    var textarearemarks = $('#subsvtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    var allValuesExist;
    if (firstArray.length === 0) {
      allValuesExist = secondArray;
    } else {
      allValuesExist = secondArray.filter((obj) =>
        firstArray.includes(obj.propid)
      );
    }

    const propIds = allValuesExist.map((obj) => obj.propid).join(',');
    const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      var visiteddate = $('#SVvisiteddate').val();
      var visitedtime = $('#SVvisitedtime').val();
      var svfinalremarks = 'SV Done';
      var weekplan;
      if (visiteddate) {
        var dateObject = new Date(visiteddate);
        if (!isNaN(dateObject.getTime())) {
          // Get the day of the week as a number (0 for Sunday, 1 for Monday, etc.)
          var dayNumber = dateObject.getDay();
          if (dayNumber == 0 || dayNumber == 6) {
            weekplan = 2;
          } else {
            weekplan = 1;
          }
        } else {
          console.error('Invalid date format:', visiteddate);
        }
      }

      this.showSpinner = true;
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing SV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
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
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
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

        var param = {
          leadid: this.leadId,
          nextdate: nextdate,
          nexttime: nexttime,
          execid: this.userid,
          suggestproperties: this.suggestchecked,
          assignid: this.svexecutiveId,
          feedback: this.feedbackID,
        };
        this._retailservice.addsvselectedproperties(param).subscribe(
          (success) => {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'SV',
              assignid: this.svexecutiveId,
              feedback: this.feedbackID,
            };
            this._retailservice
              .svselectpropertiesretail(param)
              .subscribe((selectsuggested) => {
                if (selectsuggested['status'] === 'True') {
                  this.selectedpropertylists =
                    selectsuggested['selectedsvlists'];
                  this.selectedlists = selectsuggested;
                  // Joining the object values as comma seperated when add the property for the history storing
                  this.selectedproperty_commaseperated =
                    this.selectedpropertylists
                      ?.map((item) => {
                        return item.name;
                      })
                      .join(',');
                  // Joining the object values as comma seperated when add the property for the history storing

                  var userid = localStorage.getItem('UserId');
                  this.autoremarks =
                    ' Changed the status to SV after Successfully completed SV';
                  var leadsvdoneparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'SV',
                    stagestatus: '3',
                    textarearemarks: svfinalremarks,
                    userid: userid,
                    assignid: this.svexecutiveId,
                    autoremarks: this.autoremarks,
                    weekplan: weekplan,
                    property: this.excludedIds,
                    feedback: this.feedbackID,
                  };
                  this._retailservice
                    .addleadhistoryretail(leadsvdoneparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          var nextdate = $('#subsvnextactiondate').val();
                          var nexttime = $('#subsvnextactiontime').val();
                          var textarearemarks = $(
                            '#subsvtextarearemarks'
                          ).val();
                          var dateformatchange = new Date(
                            nextdate
                          ).toDateString();
                          var userid = localStorage.getItem('UserId');

                          this.autoremarks =
                            ' again Scheduled the SV for ' +
                            this.selectedproperty_commaseperated +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            nexttime;
                          var leadsvfixparam = {
                            leadid: this.leadId,
                            closedate: nextdate,
                            closetime: nexttime,
                            leadstage: 'SV',
                            stagestatus: '1',
                            textarearemarks: textarearemarks,
                            userid: userid,
                            assignid: this.svexecutiveId,
                            autoremarks: this.autoremarks,
                            weekplan: '',
                            property: this.suggestchecked,
                            feedback: this.feedbackID,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadsvfixparam)
                            .subscribe(
                              (success) => {
                                if (success['status'] == 'True') {
                                  $('#subsvnextactiondate').val('');
                                  $('#subsvnextactiontime').val('');
                                  $('#customer_phase4').val('');
                                  $('#subsvtextarearemarks').val('');
                                  Swal.fire({
                                    title: 'SV Fixed Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      this.svDoneModel.dismiss();
                                      //  const currentParams = this.activeroute.snapshot.queryParams;
                                      // this.router.navigate([], {
                                      // relativeTo: this.activeroute,
                                      // queryParams: {
                                      //   ...currentParams,
                                      //   stageForm: 'onleadStatus'
                                      // },
                                      // queryParamsHandling: 'merge'
                                      // });
                                      // location.reload();
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
                } else {
                  this.showSpinner = false;
                  Swal.fire({
                    title: 'Some error Occured..!',
                    icon: 'error',
                    allowOutsideClick: false,
                    heightAuto: false,
                    confirmButtonText: 'Try Again..!',
                  }).then(() => {
                    this.svdonewithfixing();
                  });
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

  checkDateTime() {
    if ($('#SVvisitedtime').val() !== '' && $('#SVvisiteddate').val() !== '') {
      return true;
    } else {
      return false;
    }
  }

  moresuggested(i, id, propname) {
    if ($('#moresuggestcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programming']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      // if ($('#SVvisiteddate').val() == "") {
      //   Swal.fire({
      //     title: 'Please select a date',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#moresuggestcheckbox' + i).prop('checked', false);
      //     })
      // }else if($('#SVvisitedtime').val() == ""){
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

      //     var visiteddate = $('#SVvisiteddate').val();
      //     var visitedtime = $('#SVvisitedtime').val();

      //     var param = {
      //     leadid: this.leadId,
      //     nextdate: visiteddate,
      //     nexttime: visitedtime,
      //     execid: this.userid,
      //     suggestproperties: this.suggestchecked,
      //     assignid:this.svexecutiveId
      //     }
      //     this.autoremarks = "added the"+propname+" for SV during the sitevisit.";
      //     this._retailservice.addsvselectedproperties(param).subscribe((success) => {
      //     if(success['status'] == "True"){
      //       this.suggestchecked = "";
      //       var param = {
      //         leadid: this.leadId,
      //         execid: this.userid,
      //         stage:  "SV",
      //         assignid:this.svexecutiveId
      //       }
      //       this._retailservice.svselectpropertiesretail(param).subscribe(selectsuggested => {
      //         this.selectedpropertylists = selectsuggested['selectedsvlists'];
      //         this.selectedlists = selectsuggested;
      //       });
      //     }
      //   }, (err) => {
      //     console.log("Failed to Update");
      //   })
      // }
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'SV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the SV scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'SV',
            assignid: this.svexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice
            .svselectpropertiesretail(param)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedsvlists'];
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

  @ViewChild('svDoneModel', { static: true }) svDoneModel: IonModal;
  openSVDoneModal() {
    var visiteddate = $('#SVvisiteddate').val();
    var visitedtime = $('#SVvisitedtime').val();

    var param = {
      leadid: this.leadId,
      nextdate: visiteddate,
      nexttime: visitedtime,
      execid: this.userid,
      suggestproperties: this.suggestchecked,
      assignid: this.svexecutiveId,
      feedback: this.feedbackID,
    };
    if (visiteddate != '' && visitedtime != '') {
      this._retailservice.addsvselectedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            this.suggestchecked = '';
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'SV',
              assignid: this.svexecutiveId,
              feedback: this.feedbackID,
            };

            this._retailservice
              .svselectpropertiesretail(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists = selectsuggested['selectedsvlists'];
                this.selectedlists = selectsuggested;
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
    this.svDoneModel.present();
  }

  onUpdateBackbutton() {
    this.lockedsession = false;
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;

    this.followupdown = false;
    this.svFixedsubbtn = false;
    this.rsvFixed = false;
    this.negofixed = false;
    this.leadclosed = false;
    this.junk = false;

    this.svFixed = false;
    this.svreFix = false;
    this.svDone = true;
    this.junkform = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    $('#sectionselector').val('SV');
    this.visitedprop = [];
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.svTime) {
      const [time, modifier] = this.svTime.split(' ');
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
      this.svTime = '';
      $('#svnextactiontime').val('');
      $('#refixtime').val('');
      $('#SVvisitedtime').val('');
      $('#subsvnextactiontime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  updateSvDone() {
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        heightAuto: false,
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      this.showSpinner = true;
      var visiteddate = $('#SVvisiteddate').val();
      var visitedtime = $('#SVvisitedtime').val();
      var svfinalremarks = 'SV Done';

      let date = new Date($('#SVvisiteddate').val());
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
        execid: this.userid,
        suggestproperties: this.suggestchecked,
        assignid: this.svexecutiveId,
        feedback: this.feedbackID,
      };
      if (visiteddate != '' && visitedtime != '') {
        this._retailservice.addsvselectedproperties(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              this.suggestchecked = '';
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'SV',
                assignid: this.svexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .svselectpropertiesretail(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedsvlists'];
                    this.selectedlists = selectsuggested;
                    for (const existingObject of this.selectedpropertylists) {
                      var visitparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        stage: 'SV',
                        stagestatus: '4',
                        propid: existingObject['propid'],
                        execid: this.userid,
                        visitupdate: 9,
                        remarks: 'SV Done for' + ' ' + existingObject['name'],
                        accompany: this.svexecutiveId,
                        assignid: this.svexecutiveId,
                        feedback: this.feedbackID,
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
                    this.autoremarks = ' SV Done Successfully';
                    var leadsvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'SV',
                      stagestatus: '1',
                      textarearemarks: svfinalremarks,
                      userid: this.userid,
                      assignid: this.svexecutiveId,
                      autoremarks: this.autoremarks,
                      property: selectedpropertylists.join(','),
                      weekplan: checkedDay,
                      feedback: this.feedbackID,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadsvdoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.showSpinner = false;
                            // let currentUrl = this.router.url;
                            // let pathWithoutQueryParams = currentUrl.split('?')[0];
                            // let currentQueryparams = this.route.snapshot.queryParams;
                            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            //   this.router.navigate([pathWithoutQueryParams], { queryParams: currentQueryparams });
                            // });
                            this.modalController.dismiss();
                            //  const currentParams = this.activeroute.snapshot.queryParams;
                            //   this.router.navigate([], {
                            //   relativeTo: this.activeroute,
                            //   queryParams: {
                            //     ...currentParams,
                            //     stageForm: 'onleadStatus'
                            //   },
                            //   queryParamsHandling: 'merge'
                            //   });
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
}
