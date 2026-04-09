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
  selector: 'app-negoform',
  templateUrl: './negoform.component.html',
  styleUrls: ['./negoform.component.scss'],
})
export class NegoformComponent implements OnInit, AfterViewChecked {
  @Output() openModal = new EventEmitter<void>();
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() selectedBtn: any;
  isEdit: boolean = true;
  date: String = new Date().toISOString();
  showSpinner = true;
  buttonhiders = true;
  hidebeforefixed = false;
  negoFixed = true;
  negoreFix = false;
  negoDone = false;
  junkform = false;
  junk = false;
  followform = false;
  followup = false;
  followdownform = false;
  followupdown = false;
  svform = false;
  svFixed = false;
  rsvform = false;
  rsvFixed = false;
  finalnegoform = false;
  subnegofixed = false;
  leadclosedform = false;
  leadclosed = false;
  fnDate;
  fnTime;
  fnRemark;
  hasOnlySpaces: boolean;
  negoexecutiveId: any;
  leadId: string;
  userid: string;
  username: string;
  negopropslocally: any[] = [];
  excludedIds: number[] = [];
  executeid: any;
  selectedpropertylists: any;
  selectedlists: any;
  activestagestatus: any;
  hideafterfixed = true;
  negotiatedproperty: any;
  visitedpropertylists: any;
  cancelledpropertylists: any;
  suggestchecked: any;
  autoremarks: string;
  selectedproperty_commaseperated: any;
  selectedItem = 0;
  visitedprop: visitedproperties[] = [];
  autolocksession = true;
  lockedsession = false;
  fnlocalselection = false;
  categoryid: string;

  constructor(
    private activeroute: ActivatedRoute,
    private _retailservice: CpApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalController: ModalController
  ) {}
  assignedRM;
  feedbackID = '';
  ngOnInit() {
    this.activeroute.queryParamMap.subscribe((params) => {
      this.showSpinner = true;
      const paramMap = params.get('leadid');
      this.leadId = params.get('leadid');
      this.categoryid = params.get('categoryid');
      this.feedbackID = params.get('feedback') ? params.get('feedback') : '0';
      const isEmpty = !paramMap;
      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');
      if ('propertyloops' in localStorage) {
        const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
        const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

        if (firstArray.length === 0) {
          this.negopropslocally = secondArray;
        } else {
          this.negopropslocally = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
        }
        this.excludedIds = JSON.parse(localStorage.getItem('propertyloops'));
        this.fnlocalselection = true;
      } else {
        this.negopropslocally = [0];
        this.excludedIds = [0];
        this.fnlocalselection = false;
      }
      let rmid;
      if (this.feedbackID == '1') {
        rmid = this.selectedExecId;
      } else {
        rmid = this.userid;
      }
      if (!isEmpty) {
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
                this.negoexecutiveId = this.selectedExecId;
              } else {
                this.negoexecutiveId = this.selectedExecId;
              }
              this.assignedRM = cust['RMname'].filter((lead) => {
                return lead.RMID == this.selectedExecId;
              });
              this.loadimportantapi();
              let param = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              return this.negoexecutiveId
                ? this._retailservice.negoselectproperties(param)
                : of(null);
            }),
            switchMap((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectednegolists'];
              this.selectedlists = selectsuggested;
              // Then, get the active leads status
              return this.negoexecutiveId
                ? this._retailservice.getactiveleadsstatus(
                    this.leadId,
                    this.userid,
                    this.negoexecutiveId,
                    this.feedbackID,
                    this.categoryid
                  )
                : of(null);
            })
          )
          .subscribe((stagestatus) => {
            this.activestagestatus = stagestatus['activeleadsstatus'];
            if (
              this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '1'
            ) {
              this.hideafterfixed = false;
              this.negoFixed = false;
              this.hidebeforefixed = true;
              if (this.selectedBtn == 'rescheduled') {
                this.negoreFix = true;
                this.negoDone = false;
              } else if (this.selectedBtn == 'updatevisit') {
                this.negoreFix = false;
                this.negoDone = true;
              }
              // this.negoreFix = false;
              // this.negoDone = true;
              $('#sectionselector').val('Final Negotiation');
            } else if (
              this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '2'
            ) {
              this.hideafterfixed = false;
              this.negoFixed = false;
              this.hidebeforefixed = true;
              if (this.selectedBtn == 'rescheduled') {
                this.negoreFix = true;
                this.negoDone = false;
              } else if (this.selectedBtn == 'updatevisit') {
                this.negoreFix = false;
                this.negoDone = true;
              }
              $('#sectionselector').val('Final Negotiation');
            } else if (
              this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '3'
            ) {
              this.hideafterfixed = true;
              this.hidebeforefixed = false;
              this.negoDone = false;
              this.negoFixed = true;
            } else {
              this.hideafterfixed = true;
            }
            this.showSpinner = false;
          });
      }
      this.suggestchecked = '';
      if (
        $('#sectionselector').val() == 'SV' ||
        $('#sectionselector').val() == 'USV' ||
        $('#sectionselector').val() == 'RSV'
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
      assignid: this.negoexecutiveId,
      stage: $('#customer_phase4').val(),
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };

    this._retailservice
      .negoselectproperties(param)
      .subscribe((selectsuggested) => {
        this.selectedpropertylists = selectsuggested['selectednegolists'];
        this.selectedlists = selectsuggested;
        this.suggestchecked = this.selectedpropertylists
          ?.map((item) => {
            return item.propid;
          })
          .join(',');
      });

    this._retailservice.getvisitednegotiated(param).subscribe((negotiated) => {
      this.negotiatedproperty = negotiated['negotiatedlists'];
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

  onnegoreFix() {
    this.fnDate = '';
    this.fnTime = '';
    this.fnRemark = '';
    this.negoreFix = true;
    this.negoFixed = false;
    this.negoDone = false;
    this.junkform = false;
    this.junk = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
  }

  onnegoDone() {
    this.fnDate = '';
    this.fnTime = '';
    this.fnRemark = '';
    this.negoFixed = false;
    this.negoDone = true;
    this.junkform = false;
    this.junk = false;
    this.negoreFix = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    $('#sectionselector').val('Final Negotiation');
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.fnDate = selectedDate.toLocaleDateString('en-CA');
  }

  // to test whether the text area input contain only space
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.fnRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.fnRemark);
  }

  selectsuggested(i, id, propname) {
    var negonextactiondate = $('#negonextactiondate').val();
    var negonextactiontime = $('#negonextactiontime').val();

    if ($('#negocheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegofix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks = ' Selected the ' + propname + ' for Finalnegotiation.';
      // $('#negotextarearemarks').html(' Fixed the Final Negotiation for '+propname);
      var param = {
        leadid: this.leadId,
        suggestproperties: this.suggestchecked,
        nextdate: negonextactiondate,
        nexttime: negonextactiontime,
        execid: this.userid,
        assignid: this.negoexecutiveId,
        feedback: this.feedbackID,
      };
      if (negonextactiontime != '' && negonextactiondate != '') {
        this._retailservice.addnegoselectedproperties(param).subscribe(
          (success) => {
            let param = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
            };
            if (success['status'] == 'True') {
              this._retailservice
                .negoselectproperties(param)
                .subscribe((selectsuggested) => {
                  this.selectedpropertylists = selectsuggested['selectedlists'];
                  this.selectedlists = selectsuggested;
                  // Joining the object values as comma seperated when add the property for the history storing
                  this.selectedproperty_commaseperated =
                    this.selectedpropertylists
                      ?.map((item) => {
                        return item.name;
                      })
                      .join(',');
                  // Joining the object values as comma seperated when add the property for the history storing
                });
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'Final Negotiation',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            // $('#negotextarearemarks').html("");
            let param = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
            };
            this._retailservice
              .negoselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectednegolists'];
                this.selectedlists = selectsuggested;
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  selectsuggestedsub(i, id, propname) {
    var negonextactiondate = $('#negonextactiondate').val();
    var negonextactiontime = $('#negonextactiontime').val();

    if ($('#subnegocheckbox' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegofix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      // this.autoremarks = " Selected the "+propname+" for Finalnegotiation.";
      //   var param = {
      //     leadid: this.leadId,
      //     suggestproperties: this.suggestchecked,
      //     nextdate: negonextactiondate,
      //     nexttime: negonextactiontime,
      //     execid: this.userid,
      //     assignid: this.negoexecutiveId
      //   }
      //   if(negonextactiontime != '' && negonextactiondate != ''){
      //   this._retailservice.addnegoselectedproperties(param).subscribe((success) => {
      //     let param = {
      //       leadid:this.leadId,
      //       execid: this.userid,
      //       assignid:this.negoexecutiveId
      //     }
      //     if(success['status'] == 'True'){
      //     this._retailservice.negoselectproperties(param).subscribe(selectsuggested => {
      //       this.selectedpropertylists = selectsuggested['selectedlists'];
      //       this.selectedlists = selectsuggested;
      //       // Joining the object values as comma seperated when add the property for the history storing
      //       this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //       // Joining the object values as comma seperated when add the property for the history storing
      //     });
      //   }
      //   }, (err) => {
      //     console.log("Failed to Update");
      //   })
      // }
    } else {
      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: 'Final Negotiation',
      //   execid: this.userid,
      //   }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      //   this._retailservice.removeselectedproperties(param2).subscribe((success) => {
      //   if(success['status'] == "True"){
      //     // $('#negotextarearemarks').html("");
      //     let param = {
      //       leadid:this.leadId,
      //       execid: this.userid,
      //       assignid:this.negoexecutiveId
      //     }
      //       this._retailservice.negoselectproperties(param).subscribe(selectsuggested => {
      //       this.selectedpropertylists = selectsuggested['selectednegolists'];
      //       this.selectedlists = selectsuggested;
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
      // var param2 = {
      //   leadid: this.leadId,
      //   suggestproperties: id,
      //   stage: 'Final Negotiation',
      //   execid: this.userid,
      //   }
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        'removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists while refixing the meeting.';
      // this._retailservice.removeselectedproperties(param2).subscribe((success) => {
      //   if(success['status'] == "True"){
      //     let param = {
      //       leadid:this.leadId,
      //       execid: this.userid,
      //       assignid:this.negoexecutiveId
      //     }
      //       this._retailservice.negoselectproperties(param).subscribe(selectsuggested => {
      //     this.selectedpropertylists = selectsuggested['selectednegolists'];
      //     this.selectedlists = selectsuggested;
      //   });
      //   }
      // }, (err) => {
      //   console.log("Failed to Update");
      // })
    }
  }

  selectsuggesteddone(i, id, propname, property) {
    var negonextactiondate = $('#negovisiteddate').val();
    var negonextactiontime = $('#negovisitedtime').val();

    if ($('#negocheckboxdone' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegodone']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.selectedpropertylists.push(property);
      // this.autoremarks = " Selected the "+propname+" for Finalnegotiation.";
      // $('#negotextarearemarks').html(' Fixed the Final Negotiation for '+propname);
      //   var param = {
      //     leadid: this.leadId,
      //     suggestproperties: this.suggestchecked,
      //     nextdate: negonextactiondate,
      //     nexttime: negonextactiontime,
      //     execid: this.userid,
      //     assignid: this.negoexecutiveId
      //   }
      //   if(negonextactiontime != '' && negonextactiondate != ''){
      //   this._retailservice.addnegoselectedproperties(param).subscribe((success) => {
      //     let param = {
      //       leadid:this.leadId,
      //       execid: this.userid,
      //       assignid:this.negoexecutiveId
      //     }
      //     if(success['status'] == 'True'){
      //     this._retailservice.negoselectproperties(param).subscribe(selectsuggested => {
      //       this.selectedpropertylists = selectsuggested['selectedlists'];
      //       this.selectedlists = selectsuggested;

      //       // Joining the object values as comma seperated when add the property for the history storing
      //       this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => {
      //         return item.name }).join(',');
      //       // Joining the object values as comma seperated when add the property for the history storing
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
        stage: 'Final Negotiation',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        'removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            // $('#negotextarearemarks').html("");
            let param = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
            };
            this._retailservice
              .negoselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectednegolists'];
                this.selectedlists = selectsuggested;
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  selectsuggesteddone2(i, id, propname, property) {
    var negonextactiondate = $('#negonextactiondate').val();
    var negonextactiontime = $('#negonextactiontime').val();

    if ($('#negocheckboxdone2' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegofix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks = ' Selected the ' + propname + ' for Finalnegotiation.';
      this.selectedpropertylists.push(property);
      // var param = {
      //   leadid: this.leadId,
      //   suggestproperties: this.suggestchecked,
      //   nextdate: negonextactiondate,
      //   nexttime: negonextactiontime,
      //   execid: this.userid,
      //   assignid: this.negoexecutiveId
      // }

      // if(negonextactiondate == ''){
      //   Swal.fire({
      //     title: 'Please select a date',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#negocheckboxdone2' + i).prop('checked', false);
      //     })
      // }else if(negonextactiontime == ''){
      //   Swal.fire({
      //     title: 'Please select a time',
      //     icon: "warning",
      //     heightAuto:false,
      //     confirmButtonText: 'OK!',
      //     }).then((result) => {
      //       $('#negocheckboxdone2' + i).prop('checked', false);
      //     })
      // }else{
      //   if( negonextactiondate != '' && negonextactiontime != ''){
      //     this._retailservice.addnegoselectedproperties(param).subscribe((success) => {
      //       let param = {
      //         leadid:this.leadId,
      //         execid: this.userid,
      //         assignid:this.negoexecutiveId
      //       }
      //       if(success['status'] == 'True'){
      //       this._retailservice.negoselectproperties(param).subscribe(selectsuggested => {
      //         this.selectedpropertylists = selectsuggested['selectednegolists'];
      //         this.selectedlists = selectsuggested;
      //         // Joining the object values as comma seperated when add the property for the history storing
      //         this.selectedproperty_commaseperated = this.selectedpropertylists?.map((item) => { return item.name }).join(',');
      //         // Joining the object values as comma seperated when add the property for the history storing
      //       });
      //     }
      //     }, (err) => {
      //       console.log("Failed to Update");
      //     })
      //   }
      // }
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'Final Negotiation',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            let param = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
            };
            this._retailservice
              .negoselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectednegolists'];
                this.selectedlists = selectsuggested;
              });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  selectsuggestedsub2(i, id, propname) {
    var negonextactiondate = $('#subnegonextactiondate').val();
    var negonextactiontime = $('#subnegonextactiontime').val();

    if ($('#subnegocheckbox2' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegofix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks = ' Selected the ' + propname + ' for Finalnegotiation.';
      var param = {
        leadid: this.leadId,
        suggestproperties: this.suggestchecked,
        nextdate: negonextactiondate,
        nexttime: negonextactiontime,
        execid: this.userid,
        assignid: this.negoexecutiveId,
        feedback: this.feedbackID,
      };
      if (negonextactiontime != '' && negonextactiondate != '') {
        this._retailservice.addnegoselectedproperties(param).subscribe(
          (success) => {},
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'Final Negotiation',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          if (success['status'] == 'True') {
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  selectsuggestedsub3(i, id, propname) {
    var negonextactiondate = $('#subnegonextactiontime').val();
    var negonextactiontime = $('#subnegonextactiontime').val();

    if ($('#subnegocheckbox3' + i).is(':checked')) {
      var checkid = $("input[name='programmingnegofix']:checked")
        .map(function () {
          return this.value;
        })
        .get()
        .join(',');
      this.suggestchecked = checkid;
      this.autoremarks = ' Selected the ' + propname + ' for Finalnegotiation.';
      var param = {
        leadid: this.leadId,
        suggestproperties: this.suggestchecked,
        nextdate: negonextactiondate,
        nexttime: negonextactiontime,
        execid: this.userid,
        assignid: this.negoexecutiveId,
        feedback: this.feedbackID,
      };
      this._retailservice.addnegoselectedproperties(param).subscribe(
        (success) => {},
        (err) => {
          console.log('Failed to Update');
        }
      );
    } else {
      var param2 = {
        leadid: this.leadId,
        suggestproperties: id,
        stage: 'Final Negotiation',
        execid: this.userid,
      };
      this.suggestchecked = this.removeValue(this.suggestchecked, id);
      this.autoremarks =
        ' removed the ' +
        propname +
        ' from the Finalnegotiation scheduled lists.';
      this._retailservice.removeselectedproperties(param2).subscribe(
        (success) => {
          if (success['status'] == 'True') {
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  @ViewChild('fnDoneModel', { static: true }) fnDoneModel: IonModal;
  openFNDoneModal() {
    this.fnDoneModel.present();
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
    // this.lockedsession = false;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
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
    this.proploopArray = this.visitedprop.filter((da) => {
      return (
        da.actionid == 1 && this.parsedarray.some((pro) => da.propid == pro)
      );
    });
  }

  proploopArray: any;
  interestclick(val, propname, i) {
    // this.lockedsession = false;
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
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

  notinterestclick(val, propname, i) {
    this.followdownform = false;
    this.svform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
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

  followupdownbtn() {
    this.followdownform = true;
    this.followupdown = true;
    this.svform = false;
    this.svFixed = false;
    this.rsvFixed = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.subnegofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.junkform = false;
    this.junk = false;
  }

  onsvFixed() {
    this.svform = true;
    this.svFixed = true;
    this.rsvFixed = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.subnegofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onrsvFixed() {
    this.rsvform = true;
    this.rsvFixed = true;
    this.svFixed = false;
    this.svform = false;
    this.finalnegoform = false;
    this.subnegofixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onsubnegofixed() {
    this.finalnegoform = true;
    this.subnegofixed = true;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svFixed = false;
    this.svform = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onleadclosed() {
    this.leadclosedform = true;
    this.leadclosed = true;
    this.finalnegoform = false;
    this.subnegofixed = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.svFixed = false;
    this.svform = false;
    this.followdownform = false;
    this.followupdown = false;
    this.junkform = false;
    this.junk = false;
  }
  onjunk() {
    this.junkform = true;
    this.junk = true;
    this.negoFixed = false;
    this.negoDone = false;
    this.negoreFix = false;
    this.followform = false;
    this.followup = false;
    this.followdownform = false;
    this.followupdown = false;
    this.svform = false;
    this.svFixed = false;
    this.rsvform = false;
    this.rsvFixed = false;
    this.leadclosedform = false;
    this.leadclosed = false;
    this.finalnegoform = false;
    this.subnegofixed = false;
  }

  // Negotiation Fixing
  negofixing() {
    var nextdate = $('#negonextactiondate').val();
    var nexttime = $('#negonextactiontime').val();
    var textarearemarks = $('#negotextarearemarks').val();
    var assignid = this.negoexecutiveId;
    var dateformatchange = new Date(nextdate).toDateString();

    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));
    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing FN is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with NEGOTIATION Fixing
      if ($('#customer_phase4').val() == 'USV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        if (this.suggestchecked == '' || this.suggestchecked === undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // return false;
        } else {
          this.showSpinner = true;
          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var nextactiondate = $('#negonextactiondate').val();
          var nextactiontime = $('#negonextactiontime').val();
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
              assignid: this.negoexecutiveId,
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
            assignid: this.negoexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice.addnegoselectedproperties(param).subscribe(
            (success) => {
              let param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              if (success['status'] == 'True') {
                this._retailservice
                  .negoselectproperties(param2)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] == 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectednegolists'];
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
                        ' Changed the status to Final Negotiation after Successfully completed USV';
                      var leadusvdoneparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        leadstage: 'USV',
                        stagestatus: '3',
                        textarearemarks: usvfinalremarks,
                        userid: this.userid,
                        assignid: this.negoexecutiveId,
                        weekplan: weekplan,
                        autoremarks: this.autoremarks,
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
                                'Scheduled the Final Negotiation for ' +
                                this.selectedproperty_commaseperated +
                                ' On ' +
                                dateformatchange +
                                ' ' +
                                nexttime;
                              var leadnegofixparam = {
                                leadid: this.leadId,
                                closedate: nextdate,
                                closetime: nexttime,
                                leadstage: 'Final Negotiation',
                                stagestatus: '1',
                                textarearemarks: textarearemarks,
                                userid: this.userid,
                                weekplan: '',
                                assignid: this.negoexecutiveId,
                                autoremarks: this.autoremarks,
                                property: this.suggestchecked,
                                feedback: this.feedbackID,
                                categoryid: this.categoryid,
                              };
                              this._retailservice
                                .addleadhistoryretail(leadnegofixparam)
                                .subscribe(
                                  (success) => {
                                    this.showSpinner = false;
                                    if (success['status'] == 'True') {
                                      Swal.fire({
                                        title: 'Negotiation Fixed Successfully',
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
                      Swal.fire({
                        title: 'Some error Occured,Try Again..! ',
                        icon: 'error',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        this.showSpinner = false;
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
      // USV DONE with NEGOTIATION Fixing

      // SV DONE with NEGOTIATION Fixing
      else if ($('#customer_phase4').val() == 'SV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        if (this.suggestchecked == '' || this.suggestchecked === undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var visiteddate = $('#SVvisiteddate').val();
          var visitedtime = $('#SVvisitedtime').val();
          var nextactiondate = $('#negonextactiondate').val();
          var nextactiontime = $('#negonextactiontime').val();
          var svfinalremarks = 'SV Done';

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
              stage: 'SV',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: this.negoexecutiveId,
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
            assignid: this.negoexecutiveId,
            feedback: this.feedbackID,
          };
          this._retailservice.addnegoselectedproperties(param).subscribe(
            (success) => {
              let param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
              };
              if (success['status'] == 'True') {
                this._retailservice
                  .negoselectproperties(param2)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] == 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectednegolists'];
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
                        ' Changed the status to Final Negotiation after Successfully completed SV';
                      var leadsvdoneparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        leadstage: 'SV',
                        stagestatus: '3',
                        textarearemarks: svfinalremarks,
                        userid: this.userid,
                        assignid: this.negoexecutiveId,
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
                                'Scheduled the Final Negotiation for ' +
                                this.selectedproperty_commaseperated +
                                ' On ' +
                                dateformatchange +
                                ' ' +
                                nexttime;
                              var leadnegofixparam = {
                                leadid: this.leadId,
                                closedate: nextdate,
                                closetime: nexttime,
                                leadstage: 'Final Negotiation',
                                stagestatus: '1',
                                textarearemarks: textarearemarks,
                                userid: this.userid,
                                assignid: this.negoexecutiveId,
                                autoremarks: this.autoremarks,
                                weekplan: '',
                                property: this.suggestchecked,
                                feedback: this.feedbackID,
                              };
                              this._retailservice
                                .addleadhistoryretail(leadnegofixparam)
                                .subscribe(
                                  (success) => {
                                    this.showSpinner = false;
                                    if (success['status'] == 'True') {
                                      Swal.fire({
                                        title: 'Negotiation Fixed Successfully',
                                        icon: 'success',
                                        heightAuto: false,
                                        allowOutsideClick: false,
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
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    } else {
                      Swal.fire({
                        title: 'Some error Occured,Try Again..! ',
                        icon: 'error',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        this.showSpinner = false;
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
      // SV DONE with NEGOTIATION Fixing

      // RSV DONE with NEGOTIATION Fixing
      else if ($('#customer_phase4').val() == 'RSV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
        if (this.suggestchecked == '' || this.suggestchecked === undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          this.showSpinner = true;
          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();
          var nextactiondate = $('#negonextactiondate').val();
          var nextactiontime = $('#negonextactiontime').val();
          var rsvfinalremarks = 'RSV Finished';

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
              stage: 'RSV',
              stagestatus: '3',
              propid: existingObject['propid'],
              execid: this.userid,
              visitupdate: existingObject['actionid'],
              remarks: existingObject['remarks'],
              accompany: existingObject['accompany'],
              assignid: this.negoexecutiveId,
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
            assignid: this.negoexecutiveId,
            feedback: this.feedbackID,
          };

          this._retailservice.addnegoselectedproperties(param).subscribe(
            (success) => {
              let param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              if (success['status'] == 'True') {
                this._retailservice
                  .negoselectproperties(param2)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] == 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectednegolists'];
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
                        ' Changed the status to Final Negotiation after Successfully completed RSV';
                      var leadsvdoneparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        leadstage: 'RSV',
                        stagestatus: '3',
                        textarearemarks: rsvfinalremarks,
                        userid: this.userid,
                        assignid: this.negoexecutiveId,
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
                                'Scheduled the Final Negotiation for ' +
                                this.selectedproperty_commaseperated +
                                ' On ' +
                                dateformatchange +
                                ' ' +
                                nexttime;
                              var leadnegofixparam = {
                                leadid: this.leadId,
                                closedate: nextdate,
                                closetime: nexttime,
                                leadstage: 'Final Negotiation',
                                stagestatus: '1',
                                textarearemarks: textarearemarks,
                                userid: this.userid,
                                assignid: this.negoexecutiveId,
                                weekplan: '',
                                autoremarks: this.autoremarks,
                                property: this.suggestchecked,
                                feedback: this.feedbackID,
                                categoryid: this.categoryid,
                              };
                              this._retailservice
                                .addleadhistoryretail(leadnegofixparam)
                                .subscribe(
                                  (success) => {
                                    if (success['status'] == 'True') {
                                      this.showSpinner = false;
                                      Swal.fire({
                                        title: 'Negotiation Fixed Successfully',
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
                        title: 'Some error Occured,Try Again..! ',
                        icon: 'error',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        this.showSpinner = false;
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
      // RSV DONE with NEGOTIATION Fixing

      // DIRECT Negotiation Fixing
      else if ($('#customer_phase4').val() == 'Final Negotiation') {
        if (this.suggestchecked == '' || this.suggestchecked === undefined) {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // return false;
        } else {
          this.showSpinner = true;
          var nextdate = $('#negonextactiondate').val();
          var nexttime = $('#negonextactiontime').val();
          var textarearemarks = $('#negotextarearemarks').val();
          this.autoremarks = ' Scheduled the Finalnegotiation';

          var param = {
            leadid: this.leadId,
            nextdate: nextdate,
            nexttime: nexttime,
            execid: this.userid,
            suggestproperties: this.suggestchecked,
            assignid: this.negoexecutiveId,
            feedback: this.feedbackID,
          };

          this._retailservice.addnegoselectedproperties(param).subscribe(
            (success) => {
              let param2 = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
                categoryid: this.categoryid,
              };
              if (success['status'] == 'True') {
                this._retailservice
                  .negoselectproperties(param2)
                  .subscribe((selectsuggested) => {
                    if (selectsuggested['status'] == 'True') {
                      this.selectedpropertylists =
                        selectsuggested['selectednegolists'];
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
                        'Scheduled the Final Negotiation for ' +
                        this.selectedproperty_commaseperated +
                        ' On ' +
                        dateformatchange +
                        ' ' +
                        nexttime;
                      var leadnegofixparam = {
                        leadid: this.leadId,
                        closedate: nextdate,
                        closetime: nexttime,
                        leadstage: 'Final Negotiation',
                        stagestatus: '1',
                        textarearemarks: textarearemarks,
                        userid: this.userid,
                        assignid: this.negoexecutiveId,
                        autoremarks: this.autoremarks,
                        weekplan: '',
                        property: this.suggestchecked,
                        feedback: this.feedbackID,
                        categoryid: this.categoryid,
                      };
                      this._retailservice
                        .addleadhistoryretail(leadnegofixparam)
                        .subscribe(
                          (success) => {
                            this.showSpinner = false;
                            if (success['status'] == 'True') {
                              Swal.fire({
                                title: 'Final Negotiation Fixed Successfully',
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
                                  //     });
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
                      Swal.fire({
                        title: 'Some error Occured,Try Again..! ',
                        icon: 'error',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        this.showSpinner = false;
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

  // Negotiation Re-Fixing
  negorefixing() {
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
        assignid: this.negoexecutiveId,
        feedback: this.feedbackID,
      };
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Re-Fixing FN is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._retailservice.addnegoselectedrefix(param).subscribe(
          (success) => {
            let param = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            if (success['status'] == 'True') {
              this._retailservice
                .negoselectproperties(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectednegolists'];
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
                      ' ReFixed the Final Negotiation for ' +
                      this.selectedproperty_commaseperated +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      nexttime;
                    var leadnegorefixparam = {
                      leadid: this.leadId,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '2',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      weekplan: '',
                      assignid: this.negoexecutiveId,
                      autoremarks: this.autoremarks,
                      property: this.suggestchecked,
                      feedback: this.feedbackID,
                      categoryid: this.categoryid,
                    };
                    this._retailservice
                      .addleadhistoryretail(leadnegorefixparam)
                      .subscribe(
                        (success) => {
                          this.showSpinner = false;
                          if (success['status'] == 'True') {
                            Swal.fire({
                              title: 'Refixed Final Negotiation Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              heightAuto: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              if (result.value) {
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
                            });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                  } else {
                    // this.filterLoader= false;
                    Swal.fire({
                      title: 'Some error Occured,Try Again..! ',
                      icon: 'error',
                      allowOutsideClick: false,
                      heightAuto: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      this.showSpinner = false;
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

  //Negotiation done fixing
  negodonewithfixing() {
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));
    const allValuesExist = secondArray.filter((obj) =>
      firstArray.includes(obj.propid)
    );
    const propIds = allValuesExist.map((obj) => obj.propid).join(',');
    const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the RSV',
        icon: 'error',
        confirmButtonText: 'ok',
      });
    } else {
      this.showSpinner = true;
      var visiteddate = $('#negovisiteddate').val();
      var visitedtime = $('#negovisitedtime').val();
      var negofinalremarks = 'Final Negotiation Finished';
      var nextactiondate = $('#subnegonextactiondate').val();
      var nextactiontime = $('#subnegonextactiontime').val();
      var dateformatchange = new Date(nextactiondate).toDateString();

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

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing FN is restricted for demo accounts',
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
            stage: 'Final Negotiation',
            stagestatus: '3',
            propid: existingObject['propid'],
            execid: this.userid,
            visitupdate: existingObject['actionid'],
            remarks: existingObject['remarks'],
            accompany: existingObject['accompany'],
            assignid: this.negoexecutiveId,
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
          assignid: this.negoexecutiveId,
          feedback: this.feedbackID,
        };
        this._retailservice.addnegoselectedproperties(param).subscribe(
          (success) => {
            let param2 = {
              leadid: this.leadId,
              execid: this.userid,
              assignid: this.negoexecutiveId,
              feedback: this.feedbackID,
              categoryid: this.categoryid,
            };
            if (success['status'] == 'True') {
              this._retailservice
                .negoselectproperties(param2)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectednegolists'];
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
                      ' Changed the status to Final Negotiation after Successfully completed Final Negotiation';
                    var leadsvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '3',
                      textarearemarks: negofinalremarks,
                      userid: this.userid,
                      assignid: this.negoexecutiveId,
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
                              'Scheduled the Final Negotiation for ' +
                              this.selectedproperty_commaseperated +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              nextactiondate;
                            var leadnegofixparam = {
                              leadid: this.leadId,
                              closedate: nextactiondate,
                              closetime: nextactiontime,
                              leadstage: 'Final Negotiation',
                              stagestatus: '1',
                              textarearemarks: negofinalremarks,
                              userid: this.userid,
                              assignid: this.negoexecutiveId,
                              autoremarks: this.autoremarks,
                              weekplan: '',
                              property: this.suggestchecked,
                              feedback: this.feedbackID,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadnegofixparam)
                              .subscribe(
                                (success) => {
                                  this.showSpinner = false;
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title: 'Negotiation Fixed Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        this.fnDoneModel.dismiss();
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
                    Swal.fire({
                      title: 'Some error Occured,Try Again..! ',
                      icon: 'error',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      this.showSpinner = false;
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

    this.visitedprop = [];
  }

  // to open suggested prop modal present in parent component
  notifyParent() {
    this.openModal.emit();
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.fnTime) {
      const [time, modifier] = this.fnTime.split(' ');
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
      this.fnTime = '';
      $('#negonextactiontime').val('');
      $('#refixtime').val('');
      $('#negovisitedtime').val('');
      $('#subnegonextactiontime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  updateFNDone() {
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
      var visiteddate = $('#negovisiteddate').val();
      var visitedtime = $('#negovisitedtime').val();
      var negofinalremarks = 'Final Negotiation Done';

      let date = new Date($('#negovisiteddate').val());
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
        assignid: this.negoexecutiveId,
        feedback: this.feedbackID,
      };
      if (visiteddate != '' && visitedtime != '') {
        this._retailservice.addnegoselectedproperties(param).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              this.suggestchecked = '';
              var param = {
                leadid: this.leadId,
                execid: this.userid,
                assignid: this.negoexecutiveId,
                feedback: this.feedbackID,
              };
              this._retailservice
                .negoselectproperties(param)
                .subscribe((selectsuggested) => {
                  if (selectsuggested['status'] == 'True') {
                    this.selectedpropertylists =
                      selectsuggested['selectednegolists'];
                    this.selectedlists = selectsuggested;
                    for (const existingObject of this.selectedpropertylists) {
                      var visitparam = {
                        leadid: this.leadId,
                        closedate: visiteddate,
                        closetime: visitedtime,
                        stage: 'Final Negotiation',
                        stagestatus: '4',
                        propid: existingObject['propid'],
                        execid: this.userid,
                        visitupdate: 9,
                        remarks:
                          'Final Negotiation Done for' +
                          ' ' +
                          existingObject['name'],
                        accompany: this.negoexecutiveId,
                        assignid: this.negoexecutiveId,
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
                    this.autoremarks = ' Final Negotiation Done Successfully';
                    var leadsvdoneparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '1',
                      textarearemarks: negofinalremarks,
                      userid: this.userid,
                      assignid: this.negoexecutiveId,
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
                            // let currentUrl = this.router.url;
                            // let pathWithoutQueryParams = currentUrl.split('?')[0];
                            // let currentQueryparams = this.route.snapshot.queryParams;
                            // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                            //   this.router.navigate([pathWithoutQueryParams], { queryParams: currentQueryparams });
                            // });
                            // const currentParams = this.activeroute.snapshot.queryParams;
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

  enableVisitdate(num) {
    if (num == 1) {
      this.isEdit = false;
      setTimeout(() => {
        this.scriptfunctions();

        if (this.assignedRM && this.assignedRM.length > 0) {
          const date = this.assignedRM[0].latest_action_date;
          const time = this.assignedRM[0].latest_action_time;

          $('#negovisiteddate').val(date);
          $('#negovisitedtime').val(time);

          // Optional: update calendar internal state
          $('.negovisitedcalendardate').calendar('set date', new Date(date));
          $('.calendartime').calendar('set date', this.convertToDateTime(time));
        }
      }, 0);
    } else if ((num = 2)) {
      this.isEdit = true;
    }
  }

  scriptfunctions() {
    $('.ui.dropdown').dropdown();
    $('.calendardate').calendar({
      type: 'date',
      // minDate: this.date,
      // maxDate: this.priorDate,
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          return year + '-' + month + '-' + day;
        },
      },
    });
    $('.negovisitedcalendardate').calendar({
      type: 'date',
      // minDate: this.priorDatebefore,
      // maxDate: this.date,
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          var month = date.getMonth() + 1;
          var year = date.getFullYear();
          return year + '-' + month + '-' + day;
        },
      },
    });
    var minDate = new Date();
    var maxDate = new Date();
    minDate.setHours(7);
    maxDate.setHours(20);
    $('.calendartime').calendar({
      type: 'time',
      disableMinute: true,
      minDate: minDate,
      maxDate: maxDate,
    });
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
