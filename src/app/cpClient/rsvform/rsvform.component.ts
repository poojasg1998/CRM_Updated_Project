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
import { IonModal, ModalController } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
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
  selector: 'app-rsvform',
  templateUrl: './rsvform.component.html',
  styleUrls: ['./rsvform.component.scss'],
})
export class RsvformComponent implements OnInit, AfterViewChecked {
  @Output() openModal = new EventEmitter<void>();
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() selectedBtn: any;
  date: String = new Date().toISOString();
  assignedRM: any;
  isEdit: boolean = true;

  buttonhiders = true;
  showSpinner = true;
  hidebeforefixed = false;
  svform = false;
  rsvFixed = true;
  svFixed = false;
  rsvform = false;
  rsvreFix = false;
  rsvDone = false;
  finalnegoform = false;
  leadclosedform = false;
  leadclosed = false;
  negofixed = false;
  junkform = false;
  junk = false;
  followform = false;
  followup = false;
  followdownform = false;
  followupdown = false;
  rsvFixedsubbtn = false;
  rsvDate;
  rsvTime;
  rsvRemark;
  hasOnlySpaces: boolean;
  leadId: string;
  userid: string;
  username: string;
  rsvlocalselection = false;
  rsvpropslocally;
  excludedIds: number[] = [];
  executeid: any;
  rsvexecutiveId: any;
  activestagestatus: any;
  hideafterfixed = true;
  suggestchecked: string;
  visitupdate: string;
  selectedpropertylists: any;
  selectedlists: any;
  visitedpropertylists: any;
  cancelledpropertylists: any;
  autoremarks: string;
  selectedproperty_commaseperated: any;
  selectedItem = 0;
  visitedprop: visitedproperties[] = [];
  autolocksession = true;
  lockedsession = false;
  proploopArray: visitedproperties[];
  categoryid: string;

  constructor(
    private activeroute: ActivatedRoute,
    private _retailservice: CpApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalController: ModalController
  ) {}
  feedbackID = '0';
  ngOnInit() {
    this.activeroute.queryParamMap.subscribe((params) => {
      this.categoryid = params.get('categoryid');
      const paramMap = params.get('leadid');
      this.leadId = params.get('leadid');
      this.feedbackID = params.get('feedback') ? params.get('feedback') : '';
      const isEmpty = !paramMap;
      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');

      if ('propertyloops' in localStorage) {
        const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
        const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

        if (firstArray.length === 0) {
          this.rsvpropslocally = secondArray;
        } else {
          this.rsvpropslocally = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
        }
        this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
        this.rsvlocalselection = true;
      } else {
        this.rsvpropslocally = [0];
        this.excludedIds = [0];
        this.rsvlocalselection = false;
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
              this.executeid = cust['RMname'][0].executiveid;
              if (this.userid == '1') {
                this.rsvexecutiveId = this.selectedExecId;
              } else {
                this.rsvexecutiveId = this.selectedExecId;
              }
              this.assignedRM = cust['RMname'].filter((lead) => {
                return lead.RMID == this.selectedExecId;
              });
              this.loadimportantapi();

              //First, get the visit property others
              return this.rsvexecutiveId
                ? this._retailservice.getactiveleadsstatus(
                    this.leadId,
                    this.userid,
                    this.rsvexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            })
          )
          .subscribe((stagestatus) => {
            if (stagestatus) {
              this.activestagestatus = stagestatus['activeleadsstatus'];
              if (
                this.activestagestatus[0].stage == 'RSV' &&
                this.activestagestatus[0].stagestatus == '1'
              ) {
                this.hideafterfixed = false;
                this.rsvFixed = false;
                this.hidebeforefixed = true;
                if (this.selectedBtn == 'rescheduled') {
                  this.rsvreFix = true;
                  this.rsvDone = false;
                } else if (this.selectedBtn == 'updatevisit') {
                  this.rsvreFix = false;
                  this.rsvDone = true;
                }
                // this.rsvreFix = false;
                // this.rsvDone = true;
                $('#sectionselector').val('RSV');
              } else if (
                this.activestagestatus[0].stage == 'RSV' &&
                this.activestagestatus[0].stagestatus == '2'
              ) {
                this.hideafterfixed = false;
                this.rsvFixed = false;
                this.hidebeforefixed = true;
                if (this.selectedBtn == 'rescheduled') {
                  this.rsvreFix = true;
                  this.rsvDone = false;
                } else if (this.selectedBtn == 'updatevisit') {
                  this.rsvreFix = false;
                  this.rsvDone = true;
                }
                $('#sectionselector').val('RSV');
              } else if (
                this.activestagestatus[0].stage == 'RSV' &&
                this.activestagestatus[0].stagestatus == '3'
              ) {
                this.hideafterfixed = true;
                this.hidebeforefixed = false;
                this.rsvDone = false;
                this.rsvFixed = true;
              } else {
                this.hideafterfixed = true;
              }
            }
            this.showSpinner = false;
          });
      }
      this.suggestchecked = '';
      this.visitupdate = '';
      if (
        $('#sectionselector').val() == 'SV' ||
        $('#sectionselector').val() == 'USV' ||
        $('#sectionselector').val() == 'Final Negotiation'
      ) {
        this.buttonhiders = false;
      } else {
        this.buttonhiders = true;
      }
    });
  }

  loadimportantapi() {
    var param = {
      leadid: this.leadId,
      execid: this.userid,
      assignid: this.rsvexecutiveId,
      stage: 'RSV',
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };

    this._retailservice
      .rsvselectproperties(param)
      .subscribe((selectsuggested) => {
        if (selectsuggested['status'] == 'True') {
          this.selectedpropertylists = selectsuggested['selectedrsvlists'];
          this.selectedlists = selectsuggested;
          this.suggestchecked = this.selectedpropertylists
            ?.map((item) => {
              return item.propid;
            })
            .join(',');
        } else {
          this.selectedpropertylists = [];
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
  }

  // Selecting the suggested properties for Direct fix the RSV
  selectsuggesteddirect(i, id, propname) {
    var rsvvisiteddate = $('#rsvnextactiondate').val();
    var rsvvisitedtime = $('#rsvnextactiontime').val();

    if ($('#rsvcheckboxdirect' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsvdirect']:checked")
        .map(function () {
          return (this as HTMLInputElement).value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: this.suggestchecked,
      //   nextdate: rsvvisiteddate,
      //   nexttime: rsvvisitedtime,
      //   execid: this.userid,
      //   assignid:this.rsvexecutiveId
      // }
      // this._retailservice.addrsvselectedproperties(param2).subscribe((success) => {
      //   var param = {
      //     leadid: this.leadId,
      //     execid: this.userid,
      //     stage:  "RSV",
      //     assignid:this.rsvexecutiveId
      //   }
      //   this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //   this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //   this.selectedlists = selectsuggested;
      //   // Joining the object values as comma seperated when remove the property for the history storing
      //   this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //   // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    } else {
      // var param = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: "RSV",
      //   execid: this.userid,
      //   }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      // this._retailservice.removeselectedproperties(param).subscribe((success) => {
      //   if(success['status'] == "True"){
      //     var param = {
      //       leadid: this.leadId,
      //       execid: this.userid,
      //       stage:  "RSV",
      //       assignid:this.rsvexecutiveId
      //     }
      //     this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      //   }
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
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

  // Selecting the suggested properties for Direct fix the RSV
  selectsuggesteddirect2(i, id, propname) {
    var rsvvisiteddate = $('#rsvnextactiondate').val();
    var rsvvisitedtime = $('#rsvnextactiontime').val();

    if ($('#rsvcheckboxdirect2' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsvdirect']:checked")
        .map(function () {
          return (this as HTMLInputElement).value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      // if ($('#rsvnextactiondate').val() === "") {
      //   Swal.fire({
      //     title: 'Please select a date',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#rsvcheckboxdirect2' + i).prop('checked', false);
      //     })
      // }else if($('#rsvnextactiontime').val() == ""){
      //   Swal.fire({
      //     title: 'Please select a time',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#rsvcheckboxdirect2' + i).prop('checked', false);
      //     })
      //   $('#SVvisitedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select One Date');
      // }else{

      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: this.suggestchecked,
      //   nextdate: rsvvisiteddate,
      //   nexttime: rsvvisitedtime,
      //   execid: this.userid,
      //   assignid:this.rsvexecutiveId
      // }
      // this._retailservice.addrsvselectedproperties(param2).subscribe((success) => {
      //   var param = {
      //     leadid: this.leadId,
      //     execid: this.userid,
      //     stage:  "RSV",
      //     assignid:this.rsvexecutiveId
      //   }
      //   this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //   this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //   this.selectedlists = selectsuggested;
      //   // Joining the object values as comma seperated when remove the property for the history storing
      //   this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //   // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
      // }
    } else {
      // var param = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: "RSV",
      //   execid: this.userid,
      //   }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      // this._retailservice.removeselectedproperties(param).subscribe((success) => {
      //   if(success['status'] == "True"){
      //     var param = {
      //       leadid: this.leadId,
      //       execid: this.userid,
      //       stage:  "RSV",
      //       assignid:this.rsvexecutiveId
      //     }
      //       this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      //   }
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    }
  }

  onrsvDone() {
    this.rsvDate = '';
    this.rsvTime = '';
    this.rsvRemark = '';
    this.rsvFixed = false;
    this.rsvreFix = false;
    this.rsvDone = true;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    $('#sectionselector').val('RSV');
  }

  onrsvreFix() {
    this.rsvDate = '';
    this.rsvTime = '';
    this.rsvRemark = '';
    this.rsvFixed = false;
    this.rsvreFix = true;
    this.rsvDone = false;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.rsvDate = selectedDate.toLocaleDateString('en-CA');
  }

  // to open suggested prop modal present in parent component
  notifyParent() {
    this.openModal.emit();
  }

  // to test whether the text area input contain only space
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.rsvRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.rsvRemark);
  }

  refixsuggested(i, id, propname) {
    if ($('#suggestcheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programmingrefix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      let selectedProperties = checkid.split(',');
      var removeduplictaes = Array.from(new Set(selectedProperties));
      this.suggestchecked = removeduplictaes.join(',');
    } else {
      // var param = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: "RSV",
      //   execid: this.userid,
      //   }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      // this._retailservice.removeselectedproperties(param).subscribe((success) => {
      //   if(success['status'] == "True"){
      //     var param = {
      //       leadid: this.leadId,
      //       execid: this.userid,
      //       stage:  "RSV",
      //       assignid:this.rsvexecutiveId
      //     }
      //       this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      //   }
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    }
  }

  // Fixing RSV
  rsvfixing() {
    var nextdate = $('#rsvnextactiondate').val() as string;
    var nexttime = $('#rsvnextactiontime').val();
    var textarearemarks = $('#rsvtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();

    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing RSV is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with RSV Fixing
      if ($('#customer_phase4').val() == 'USV') {
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

        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var nextactiondate = $('#rsvnextactiondate').val();
          var nextactiontime = $('#rsvnextactiontime').val();
          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var usvfinalremarks = 'USV Done';
          var weekplan;
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
          if (localStorage.getItem('Name') == 'demo') {
            Swal.fire({
              title: 'Fixing RSV is restricted for demo accounts',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
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
                assignid: this.rsvexecutiveId,
                feedback: this.feedbackID,
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

            var param = {
              leadid: this.leadId,
              nextdate: nextactiondate,
              nexttime: nextactiontime,
              execid: this.userid,
              suggestproperties: this.suggestchecked,
              assignid: this.rsvexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };

            this._retailservice.addrsvselectedproperties(param).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                  var param2 = {
                    leadid: this.leadId,
                    execid: this.userid,
                    stage: 'RSV',
                    assignid: this.rsvexecutiveId,
                    feedback: this.feedbackID,
                    categoryid: this.categoryid,
                  };
                  this._retailservice
                    .rsvselectproperties(param2)
                    .subscribe((selectsuggested) => {
                      if (selectsuggested['status'] == 'True') {
                        this.selectedpropertylists =
                          selectsuggested['selectedrsvlists'];
                        // Joining the object values as comma seperated when remove the property for the history storing
                        this.selectedproperty_commaseperated =
                          this.selectedpropertylists
                            ?.map((item) => {
                              return item.name;
                            })
                            .join(',');
                        // Joining the object values as comma seperated when remove the property for the history storing

                        this.autoremarks =
                          'Changed the status to RSV after Successfully completed USV';
                        var leadusvdoneparam = {
                          leadid: this.leadId,
                          closedate: visiteddate,
                          closetime: visitedtime,
                          leadstage: 'USV',
                          stagestatus: '3',
                          textarearemarks: usvfinalremarks,
                          userid: this.userid,
                          assignid: this.rsvexecutiveId,
                          autoremarks: this.autoremarks,
                          weekplan: weekplan,
                          property: this.suggestchecked,
                          feedback: this.feedbackID,
                          categoryid: this.categoryid,
                        };
                        this._retailservice
                          .addleadhistoryretail(leadusvdoneparam)
                          .subscribe(
                            (success) => {
                              if (success['status'] == 'True') {
                                this.autoremarks =
                                  ' Scheduled the RSV for ' +
                                  this.selectedproperty_commaseperated +
                                  ' On ' +
                                  dateformatchange +
                                  ' ' +
                                  nexttime;
                                var leadrsvfixparam = {
                                  leadid: this.leadId,
                                  closedate: nextdate,
                                  closetime: nexttime,
                                  leadstage: 'RSV',
                                  stagestatus: '1',
                                  textarearemarks: textarearemarks,
                                  userid: this.userid,
                                  weekplan: '',
                                  assignid: this.rsvexecutiveId,
                                  autoremarks: this.autoremarks,
                                  property: this.suggestchecked,
                                  feedback: this.feedbackID,
                                  categoryid: this.categoryid,
                                };

                                this._retailservice
                                  .addleadhistoryretail(leadrsvfixparam)
                                  .subscribe(
                                    (success) => {
                                      if (success['status'] == 'True') {
                                        this.showSpinner = false;
                                        $('#nextactiondate').val('');
                                        $('#nextactiontime').val('');
                                        $('#customer_phase4').val('');
                                        $('#rsvtextarearemarks').val('');
                                        Swal.fire({
                                          title: 'RSV Fixed Successfully',
                                          icon: 'success',
                                          allowOutsideClick: false,
                                          heightAuto: false,
                                          confirmButtonText: 'OK!',
                                        }).then((result) => {
                                          if (result.value) {
                                            this.modalController.dismiss();
                                            //      const currentParams = this.activeroute.snapshot.queryParams;
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
                                      } else {
                                        this.showSpinner = false;
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
                          this.rsvfixing();
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
      // USV DONE with RSV Fixing

      // SV DONE with RSV Fixing
      else if ($('#customer_phase4').val() == 'SV') {
        // const allValuesExist = secondArray.filter((obj) => firstArray.includes(obj.propid));
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
        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var nextactiondate = $('#rsvnextactiondate').val();
          var nextactiontime = $('#rsvnextactiontime').val();
          var visiteddate = $('#SVvisiteddate').val();
          var visitedtime = $('#SVvisitedtime').val();
          var svfinalremarks = 'SV Done';
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
              assignid: this.rsvexecutiveId,
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

          var param = {
            leadid: this.leadId,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.rsvexecutiveId,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          this._retailservice.addrsvselectedproperties(param).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                var param2 = {
                  leadid: this.leadId,
                  execid: this.userid,
                  stage: 'RSV',
                  assignid: this.rsvexecutiveId,
                  feedback: this.feedbackID,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .rsvselectproperties(param2)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] === 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectedrsvlists'];
                      // Joining the object values as comma seperated when remove the property for the history storing
                      this.selectedproperty_commaseperated =
                        this.selectedpropertylists
                          ?.map((item) => {
                            return item.name;
                          })
                          .join(',');
                      // Joining the object values as comma seperated when remove the property for the history storing

                      this.autoremarks =
                        ' Changed the status to RSV after Successfully completed SV';
                      var leadsvdoneparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        leadstage: 'SV',
                        stagestatus: '3',
                        textarearemarks: svfinalremarks,
                        userid: this.userid,
                        assignid: this.rsvexecutiveId,
                        autoremarks: this.autoremarks,
                        weekplan: weekplan,
                        property: this.suggestchecked,
                        feedback: this.feedbackID,
                      };
                      this._retailservice
                        .addleadhistoryretail(leadsvdoneparam)
                        .subscribe(
                          (success) => {
                            if (success['status'] == 'True') {
                              this.autoremarks =
                                ' Scheduled the RSV for ' +
                                this.selectedproperty_commaseperated +
                                ' On ' +
                                dateformatchange +
                                ' ' +
                                nexttime;
                              var leadrsvfixparam = {
                                leadid: this.leadId,
                                closedate: nextdate,
                                closetime: nexttime,
                                leadstage: 'RSV',
                                stagestatus: '1',
                                textarearemarks: textarearemarks,
                                userid: this.userid,
                                assignid: this.rsvexecutiveId,
                                autoremarks: this.autoremarks,
                                weekplan: '',
                                property: this.suggestchecked,
                                feedback: this.feedbackID,
                              };
                              this._retailservice
                                .addleadhistoryretail(leadrsvfixparam)
                                .subscribe(
                                  (success) => {
                                    if (success['status'] == 'True') {
                                      this.showSpinner = false;
                                      $('#nextactiondate').val('');
                                      $('#nextactiontime').val('');
                                      $('#customer_phase4').val('');
                                      $('#rsvtextarearemarks').val('');
                                      Swal.fire({
                                        title: 'RSV Fixed Successfully',
                                        icon: 'success',
                                        heightAuto: false,
                                        allowOutsideClick: false,
                                        confirmButtonText: 'OK!',
                                      }).then((result) => {
                                        if (result.value) {
                                          this.modalController.dismiss();
                                          //   const currentParams = this.activeroute.snapshot.queryParams;
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
                                    } else {
                                      this.showSpinner = false;
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
                        this.rsvfixing();
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
      // SV DONE with RSV Fixing

      // DIRECT RSV Fixing
      else if ($('#customer_phase4').val() == 'RSV') {
        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var nextactiondate = $('#rsvnextactiondate').val();
          var nextactiontime = $('#rsvnextactiontime').val();

          var param = {
            leadid: this.leadId,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.rsvexecutiveId,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };

          this._retailservice.addrsvselectedproperties(param).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                var param = {
                  leadid: this.leadId,
                  execid: this.userid,
                  stage: 'RSV',
                  assignid: this.rsvexecutiveId,
                  feedback: this.feedbackID,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .rsvselectproperties(param)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] === 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectedrsvlists'];
                      // Joining the object values as comma seperated when remove the property for the history storing
                      this.selectedproperty_commaseperated =
                        this.selectedpropertylists
                          ?.map((item) => {
                            return item.name;
                          })
                          .join(',');
                      // Joining the object values as comma seperated when remove the property for the history storing

                      this.autoremarks =
                        ' Scheduled the RSV for ' +
                        this.selectedproperty_commaseperated +
                        ' On ' +
                        dateformatchange +
                        ' ' +
                        nexttime;
                      var leadrsvfixparam = {
                        leadid: this.leadId,
                        closedate: nextdate,
                        closetime: nexttime,
                        leadstage: 'RSV',
                        stagestatus: '1',
                        textarearemarks: textarearemarks,
                        userid: this.userid,
                        assignid: this.rsvexecutiveId,
                        autoremarks: this.autoremarks,
                        weekplan: '',
                        property: this.suggestchecked,
                        feedback: this.feedbackID,
                      };
                      this._retailservice
                        .addleadhistoryretail(leadrsvfixparam)
                        .subscribe(
                          (success) => {
                            if (success['status'] == 'True') {
                              (this.showSpinner = false),
                                $('#nextactiondate').val('');
                              $('#nextactiontime').val('');
                              $('#customer_phase4').val('');
                              $('#rsvtextarearemarks').val('');
                              Swal.fire({
                                title: 'RSV Fixed Successfully',
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
                            } else {
                              this.showSpinner = false;
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
                        this.rsvfixing();
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
      // DIRECT RSV Fixing

      // NEGOTIATION DONE with RSV Fixing
      else if ($('#customer_phase4').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        if (this.suggestchecked == '' || this.suggestchecked == undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var negofinalremarks = 'Final Negotiation Finished';

          var nextactiondate = $('#rsvnextactiondate').val();
          var nextactiontime = $('#rsvnextactiontime').val();

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
              stage: 'Final Negotiation',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: this.rsvexecutiveId,
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
          var param = {
            leadid: this.leadId,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.rsvexecutiveId,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          this._retailservice.addrsvselectedproperties(param).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                var param = {
                  leadid: this.leadId,
                  execid: this.userid,
                  stage: 'RSV',
                  assignid: this.rsvexecutiveId,
                  feedback: this.feedbackID,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .rsvselectproperties(param)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] === 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectedrsvlists'];
                      // Joining the object values as comma seperated when remove the property for the history storing
                      this.selectedproperty_commaseperated =
                        this.selectedpropertylists
                          ?.map((item) => {
                            return item.name;
                          })
                          .join(',');
                      // Joining the object values as comma seperated when remove the property for the history storing

                      this.autoremarks =
                        'Scheduled the RSV after Successfully completed Final negotiation';
                      var leadnegodoneparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        leadstage: 'Final Negotiation',
                        stagestatus: '3',
                        textarearemarks: negofinalremarks,
                        userid: this.userid,
                        assignid: this.rsvexecutiveId,
                        autoremarks: this.autoremarks,
                        weekplan: weekplan,
                        property: this.suggestchecked,
                        feedback: this.feedbackID,
                      };
                      this._retailservice
                        .addleadhistoryretail(leadnegodoneparam)
                        .subscribe(
                          (success) => {
                            if (success['status'] == 'True') {
                              this.autoremarks =
                                ' Scheduled the RSV for ' +
                                this.selectedproperty_commaseperated +
                                ' On ' +
                                dateformatchange +
                                ' ' +
                                nexttime;
                              var leadrsvfixparam = {
                                leadid: this.leadId,
                                closedate: nextdate,
                                closetime: nexttime,
                                leadstage: 'RSV',
                                stagestatus: '1',
                                textarearemarks: textarearemarks,
                                userid: this.userid,
                                assignid: this.rsvexecutiveId,
                                weekplan: '',
                                autoremarks: this.autoremarks,
                                property: this.suggestchecked,
                                feedback: this.feedbackID,
                              };
                              this._retailservice
                                .addleadhistoryretail(leadrsvfixparam)
                                .subscribe(
                                  (success) => {
                                    if (success['status'] == 'True') {
                                      this.showSpinner = false;
                                      $('#nextactiondate').val('');
                                      $('#nextactiontime').val('');
                                      $('#customer_phase4').val('');
                                      $('#rsvtextarearemarks').val('');
                                      Swal.fire({
                                        title: 'RSV Fixed Successfully',
                                        icon: 'success',
                                        heightAuto: false,
                                        allowOutsideClick: false,
                                        confirmButtonText: 'OK!',
                                      }).then((result) => {
                                        if (result.value) {
                                          this.modalController.dismiss();
                                          //    const currentParams = this.activeroute.snapshot.queryParams;
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
                                    } else {
                                      this.showSpinner = false;
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
                      Swal.fire({
                        title: 'Some error Occured..! ',
                        icon: 'error',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'Try Again..!',
                      }).then(() => {
                        this.rsvfixing();
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
      // NEGOTIATION DONE with RSV Fixing
    }
  }

  // Re Fixing RSV
  rsvrefixing() {
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
      var nextdate = $('#refixdate').val();
      var nexttime = $('#refixtime').val();
      var textarearemarks = $('#refixtextarearemarks').val();
      var dateformatchange = new Date(nextdate).toDateString();
      var param = {
        leadid: this.leadId,
        nextdate: nextdate,
        nexttime: nexttime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.rsvexecutiveId,
        feedback: this.feedbackID,
      };
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Re-Fixing RSV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._retailservice.addrsvselectedrefix(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'RSV',
                assignid: this.rsvexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              this._retailservice
                .rsvselectproperties(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedrsvlists'];
                    // Joining the object values as comma seperated when remove the property for the history storing
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        ?.map((item) => {
                          return item.name;
                        })
                        .join(',');
                    // Joining the object values as comma seperated when remove the property for the history storing

                    this.autoremarks =
                      ' ReFixed the RSV for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      nexttime;
                    var leadrsvrefixparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'RSV',
                      stagestatus: '2',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      assignid: this.rsvexecutiveId,
                      weekplan: '',
                      autoremarks: this.autoremarks,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                      categoryid: this.categoryid,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadrsvrefixparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'RSV Refixed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              if (result.value) {
                                this.cdr.detectChanges();
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
                          } else {
                            this.showSpinner = false;
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
                      this.rsvrefixing();
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

  // Selecting the suggested properties fix the RSV after any stage
  selectsuggesteddone(i, id, propname, property) {
    var rsvvisiteddate = $('#RSVvisiteddate').val();
    var rsvvisitedtime = $('#RSVvisitedtime').val();

    if ($('#rsvcheckboxdone' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsvdone']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      this.selectedpropertylists.push(property);

      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: this.suggestchecked,
      //   nextdate: rsvvisiteddate,
      //   nexttime: rsvvisitedtime,
      //   execid: this.userid,
      //   assignid:this.rsvexecutiveId
      // }
      // this._retailservice.addrsvselectedproperties(param2).subscribe((success) => {
      //   var param = {
      //     leadid: this.leadId,
      //     execid: this.userid,
      //     stage:  "RSV",
      //     assignid:this.rsvexecutiveId
      //   }
      //     this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //     this.selectedlists = selectsuggested;
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //     this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //     // Joining the object values as comma seperated when remove the property for the history storing
      //   });
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    } else {
      var param = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'RSV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      this._retailservice.removeselectedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice
              .rsvselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectedrsvlists'];
                this.selectedlists = selectsuggested;
                // Joining the object values as comma seperated when remove the property for the history storing
                this.selectedproperty_commaseperated =
                  this.selectedpropertylists
                    ?.map((item) => {
                      return item.name;
                    })
                    .join(',');
                // Joining the object values as comma seperated when remove the property for the history storing
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  // Selecting the suggested properties fix the RSV after any stage
  selectsuggesteddone2(i, id, propname) {
    var rsvvisiteddate = $('#RSVvisiteddate').val();
    var rsvvisitedtime = $('#RSVvisitedtime').val();

    if ($('#rsvcheckboxdone2' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsvdone']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: this.suggestchecked,
      //   nextdate: rsvvisiteddate,
      //   nexttime: rsvvisitedtime,
      //   execid: this.userid,
      //   assignid:this.rsvexecutiveId
      // }
      // if(rsvvisiteddate === ''){
      //   Swal.fire({
      //     title: 'Please select a date',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#rsvcheckboxdone2' + i).prop('checked', false);
      //     })
      // }else if(rsvvisitedtime === ''){
      //   Swal.fire({
      //     title: 'Please select a time',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#rsvcheckboxdone2' + i).prop('checked', false);
      //     })
      // }else{
      //   if(rsvvisiteddate != '' && rsvvisitedtime != ''){
      //     this._retailservice.addrsvselectedproperties(param2).subscribe((success) => {
      //       var param = {
      //         leadid: this.leadId,
      //         execid: this.userid,
      //         stage:  "RSV",
      //         assignid:this.rsvexecutiveId
      //       }
      //         this._retailservice.rsvselectproperties(param).subscribe(selectsuggested => {
      //         this.selectedpropertylists = selectsuggested['selectedrsvlists'];
      //         this.selectedlists = selectsuggested;
      //         // Joining the object values as comma seperated when remove the property for the history storing
      //         this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //         // Joining the object values as comma seperated when remove the property for the history storing
      //       });
      //     }, (err) => {
      //       console.log("Failed to Update");
      //     })
      //   }
      // }
    } else {
      var param = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'RSV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      this._retailservice.removeselectedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice
              .rsvselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectedrsvlists'];
                this.selectedlists = selectsuggested;
                // Joining the object values as comma seperated when remove the property for the history storing
                this.selectedproperty_commaseperated =
                  this.selectedpropertylists
                    ?.map((item) => {
                      return item.name;
                    })
                    .join(',');
                // Joining the object values as comma seperated when remove the property for the history storing
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  @ViewChild('rsvDoneModel', { static: true }) rsvDoneModel: IonModal;
  openRSVDoneModal() {
    this.rsvform = false;
    let apidate, apitime;
    if (this.isEdit && this.assignedRM && this.assignedRM.length) {
      let rsvvisiteddate = this.assignedRM[0].latest_action_date;
      let rsvvisitedtime = this.assignedRM[0].latest_action_time;
      apidate = $('#RSVvisiteddate_val').text();
      apitime = $('#RSVvisitedtime_val').text();
      $('#RSVvisiteddate').val(this.assignedRM[0].latest_action_date);
      $('#RSVvisitedtime').val(this.assignedRM[0].latest_action_time);

      // console.log(visiteddate, visitedtime);

      // // Convert date string → JS Date
      // let dateObj = visiteddate ? new Date(visiteddate) : null;

      // // Convert "1:00 PM" → Date object
      // let timeObj = null;
      // setTimeout(() => {
      //   // ✅ Set Date
      //   if (visiteddate) {
      //     let dateObj = new Date(visiteddate);
      //     $('.rsvvisitedcalendardate').calendar('set date', dateObj);
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

      // // ✅ Use Semantic UI API
      // $('.rsvvisitedcalendardate').calendar('set date', dateObj);
      // $('.calendartime').calendar('set date', timeObj);
    } else {
      var rsvvisiteddate = $('#RSVvisiteddate').val();
      var rsvvisitedtime = $('#RSVvisitedtime').val();
      apidate = $('#RSVvisiteddate').val();
      apitime = $('#RSVvisitedtime').val();
    }

    var rsvvisiteddate = $('#RSVvisiteddate').val();
    var rsvvisitedtime = $('#RSVvisitedtime').val();

    var param2 = {
      leadid: this.leadId,
      suggestproperties: this.suggestchecked,
      nextdate: rsvvisiteddate,
      nexttime: rsvvisitedtime,
      execid: this.userid,
      assignid: this.rsvexecutiveId,
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };
    if (rsvvisiteddate != '' && rsvvisitedtime != '') {
      this._retailservice.addrsvselectedproperties(param2).subscribe(
        (success) => {
          // this.status = success.status;
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'RSV',
            assignid: this.rsvexecutiveId,
            feedback: this.feedbackID,
            categoryid: this.categoryid,
          };
          this._retailservice
            .rsvselectproperties(param)
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectedrsvlists'];
              this.selectedlists = selectsuggested;
              // Joining the object values as comma seperated when remove the property for the history storing
              this.selectedproperty_commaseperated = this.selectedpropertylists
                .map((item) => {
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
    this.rsvDoneModel.present();
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

  accompanycheck(val, id, i) {
    const existingIndex = this.visitedprop.findIndex(
      (obj) => obj.propid === id
    );
    if (existingIndex !== -1) {
      this.visitedprop[existingIndex].accompany = val.target.value;
      localStorage.setItem('visitedprop', JSON.stringify(this.visitedprop));
    } else {
    }

    if (
      !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
        $('#accompaniedname' + i).val()
      )
    ) {
      // $('.check-circle'+i).removeAttr("style");
      // $('.x-circle'+i).css("display","block");

      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
      this.autolocksession = true;
      this.lockedsession = false;

      this.followdownform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
    } else {
      if (
        !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
          $('#propertyremarks' + i).val()
        )
      ) {
        // $('.check-circle'+i).removeAttr("style");
        // $('.x-circle'+i).css("display","block");

        $('#visitUpdate' + i).removeClass('donevisitUpdate');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        this.autolocksession = true;
        this.lockedsession = false;
        // return false;

        this.followdownform = false;
        this.svform = false;
        this.rsvform = false;
        this.finalnegoform = false;
        this.leadclosedform = false;
        this.junkform = false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
          this.followdownform = false;
          this.svform = false;
          this.rsvform = false;
          this.finalnegoform = false;
          this.leadclosedform = false;
          this.junkform = false;
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
            this.svform = false;
            this.rsvform = false;
            this.finalnegoform = false;
            this.leadclosedform = false;
            this.junkform = false;
          }
        }
        $('.x-circle' + i).removeAttr('style');
        $('.check-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('notVisitUpdate');
        $('#visitUpdate' + i).addClass('donevisitUpdate');
        this.followdownform = false;
        this.svform = false;
        this.rsvform = false;
        this.finalnegoform = false;
        this.leadclosedform = false;
        this.junkform = false;
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
      // $('.check-circle'+i).removeAttr("style");
      // $('.x-circle'+i).css("display","block");
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
      this.autolocksession = true;
      this.lockedsession = false;
      this.followdownform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      // return false;
    } else {
      if (
        !/^(?!\s*$)(?=.*[a-zA-Z])[a-zA-Z0-9\s\S]+$/.test(
          $('#accompaniedname' + i).val()
        )
      ) {
        // $('.check-circle'+i).removeAttr("style");
        // $('.x-circle'+i).css("display","block");
        $('#visitUpdate' + i).removeClass('donevisitUpdate');
        $('#visitUpdate' + i).addClass('notVisitUpdate');
        this.autolocksession = true;
        this.lockedsession = false;
        this.followdownform = false;
        this.svform = false;
        this.rsvform = false;
        this.finalnegoform = false;
        this.leadclosedform = false;
        this.junkform = false;
        // return false;
      } else {
        if (this.selectedpropertylists?.length != this.visitedprop.length) {
          this.autolocksession = true;
          this.lockedsession = false;
          this.followdownform = false;
          this.svform = false;
          this.rsvform = false;
          this.finalnegoform = false;
          this.leadclosedform = false;
          this.junkform = false;
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
            this.svform = false;
            this.rsvform = false;
            this.finalnegoform = false;
            this.leadclosedform = false;
            this.junkform = false;
          }
        }
        $('.x-circle' + i).removeAttr('style');
        $('.check-circle' + i).css('display', 'block');
        $('#visitUpdate' + i).removeClass('notVisitUpdate');
        $('#visitUpdate' + i).addClass('donevisitUpdate');
      }
    }
  }

  notvisitclick(val, propname, i, last) {
    // this.lockedsession = false;
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

    // $('.x-circle'+i).removeAttr("style");
    // $('.check-circle'+i).css("display","block");
    $('#visitUpdate' + i).removeClass('notVisitUpdate');
    $('#visitUpdate' + i).addClass('donevisitUpdate');

    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
  }

  interestclick(val, propname, i) {
    // this.lockedsession = false;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;

    // $('#accompaniedname'+i).val('');
    // $('#propertyremarks'+i).val('');
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
      // this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
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
      // this.excludedIds = [0];
    }
    this.proploopArray = this.visitedprop.filter((da) => {
      return da.actionid == 1;
    });
  }

  notinterestclick(val, propname, i) {
    // this.lockedsession = false;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;

    // $('#accompaniedname'+i).val('');
    // $('#propertyremarks'+i).val('');
    if (this.selectedpropertylists?.length <= '3') {
      $('#extendHeight').css('height', '210px');
    }
    $('.visitupdatearea' + i).css('display', 'block');
    const action = 3;

    if ($('#accompaniedname' + i).val() == '') {
      // $('.check-circle'+i).removeAttr("style");
      // $('.x-circle'+i).css("display","block");
      $('#visitUpdate' + i).removeClass('donevisitUpdate');
      $('#visitUpdate' + i).addClass('notVisitUpdate');
    } else if ($('#propertyremarks' + i).val() == '') {
      // $('.check-circle'+i).removeAttr("style");
      // $('.x-circle'+i).css("display","block");
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
        // localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      }
      // this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
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
        // localStorage.setItem('propertyloops', JSON.stringify(this.parsedarray));
      }
      // this.excludedIds = [0];
    }

    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
  }

  followupdownbtn() {
    this.rsvDate = '';
    this.rsvTime = '';
    this.rsvRemark = '';
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
    this.rsvFixedsubbtn = false;
  }

  onsvFixed() {
    this.svform = true;
    this.svFixed = true;
    this.rsvFixed = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
    this.rsvFixedsubbtn = false;
  }

  onrsvFixedsubbtn() {
    if ('propertyloops' in localStorage) {
      this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
    } else {
      this.excludedIds = [0];
    }

    this.rsvDate = '';
    this.rsvTime = '';
    this.rsvRemark = '';
    this.rsvFixedsubbtn = true;
    this.rsvform = true;
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
    this.finalnegoform = true;
    this.negofixed = true;
    this.rsvFixedsubbtn = false;
    this.rsvform = false;
    this.svform = false;
    this.svFixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
    this.rsvFixedsubbtn = false;
  }

  onleadclosed() {
    this.leadclosedform = true;
    this.leadclosed = true;
    this.finalnegoform = false;
    this.negofixed = false;
    this.rsvFixedsubbtn = false;
    this.rsvform = false;
    this.svform = false;
    this.svFixed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
    this.rsvFixedsubbtn = false;
  }

  onjunk() {
    this.junkform = true;
    this.junk = true;
    this.rsvFixed = false;
    this.rsvreFix = false;
    this.rsvDone = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    this.svform = false;
    this.svFixed = false;
    this.finalnegoform = false;
    this.negofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.rsvFixedsubbtn = false;
  }

  rsvdonewithfixing() {
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
        text: 'Please select atleast one property for the RSV',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      this.showSpinner = true;
      var nextactiondate = $('#subrsvnextactiondate').val();
      var nextactiontime = $('#subrsvnextactiontime').val();
      var visiteddate = $('#RSVvisiteddate').val();
      var visitedtime = $('#RSVvisitedtime').val();
      var rsvfinalremarks = 'RSV Done';
      var textarearemarks = 'RSV Finished';
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

      var dateformatchange = new Date(nextactiondate).toDateString();
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing RSV is restricted for demo accounts',
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
            stage: 'RSV',
            stagestatus: '3',
            propid: existingObject['propid'],
            execid: this.userid,
            visitupdate: existingObject['actionid'],
            remarks: existingObject['remarks'],
            accompany: existingObject['accompany'],
            assignid: this.rsvexecutiveId,
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

        var param = {
          leadid: this.leadId,
          nextdate: nextactiondate,
          nexttime: nextactiontime,
          execid: this.userid,
          suggestproperties: this.suggestchecked,
          assignid: this.rsvexecutiveId,
          feedback: this.feedbackID,
        };
        this._retailservice.addrsvselectedproperties(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var param2 = {
                leadid: this.leadId,
                execid: this.userid,
                stage: 'RSV',
                assignid: this.rsvexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              this._retailservice
                .rsvselectproperties(param2)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] === 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectedrsvlists'];

                    // Joining the object values as comma seperated when remove the property for the history storing
                    this.selectedproperty_commaseperated =
                      this.selectedpropertylists
                        ?.map((item) => {
                          return item.name;
                        })
                        .join(',');
                    // Joining the object values as comma seperated when remove the property for the history storing

                    this.autoremarks =
                      ' Changed the status to RSV after Successfully completed RSV';
                    var leadsvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'RSV',
                      stagestatus: '3',
                      textarearemarks: rsvfinalremarks,
                      userid: this.userid,
                      assignid: this.rsvexecutiveId,
                      autoremarks: this.autoremarks,
                      weekplan: weekplan,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                      categoryid: this.categoryid,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadsvdoneparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            this.autoremarks =
                              ' Scheduled the RSV for ' +
                              this.selectedproperty_commaseperated +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              nextactiontime;
                            var leadrsvfixparam = {
                              leadid: this.leadId,
                              closedate: nextactiondate,
                              closetime: nextactiontime,
                              leadstage: 'RSV',
                              stagestatus: '1',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.rsvexecutiveId,
                              autoremarks: this.autoremarks,
                              weekplan: '',
                              property: this.suggestchecked,
                              feedback: this.feedbackID,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadrsvfixparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    this.showSpinner = false;
                                    $('#subrsvnextactiondate').val('');
                                    $('#subrsvnextactiontime').val('');
                                    $('#customer_phase4').val('');
                                    $('#subrsvtextarearemarks').val('');
                                    Swal.fire({
                                      title: 'RSV Fixed Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      this.rsvDoneModel.dismiss();
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
                                    });
                                  } else {
                                    this.showSpinner = false;
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
                      this.rsvdonewithfixing();
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

  // Selecting the suggested properties for Direct fix the RSV
  selectsuggestedrsv2rsv(i, id, propname) {
    var rsvvisiteddate = $('#subrsvnextactiondate').val();
    var rsvvisitedtime = $('#subrsvnextactiontime').val();

    if ($('#rsvcheckboxrsv2rsv' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsv2rsv']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      var param2 = {
        leadid: this.leadId,
        suggestproperties: this.suggestchecked,
        nextdate: rsvvisiteddate,
        nexttime: rsvvisitedtime,
        execid: this.userid,
        assignid: this.rsvexecutiveId,
        feedback: this.feedbackID,
        categoryid: this.categoryid,
      };
      this._retailservice.addrsvselectedproperties(param2).subscribe(
        (success) => {
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'RSV',
            assignid: this.rsvexecutiveId,
          };
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    } else {
      var param = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'RSV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      this._retailservice.removeselectedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvexecutiveId,
            };
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  // Selecting the suggested properties for Direct fix the RSV
  selectsuggestedrsv2rsv2(i, id, propname) {
    var rsvvisiteddate = $('#subrsvnextactiondate').val();
    var rsvvisitedtime = $('#subrsvnextactiontime').val();

    if ($('#rsvcheckboxrsv2rsv2' + i).is(':checked')) {
      var checkid = $("input[name='programmingrsv2rsv']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks =
        ' added the ' + propname + ' for RSV while fixing the meeting.';

      var param2 = {
        leadid: this.leadId,
        suggestproperties: this.suggestchecked,
        nextdate: rsvvisiteddate,
        nexttime: rsvvisitedtime,
        execid: this.userid,
        assignid: this.rsvexecutiveId,
        feedback: this.feedbackID,
        categoryid: this.categoryid,
      };
      this._retailservice.addrsvselectedproperties(param2).subscribe(
        (success) => {
          var param = {
            leadid: this.leadId,
            execid: this.userid,
            stage: 'RSV',
            assignid: this.rsvexecutiveId,
          };
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    } else {
      var param = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'RSV',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' + propname + ' from the RSV scheduled lists.';
      this._retailservice.removeselectedproperties(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvexecutiveId,
            };
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  ngAfterViewChecked() {
    if (this._retailservice.isCloseSuggModal) {
      this.loadimportantapi();
      this._retailservice.isCloseSuggModal = false;
    }
  }

  onUpdateBackbutton() {
    this.lockedsession = false;
    this.followdownform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.svform = false;

    this.rsvFixed = false;
    this.rsvreFix = false;
    this.rsvDone = true;
    this.followform = false;
    this.followup = false;
    $('#sectionselector').val('RSV');
    this.visitedprop = [];
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.rsvTime) {
      const [time, modifier] = this.rsvTime.split(' ');
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
      this.rsvTime = '';
      $('#rsvnextactiontime').val('');
      $('#refixtime').val('');
      $('#RSVvisitedtime').val('');
      $('#subrsvnextactiontime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  updateRsvDone() {
    if (
      this.suggestchecked == '' ||
      this.suggestchecked == undefined ||
      this.suggestchecked == null
    ) {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the RSV',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      this.showSpinner = true;
      var visiteddate = $('#RSVvisiteddate').val();
      var visitedtime = $('#RSVvisitedtime').val();

      var rsvfinalremarks = 'RSV Done';
      let date = new Date($('#RSVvisiteddate').val());

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
        suggestproperties: this.suggestchecked,
        nextdate: visiteddate,
        nexttime: visitedtime,
        execid: this.userid,
        assignid: this.rsvexecutiveId,
        feedback: this.feedbackID,
        categoryid: this.categoryid,
      };

      if (visiteddate != '' && visitedtime != '') {
        this._retailservice
          .addrsvselectedproperties(param)
          .subscribe((success) => {
            var param = {
              leadid: this.leadId,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            this._retailservice
              .rsvselectproperties(param)
              .subscribe((selectsuggested) => {
                if (selectsuggested['status'] == 'True') {
                  this.selectedpropertylists =
                    selectsuggested['selectedrsvlists'];
                  this.selectedlists = selectsuggested;
                  for (const existingObject of this.selectedpropertylists) {
                    var visitparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      stage: 'RSV',
                      stagestatus: '4',
                      propid: existingObject['propid'],
                      execid: this.userid,
                      visitupdate: 9,
                      remarks: 'RSV Done for' + ' ' + existingObject['name'],
                      accompany: this.rsvexecutiveId,
                      assignid: this.rsvexecutiveId,
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
                  this.autoremarks = 'RSV Done Successfully';
                  var leadsvdoneparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'RSV',
                    stagestatus: '1',
                    textarearemarks: rsvfinalremarks,
                    userid: this.userid,
                    assignid: this.rsvexecutiveId,
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
                          this.modalController.dismiss();
                          // const currentParams = this.activeroute.snapshot.queryParams;
                          //     this.router.navigate([], {
                          //     relativeTo: this.activeroute,
                          //     queryParams: {
                          //       ...currentParams,
                          //       stageForm: 'onleadStatus'
                          //     },
                          //     queryParamsHandling: 'merge'
                          //     });
                          location.reload();
                        }
                      },
                      (err) => {
                        console.log('Failed to Update');
                      }
                    );
                }
              });
          }),
          (err) => {
            console.log('Failed to Update');
          };
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

          $('#RSVvisiteddate').val(date);
          $('#RSVvisitedtime').val(time);

          // Optional: update calendar internal state
          $('.rsvvisitedcalendardate').calendar('set date', new Date(date));
          $('.calendartime').calendar('set date', this.convertToDateTime(time));
        }
      }, 0);
    } else if ((num = 2)) {
      this.rsvTime = this.assignedRM[0].latest_action_time;
      this.rsvDate = this.assignedRM[0].latest_action_date;
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
    // $('.rsvvisitedcalendardate').calendar({
    //   type: 'date',
    //   // minDate: this.priorDatebefore,
    //   maxDate: this.date,
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
}
