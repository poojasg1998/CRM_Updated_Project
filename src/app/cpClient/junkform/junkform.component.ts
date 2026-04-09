import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';
declare var $: any;

@Component({
  selector: 'app-junkform',
  templateUrl: './junkform.component.html',
  styleUrls: ['./junkform.component.scss'],
})
export class JunkformComponent implements OnInit {
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() selectedBtn: any;
  leadId: string;
  userid: string;
  excludedIds: any;
  executeid: any;
  propertyid: any = '';
  junkExecutiveId: any;
  junkcategories: any;
  suggestchecked: string = '';
  junkcatognames: any;
  autoremarks: string;
  showSpinner = true;
  assignedRM;
  categoryid: string;
  constructor(
    private router: Router,
    private activeroute: ActivatedRoute,
    private _retailservice: CpApiService,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) {}
  feedbackID = '';

  ngOnInit() {
    this.activeroute.queryParamMap.subscribe((params) => {
      const paramMap = params.get('leadid');
      this.leadId = params.get('leadid');
      this.categoryid = params.get('categoryid');
      this.feedbackID = params.get('feedback') ? params.get('feedback') : '';
      const isEmpty = !paramMap;
      this.userid = localStorage.getItem('UserId');

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
          .subscribe((cust) => {
            this.showSpinner = false;

            this.assignedRM = cust['RMname'].filter((lead) => {
              return lead.RMID == this.selectedExecId;
            });

            if (
              cust['RMname']?.[0]?.['suggestedprop'] &&
              cust['RMname']?.[0]?.['suggestedprop'].length > 0
            ) {
              this.propertyid =
                cust['RMname']?.[0]?.['suggestedprop']?.[0]?.propid;
            }
            this.junkExecutiveId = this.selectedExecId;

            // if(this.userid == '1'){
            //   this.junkExecutiveId=this.selectedExecId;
            // }else{
            //   this.junkExecutiveId = this.executeid;
            // }
          });
      }
      this._retailservice.getjunksections().subscribe((junkcategos) => {
        this.junkcategories = junkcategos['JunkCategories'];
      });

      //   this._retailservice
      // .getmandateselectedsuggestproperties(this.leadid,this.userid)
      // .subscribe(selectsuggested => {
      //   this.selectedpropertylists = selectsuggested['selectedlists'];
      //   this.propertyid = this.selectedpropertylists.map((item) => { return item.propid }).join(',');
      // });
    });
  }

  junkcategoryId: any;
  selectsuggested(id, name) {
    this.junkcategoryId = id;
    var checkid = $("input[name='programming1']:checked")
      .map(function () {
        return (this as HTMLInputElement).value;
      })
      .get()
      .join(',');
    // this.suggestchecked = checkid;
    this.junkcatognames = name;
  }

  junkmoving() {
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

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
      // USV DONE with JUNK Fixing
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
        if ($('#USVvisiteddate').val() == '') {
          $('#USVvisiteddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#USVvisitedtime').val() == '') {
          $('#USVvisiteddate').removeAttr('style');
          $('#USVvisitedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if (
          $('#junkremarks').val() == '' ||
          $('#junkremarks').val().match(/^\s+$/) !== null
        ) {
          $('#USVvisitedtime').removeAttr('style');
          $('#junkremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks for Move to Junk');
        } else {
          $('#junkremarks').removeAttr('style');
          if (this.junkcategoryId == '' || this.junkcategoryId == undefined) {
            Swal.fire({
              title: 'Select any JUNK Reason',
              text: 'Select any Reason for the JUNK',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'OK',
            });
          } else {
            var visiteddate = $('#USVvisiteddate').val();
            var visitedtime = $('#USVvisitedtime').val();
            var usvleadstage = 'USV';
            var usvstagestatus = '3';
            var usvfinalremarks = 'USV Done';
            this.showSpinner = true;
            var textarearemarks = $('#junkremarks').val();
            var userid = localStorage.getItem('UserId');
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

          this.autoremarks =
            ' Moved the lead to Junk, Because of ' + this.junkcatognames;
          var usvleadjunkparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: usvleadstage,
            stagestatus: usvstagestatus,
            textarearemarks: usvfinalremarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          var junkparam = {
            leadid: this.leadId,
            closedate: '',
            closetime: '',
            leadstage: 'Move to Junk',
            stagestatus: this.junkcategoryId,
            textarearemarks: textarearemarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          this._retailservice.addleadhistoryretail(usvleadjunkparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice.addleadhistoryretail(junkparam).subscribe(
                  (response) => {
                    if (response['status'] == 'True') {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Lead Moved Successfully',
                        icon: 'success',
                        heightAuto: false,
                        confirmButtonText: 'OK!',
                        allowOutsideClick: false,
                      }).then((result) => {
                        if (result.value) {
                          this.modalController.dismiss();
                          // window.location.reload();
                          //  this.router.navigate([],{
                          //   queryParams:{
                          //     stageForm: 'onleadStatus' ,
                          //   },
                          //   queryParamsHandling: 'merge'
                          // })
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
        // if ($('#junkremarks').val() == "" || $('#junkremarks').val().match(/^\s+$/) !== null) {
        //   $('#junkremarks').focus().css("border-color", "red").attr('placeholder', 'Please add some remarks for Move to Junk');
        // }
        // else {
        //   $('#junkremarks').removeAttr("style");
        // }
      }
      // USV DONE with JUNK Fixing

      // SV DONE with JUNK Fixing
      else if ($('#customer_phase4').val() == 'SV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');
        if ($('#SVvisiteddate').val() == '') {
          $('#SVvisiteddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#SVvisitedtime').val() == '') {
          $('#SVvisiteddate').removeAttr('style');
          $('#SVvisitedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#svfinalremarks').val() == '') {
          $('#SVvisitedtime').removeAttr('style');
          $('#svfinalremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks about the SV');
        } else {
          $('#svfinalremarks').removeAttr('style');
        }

        if (this.junkcategoryId == '' || this.junkcategoryId == undefined) {
          Swal.fire({
            title: 'Select any JUNK Reason',
            text: 'Select any Reason for the JUNK',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK',
          });
        } else if (
          $('#junkremarks').val() == '' ||
          $('#junkremarks').val().match(/^\s+$/) !== null
        ) {
          $('#junkremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks for Move to Junk');
        } else {
          $('#junkremarks').removeAttr('style');
          var visiteddate = $('#SVvisiteddate').val();
          var visitedtime = $('#SVvisitedtime').val();
          var svleadstage = 'SV';
          var svstagestatus = '3';
          var svfinalremarks = 'SV Done';

          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');

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

          this.showSpinner = true;
          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');
          this.autoremarks =
            ' Moved the lead to Junk, Because of ' + this.junkcatognames;
          var svleadjunkparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: svleadstage,
            stagestatus: svstagestatus,
            textarearemarks: svfinalremarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          var junkparam1 = {
            leadid: this.leadId,
            closedate: '',
            closetime: '',
            leadstage: 'Move to Junk',
            stagestatus: this.junkcategoryId,
            textarearemarks: textarearemarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          this._retailservice.addleadhistoryretail(svleadjunkparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice.addleadhistoryretail(junkparam1).subscribe(
                  (response) => {
                    if (response['status'] == 'True') {
                      Swal.fire({
                        title: 'Lead Moved Successfully',
                        icon: 'success',
                        heightAuto: false,
                        confirmButtonText: 'OK!',
                        allowOutsideClick: false,
                      }).then((result) => {
                        if (result.value) {
                          this.modalController.dismiss();
                          // this.router.navigate([],{
                          //   queryParams:{
                          //     stageForm: 'onleadStatus' ,
                          //   },
                          //   queryParamsHandling: 'merge'
                          // })
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
      // SV DONE with JUNK Fixing

      // RSV DONE with JUNK Fixing
      else if ($('#sectionselector').val() == 'RSV') {
        // const allValuesExist = secondArray.filter((obj) => firstArray.includes(obj.propid));

        var allValuesExist;
        if (firstArray.length == 0) {
          allValuesExist = secondArray;
        } else {
          allValuesExist = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
          const propIds = allValuesExist.map((obj) => obj.propid).join(',');
          const propnames = allValuesExist
            .map((obj) => obj.prop_name)
            .join(',');
        }

        if ($('#RSVvisiteddate').val() == '') {
          $('#RSVvisiteddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#RSVvisitedtime').val() == '') {
          $('#RSVvisiteddate').removeAttr('style');
          $('#RSVvisitedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select The Time');
        } else {
          $('#RSVvisitedtime').removeAttr('style');
        }

        if (this.junkcategoryId == '' || this.junkcategoryId == undefined) {
          Swal.fire({
            title: 'Select any JUNK Reason',
            text: 'Select any Reason for the JUNK',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          });
        } else if (
          $('#junkremarks').val() == '' ||
          $('#junkremarks').val().match(/^\s+$/) !== null
        ) {
          $('#junkremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks for Move to Junk');
        } else {
          $('#junkremarks').removeAttr('style');
          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();
          var rsvleadstage = 'RSV';
          var rsvstagestatus = '3';
          var rsvfinalremarks = 'RSV Done';

          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');

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

          this.showSpinner = true;
          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');

          this.autoremarks =
            ' Moved the lead to Junk, Because of ' + this.junkcatognames;
          var rsvleadjunkparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: rsvleadstage,
            stagestatus: rsvstagestatus,
            textarearemarks: rsvfinalremarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          var junkparam2 = {
            leadid: this.leadId,
            closedate: '',
            closetime: '',
            leadstage: 'Move to Junk',
            stagestatus: this.junkcategoryId,
            textarearemarks: textarearemarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };

          this._retailservice.addleadhistoryretail(rsvleadjunkparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice.addleadhistoryretail(junkparam2).subscribe(
                  (success1) => {
                    if (success1['status'] == 'True') {
                      Swal.fire({
                        title: 'Lead Moved Successfully',
                        icon: 'success',
                        heightAuto: false,
                        timer: 2000,
                        showConfirmButton: false,
                        allowOutsideClick: false,
                      }).then(() => {
                        this.modalController.dismiss();
                        //  this.router.navigate([],{
                        //         queryParams:{
                        //           stageForm: 'onleadStatus' ,
                        //         },
                        //         queryParamsHandling: 'merge'
                        //       })
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
        }
      }
      // RSV DONE with JUNK Fixing

      // FN DONE with JUNK Fixing
      else if ($('#customer_phase4').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        const propIds = allValuesExist.map((obj) => obj.propid).join(',');
        const propnames = allValuesExist.map((obj) => obj.prop_name).join(',');

        if ($('#negovisiteddate').val() == '') {
          $('#negovisiteddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#negovisitedtime').val() == '') {
          $('#negovisiteddate').removeAttr('style');
          $('#negovisitedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else {
          $('#negovisitedtime').removeAttr('style');
        }
        if (this.junkcategoryId == '' || this.junkcategoryId == undefined) {
          Swal.fire({
            title: 'Select any JUNK Reason',
            text: 'Select any Reason for the JUNK',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK',
          });
        } else if (
          $('#junkremarks').val() == '' ||
          $('#junkremarks').val().match(/^\s+$/) !== null
        ) {
          $('#junkremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks for Move to Junk');
        } else {
          $('#junkremarks').removeAttr('style');
          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var fnleadstage = 'Final Negotiation';
          var fnstagestatus = '3';
          var fnfinalremarks = 'Final Negotiation Finished';

          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');
          this.showSpinner = true;
          var textarearemarks = $('#junkremarks').val();
          var userid = localStorage.getItem('UserId');
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
          this.autoremarks =
            ' Moved the lead to Junk, Because of ' + this.junkcatognames;
          var fnleadjunkparam = {
            leadid: this.leadId,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: fnleadstage,
            stagestatus: fnstagestatus,
            textarearemarks: fnfinalremarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };
          var junkparam4 = {
            leadid: this.leadId,
            closedate: '',
            closetime: '',
            leadstage: 'Move to Junk',
            stagestatus: this.junkcategoryId,
            textarearemarks: textarearemarks,
            userid: userid,
            assignid: this.junkExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedback: this.feedbackID,
          };
          this._retailservice.addleadhistoryretail(fnleadjunkparam).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                this._retailservice.addleadhistoryretail(junkparam4).subscribe(
                  (response) => {
                    if (response['status'] == 'True') {
                      Swal.fire({
                        title: 'Lead Moved Successfully',
                        icon: 'success',
                        heightAuto: false,
                        confirmButtonText: 'OK!',
                        allowOutsideClick: false,
                      }).then((result) => {
                        if (result.value) {
                          this.modalController.dismiss();
                          // this.router.navigate([],{
                          //   queryParams:{
                          //     stageForm: 'onleadStatus' ,
                          //   },
                          //   queryParamsHandling: 'merge'
                          // })
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
      // FN DONE with JUNK Fixing

      // DIRECT JUNK FIXING
      else {
        if (
          $('#junkremarks').val() == '' ||
          $('#junkremarks').val().match(/^\s+$/) !== null
        ) {
          $('#junkremarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please add some remarks for Move to Junk');
        } else {
          $('#junkremarks').removeAttr('style');
          if (this.junkcategoryId == '' || this.junkcategoryId == undefined) {
            Swal.fire({
              title: 'Select any JUNK Reason',
              text: 'Select any Reason for the JUNK',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'OK',
            });
          } else {
            this.showSpinner = true;
            var textarearemarks = $('#junkremarks').val();
            var userid = localStorage.getItem('UserId');
            this.autoremarks =
              ' Moved the lead to Junk, Because of ' + this.junkcatognames;
            var leadjunkparam1 = {
              leadid: this.leadId,
              closedate: '',
              closetime: '',
              leadstage: 'Move to Junk',
              stagestatus: this.junkcategoryId,
              textarearemarks: textarearemarks,
              userid: userid,
              assignid: this.junkExecutiveId,
              autoremarks: this.autoremarks,
              property: '',
              feedback: this.feedbackID,
            };
            this._retailservice.addleadhistoryretail(leadjunkparam1).subscribe(
              (success) => {
                if (success['status'] == 'True') {
                  this.showSpinner = false;
                  Swal.fire({
                    title: 'Lead Moved Successfully',
                    icon: 'success',
                    heightAuto: false,
                    confirmButtonText: 'OK!',
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      this.modalController.dismiss();
                      // this.router.navigate([],{
                      //   queryParams:{
                      //     stageForm: 'onleadStatus' ,
                      //   },
                      //   queryParamsHandling: 'merge'
                      // })
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
        }
      }
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }
}
