import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';
declare var $: any;

@Component({
  selector: 'app-closedform',
  templateUrl: './closedform.component.html',
  styleUrls: ['./closedform.component.scss'],
})
export class ClosedformComponent implements OnInit {
  date: String = new Date().toISOString();
  feedbackid = '';
  @Input() selectedSuggestedProp: any;
  @Input() selectedExecId: any;
  @Input() selectedBtn: any;

  @Input() refreshTrigger: any;
  closedDate;
  closedTime;
  userid: string;
  leadId: string;
  visitedlistlocally: any[] = [];
  executeid: any;
  closedexecutiveId: any;
  adminview: boolean;
  execview: boolean;
  visitedpropertylists: any;
  suggestchecked: any;
  selectedItem = 0;
  unitselection: any;
  autoremarks: string;
  showSpinner = true;
  roleid;
  feedbackID = '';
  categoryid: string;
  constructor(
    private activeroute: ActivatedRoute,
    private _retailservice: CpApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.activeroute.queryParamMap.subscribe((params) => {
      const paramMap = params.get('leadid');
      this.leadId = params.get('leadid');
      this.categoryid = params.get('categoryid');
      this.roleid = localStorage.getItem('Role');
      const isEmpty = !paramMap;
      this.userid = localStorage.getItem('UserId');
      this.feedbackID = params.get('feedback') ? params.get('feedback') : '';
      if ('propertyloops' in localStorage) {
        const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
        const secondArray = JSON.parse(localStorage.getItem('visitedprop'));
        this.visitedlistlocally = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      } else {
        this.visitedlistlocally = [0];
      }

      if (!isEmpty) {
        this._retailservice
          .getassignedrmretail(
            this.leadId,
            this.userid,
            this.feedbackid,
            this.categoryid
          )
          .subscribe((cust) => {
            this.executeid = cust['RMname'][0].executiveid;
            if (this.userid == '1') {
              this.closedexecutiveId = this.selectedExecId;
            } else {
              this.closedexecutiveId = this.selectedExecId;
            }
            this.loadimportantapi();
          });
      }

      if (localStorage.getItem('Role') == null) {
        this.router.navigateByUrl('/login');
      } else if (localStorage.getItem('Role') == '1') {
        this.adminview = true;
        this.execview = false;
      } else {
        this.adminview = false;
        this.execview = true;
      }
    });
  }

  loadimportantapi() {
    var param = {
      leadid: this.leadId,
      execid: this.userid,
      assignid: this.closedexecutiveId,
      stage: $('#customer_phase4').val(),
      feedback: this.feedbackID,
      categoryid: this.categoryid,
    };
    this._retailservice
      .getvisitedsuggestpropertiesretail(param)
      .subscribe((visitsuggested) => {
        if (visitsuggested['status'] == 'True') {
        } else {
          this.showSpinner = false;
        }
        this.visitedpropertylists = visitsuggested['visitedlists'];
        //here iam filtering based on the actions ,if actions is 6 the its lead closed ,so lead closed should not be displayed.
        if (this.visitedpropertylists) {
          this.visitedpropertylists = this.visitedpropertylists?.filter(
            (pro) => pro.actions != '6'
          );
          this.visitedlistlocally = this.visitedlistlocally?.filter((val) =>
            this.visitedpropertylists.includes((da) => {
              return da.propid != val.propid;
            })
          );
        }
        this.suggestchecked = this.visitedpropertylists
          ?.map((item) => {
            return item.propid;
          })
          .join(',');
        this.showSpinner = false;
      });
  }

  showleadClose: boolean = false;
  selectedtabIndex: number;
  selectedLeadProperty: any;
  localproperties: boolean = false;
  uploads: string[] = [];
  closurefiles: string[] = [];
  tabclick(i, prop) {
    //to make the varibale empty string

    $('#customFile-' + '0').val('');
    this.uploads = [];
    if (
      this.selectedLeadProperty !== undefined &&
      this.selectedLeadProperty?.propid !== prop.propid
    ) {
      $('.selectedunits1').val('');
      $('#unitnum').val('');
      $('#dimension').val('');
      $('#ratepersquarfeet').val('');
      $('#remarks').val('');
      $('.radiocheck').prop('checked', false);
    }

    if (prop != '' || prop != undefined) {
      $('.closerequestform').css('height', '');
    }

    $('.tab2').removeClass('actionsloc');
    $('.tab2').addClass('actionbtns2');
    $('.tabicon2').removeClass('selectMarkloc');
    $('.tabicon2').addClass('iconmark2');

    $('.actions').addClass('actionbtns');
    $('.selectMark').addClass('iconmark');
    $('.actionbtns').removeClass('actions');
    $('.iconmark').removeClass('selectMark');

    $('.actions' + i).removeClass('actionbtns');
    $('.actions' + i).addClass('actions');
    $('.selectMark' + i).removeClass('iconmark');
    $('.selectMark' + i).addClass('selectMark');
    this.showleadClose = true;
    this.selectedtabIndex = i;
    this.selectedLeadProperty = prop;
    this.localproperties = false;
    $('.classremover').removeClass('active');
  }

  selectedFileName;
  tabclick2(i, prop) {
    this.localproperties = true;
    //to make the varibale empty string
    $('#unitnum2').val('');
    $('#dimension2').val('');
    $('#ratepersquarfeet2').val('');
    $('#remarks2').val('');
    $('#customFile-' + '0').val('');
    this.uploads = [];
    if (
      this.selectedLeadProperty !== undefined &&
      this.selectedLeadProperty.propid !== prop.propid
    ) {
      $('.selectedunits2').val('');
      $('.radiocheck').prop('checked', false);
    }

    if (prop != '' || prop != undefined) {
      $('.closerequestform').css('height', '');
    }

    $('.tab1').removeClass('actions');
    $('.tabicon1').removeClass('selectMark');
    $('.tabicon1').addClass('iconmark');
    $('.tab1').addClass('actionbtns');

    $('.actionsloc').addClass('actionbtns2');
    $('.selectMarkloc').addClass('iconmark2');
    $('.actionbtns2').removeClass('actionsloc');
    $('.iconmark2').removeClass('selectMarkloc');

    $('.actionsloc' + i).removeClass('actionbtns2');
    $('.actionsloc' + i).addClass('actionsloc');
    $('.selectMarkloc' + i).removeClass('iconmark2');
    $('.selectMarkloc' + i).addClass('selectMarkloc');

    // $(".actions").removeClass("actionbtns");
    // $(".selectMark").removeClass("iconmark");

    this.showleadClose = true;
    this.selectedtabIndex = i;
    this.selectedLeadProperty = prop;
    $('.classremover').removeClass('active');
  }

  unitselection1() {
    var checkid = $("input[name='selectnew']:checked")
      .map(function () {
        return this.value;
      })
      .get()
      .join(',');
    const a = document.getElementById('selectedunits1') as HTMLInputElement;
    a.value = checkid;
    this.unitselection = $('#selectedunits1').val();
  }

  imageuploads(i, event) {
    const files = event.target.files;
    if (files) {
      let allFilesValid = true;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 1110000) {
          allFilesValid = false;
          Swal.fire({
            title: 'File Size Exceeded',
            text: 'File Size limit is 1MB',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          }).then((result) => {
            if (result.value) {
              $('#customFile' + i).val('');
              this.closurefiles = [];
            }
          });
          break;
        }
      }

      if (allFilesValid) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = file.name;
          this.selectedFileName = fileName;
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
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeImage(i) {
    this.closurefiles.splice(i, 1);
    this.uploads.splice(i, 1);
    if (this.uploads.length == 0) {
      $('#customFile' + i).val('');
      $('.file-label-' + i).html('Choose file ');
      this.selectedFileName = '';
    } else {
    }
  }

  closingrequest() {
    // USV DONE with Lead Closing
    let propid = this.selectedLeadProperty.propid;
    let propname = this.selectedLeadProperty.name;

    let closeLeadStage: any;
    if (this.userid == '1') {
      closeLeadStage = 'Admin Lead Closed';
    } else {
      closeLeadStage = 'Deal Closing Request';
    }
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Deal Closing Request restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      if ($('#sectionselector').val() == 'USV') {
        var allValuesExist;
        if (firstArray.length === 0) {
          allValuesExist = secondArray;
        } else {
          allValuesExist = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
        }

        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits1').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum').val() == '' ||
          $('#unitnum').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension').val() == '' ||
          $('#dimension').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum').removeAttr('style');
          $('#dimension')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet').val() == '' ||
          $('#ratepersquarfeet').val().match(/^\s+$/) !== null
        ) {
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks').val() == '' ||
          $('#remarks').val().match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          $('#remarks').removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum').removeAttr('style');
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;
          var unitnumbers = $('#unitnum').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#USVvisiteddate').val();
              var visitedtime = $('#USVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
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

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#USVvisiteddate').val();
                    var visitedtime = $('#USVvisitedtime').val();
                    // var usvfinalremarks = $('#usvfinalremarks').val();
                    var usvfinalremarks = 'USV Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the USV';
                    var leadusvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'USV',
                      stagestatus: '3',
                      textarearemarks: usvfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadusvparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Request Send Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        // const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          this.showSpinner = false;
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //           const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                // const currentUrl = this.router.url;
                                                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                                //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                                // });
                                                location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = false;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;

            var visiteddate = $('#USVvisiteddate').val();
            var visitedtime = $('#USVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
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

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }
            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#USVvisiteddate').val();
                  var visitedtime = $('#USVvisitedtime').val();
                  // var usvfinalremarks = $('#usvfinalremarks').val();
                  var usvfinalremarks = 'USV Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the USV';
                  var leadusvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'USV',
                    stagestatus: '3',
                    textarearemarks: usvfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadusvparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Request Send Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //           const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        this.showSpinner = false;
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //             const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              // const currentUrl = this.router.url;
                                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                              //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                              // });
                                              location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then(() => {
                                    this.showSpinner = false;
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
                } else if (res['status'] === 'Duplicate Request') {
                  // this.filterLoader = false;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  }).then(() => {
                    this.showSpinner = false;
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // USV DONE with Lead Closing

      // SV DONE with Lead Closing
      else if ($('#sectionselector').val() == 'SV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits1').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          }).then(() => {
            this.showSpinner = false;
          });
        } else if (
          $('#unitnum').val() == '' ||
          $('#unitnum').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension').val() == '' ||
          $('#dimension').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum').removeAttr('style');
          $('#dimension')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet').val() == '' ||
          $('#ratepersquarfeet').val().match(/^\s+$/) !== null
        ) {
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks').val() == '' ||
          $('#remarks').val().match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          $('#remarks').removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum').removeAttr('style');
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#SVvisiteddate').val();
              var visitedtime = $('#SVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .retailpropertyvisitupdate(visitparam)
                  .subscribe(
                    (success) => {
                      // this.status = success.status;
                      if (success['status'] == 'True') {
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#SVvisiteddate').val();
                    var visitedtime = $('#SVvisitedtime').val();
                    var svfinalremarks = 'SV Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the SV';
                    var leadsvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'SV',
                      stagestatus: '3',
                      textarearemarks: svfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadsvparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //           const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          this.showSpinner = false;
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            // this.filterLoader = false;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              allowOutsideClick: false,
                                              heightAuto: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //                const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            // this.filterLoader = false;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                // const currentUrl = this.router.url;
                                                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                                //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                                // });
                                                location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    // this.filterLoader = false;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then(() => {
                                      this.showSpinner = false;
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
                  } else if (res['status'] === 'Duplicate Request') {
                    // this.filterLoader = false;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    }).then(() => {
                      this.showSpinner = false;
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;

            var visiteddate = $('#SVvisiteddate').val();
            var visitedtime = $('#SVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
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

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#SVvisiteddate').val();
                  var visitedtime = $('#SVvisitedtime').val();
                  // var svfinalremarks = $('#svfinalremarks').val();
                  var svfinalremarks = 'SV Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the SV';
                  var leadsvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'SV',
                    stagestatus: '3',
                    textarearemarks: svfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadsvparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      // const currentParams = this.activeroute.snapshot.queryParams;
                                      //                this.router.navigate([], {
                                      //                 relativeTo: this.activeroute,
                                      //                 queryParams: {
                                      //                   ...currentParams,
                                      //                   stageForm: 'onleadStatus'
                                      //                 },
                                      //                 queryParamsHandling: 'merge'  // merges with existing params
                                      //               });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        this.showSpinner = false;
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          // this.filterLoader = false;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            $('.modal-backdrop')
                                              .closest('div')
                                              .remove();
                                            $('body').removeClass('modal-open');
                                            if (result.value) {
                                              this.modalController.dismiss();
                                              //              const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            }
                                          });
                                        } else {
                                          // this.filterLoader = false;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              // const currentUrl = this.router.url;
                                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                              //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                              // });
                                              location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = false;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then(() => {
                                    this.showSpinner = false;
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
                } else if (res['status'] === 'Duplicate Request') {
                  // this.filterLoader = false;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  }).then(() => {
                    this.showSpinner = false;
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // SV DONE with Lead Closing

      // RSV DONE with Lead Closing
      else if ($('#sectionselector').val() == 'RSV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits1').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum').val() == '' ||
          $('#unitnum').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension').val() == '' ||
          $('#dimension').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum').removeAttr('style');
          $('#dimension')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet').val() == '' ||
          $('#ratepersquarfeet').val().match(/^\s+$/) !== null
        ) {
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks').val() == '' ||
          $('#remarks').val().match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          $('#remarks').removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum').removeAttr('style');
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks').removeAttr('style');
          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#RSVvisiteddate').val();
              var visitedtime = $('#RSVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .retailpropertyvisitupdate(visitparam)
                  .subscribe(
                    (success) => {
                      // this.status = success.status;
                      if (success['status'] == 'True') {
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#RSVvisiteddate').val();
                    var visitedtime = $('#RSVvisitedtime').val();
                    // var rsvfinalremarks = $('#rsvfinalremarks').val();
                    // var rsvfinalremarks = "RSV Done";
                    var rsvfinalremarks = 'RSV Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                    var leadrsvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'RSV',
                      stagestatus: '3',
                      textarearemarks: rsvfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadrsvparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //            const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = false;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //              const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            this.showSpinner = false;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              allowOutsideClick: false,
                                              heightAuto: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                this.modalController.dismiss();
                                                //                  const currentParams = this.activeroute.snapshot.queryParams;
                                                //  this.router.navigate([], {
                                                //   relativeTo: this.activeroute,
                                                //   queryParams: {
                                                //     ...currentParams,
                                                //     stageForm: 'onleadStatus'
                                                //   },
                                                //   queryParamsHandling: 'merge'  // merges with existing params
                                                // });
                                                location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    // this.filterLoader = false;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then(() => {
                                      this.showSpinner = false;
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
                  } else if (res['status'] === 'Duplicate Request') {
                    // this.filterLoader = false;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    }).then(() => {
                      this.showSpinner = false;
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            var visiteddate = $('#RSVvisiteddate').val();
            var visitedtime = $('#RSVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
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

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#RSVvisiteddate').val();
                  var visitedtime = $('#RSVvisitedtime').val();
                  var rsvfinalremarks = 'RSV Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                  var leadrsvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'RSV',
                    stagestatus: '3',
                    textarearemarks: rsvfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadrsvparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                // this.status = success.status;
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //          const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = false;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //            const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          this.showSpinner = false;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              // const currentUrl = this.router.url;
                                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                              //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                              // });
                                              location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = false;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then(() => {
                                    this.showSpinner = false;
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
                } else if (res['status'] === 'Duplicate Request') {
                  this.showSpinner = false;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  }).then(() => {
                    this.showSpinner = false;
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // RSV DONE with Lead Closing

      // NEGOTIATION DONE with Lead Closing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits1').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum').val() == '' ||
          $('#unitnum').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension').val() == '' ||
          $('#dimension').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum').removeAttr('style');
          $('#dimension')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet').val() == '' ||
          $('#ratepersquarfeet').val().match(/^\s+$/) !== null
        ) {
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks').val() == '' ||
          $('#remarks').val().match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          $('#remarks').removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum').removeAttr('style');
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#negovisiteddate').val();
              var visitedtime = $('#negovisitedtime').val();

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
                  assignid: this.closedexecutiveId,
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

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#negovisiteddate').val();
                    var visitedtime = $('#negovisitedtime').val();
                    // var negofinalremarks = $('#negofinalremarks').val();
                    var negofinalremarks = 'Final Negotiation Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                    var leadnegoparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '3',
                      textarearemarks: negofinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadnegoparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //          const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              $('.modal-backdrop')
                                                .closest('div')
                                                .remove();
                                              $('body').removeClass(
                                                'modal-open'
                                              );
                                              if (result.value) {
                                                this.modalController.dismiss();
                                                //               const currentParams = this.activeroute.snapshot.queryParams;
                                                //  this.router.navigate([], {
                                                //   relativeTo: this.activeroute,
                                                //   queryParams: {
                                                //     ...currentParams,
                                                //     stageForm: 'onleadStatus'
                                                //   },
                                                //   queryParamsHandling: 'merge'  // merges with existing params
                                                // });
                                                location.reload();
                                              }
                                            });
                                          } else {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                // const currentUrl = this.router.url;
                                                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                                //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                                // });
                                                location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = true;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then(() => {
                                      this.showSpinner = false;
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    }).then(() => {
                      this.showSpinner = false;
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            var visiteddate = $('#negovisiteddate').val();
            var visitedtime = $('#negovisitedtime').val();

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
                assignid: this.closedexecutiveId,
                categoryid: this.categoryid,
              };
              this._retailservice
                .retailpropertyvisitupdate(visitparam)
                .subscribe(
                  (success) => {
                    // this.status = success.status;
                    if (success['status'] == 'True') {
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
            }

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#negovisiteddate').val();
                  var visitedtime = $('#negovisitedtime').val();
                  // var negofinalremarks = $('#negofinalremarks').val();
                  var negofinalremarks = 'Final Negotiation Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                  var leadnegoparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'Final Negotiation',
                    stagestatus: '3',
                    textarearemarks: negofinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadnegoparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                // this.status = success.status;
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //           const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            $('.modal-backdrop')
                                              .closest('div')
                                              .remove();
                                            $('body').removeClass('modal-open');
                                            if (result.value) {
                                              this.modalController.dismiss();
                                              //               const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            }
                                          });
                                        } else {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              // const currentUrl = this.router.url;
                                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                              //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                              // });
                                              location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then(() => {
                                    this.showSpinner = false;
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
                } else if (res['status'] === 'Duplicate Request') {
                  // this.filterLoader = false;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  }).then(() => {
                    this.showSpinner = false;
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // NEGOTIATION DONE with Lead Closing
      else {
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits1').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum').val() == '' ||
          $('#unitnum').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension').val() == '' ||
          $('#dimension').val().match(/^\s+$/) !== null
        ) {
          $('#unitnum').removeAttr('style');
          $('#dimension')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet').val() == '' ||
          $('#ratepersquarfeet').val().match(/^\s+$/) !== null
        ) {
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks').val() == '' ||
          $('#remarks').val().match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          $('#remarks').removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum').removeAttr('style');
          $('#dimension').removeAttr('style');
          $('#ratepersquarfeet').removeAttr('style');
          $('#remarks').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'Duplicate Request') {
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );

              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              this.autoremarks = ' Send the Deal Closing Request successfully.';
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: unitnumbers,
                dimension: dimensions,
                ratepersft: rpsft,
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };

              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  // this.status = success.status;
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      allowOutsideClick: false,
                      heightAuto: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      if (result.value) {
                        this.modalController.dismiss();
                        //   const currentParams = this.activeroute.snapshot.queryParams;
                        //  this.router.navigate([], {
                        //   relativeTo: this.activeroute,
                        //   queryParams: {
                        //     ...currentParams,
                        //     stageForm: 'onleadStatus'
                        //   },
                        //   queryParamsHandling: 'merge'  // merges with existing params
                        // });
                        location.reload();
                      }
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = true;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              heightAuto: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              $('.modal-backdrop').closest('div').remove();
                              $('body').removeClass('modal-open');
                              if (result.value) {
                                this.modalController.dismiss();
                                //         const currentParams = this.activeroute.snapshot.queryParams;
                                //  this.router.navigate([], {
                                //   relativeTo: this.activeroute,
                                //   queryParams: {
                                //     ...currentParams,
                                //     stageForm: 'onleadStatus'
                                //   },
                                //   queryParamsHandling: 'merge'  // merges with existing params
                                // });
                                location.reload();
                              }
                            });
                          } else {
                            this.showSpinner = true;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              allowOutsideClick: false,
                              heightAuto: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              if (result.value) {
                                // const currentUrl = this.router.url;
                                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                // });
                                location.reload();
                              }
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'OK!',
                    }).then(() => {
                      this.showSpinner = false;
                    });
                  }
                },
                (err) => {
                  console.log('Failed to Update');
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }
            this.showSpinner = true;
            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var closedate = $('#closeddate').val();
                  var closetime = $('#closedtime').val();
                  var textarearemarks = $('#remarks').val();
                  this.autoremarks =
                    ' Send the Deal Closing Request successfully.';
                  var leadhistparam = {
                    leadid: this.leadId,
                    closedate: closedate,
                    closetime: closetime,
                    leadstage: closeLeadStage,
                    stagestatus: '0',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    property: propid,
                    bhk: this.unitselection,
                    bhkunit: unitnumbers,
                    dimension: dimensions,
                    ratepersft: rpsft,
                    autoremarks: this.autoremarks,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadhistparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          Swal.fire({
                            title: 'Deal Closing Requested Successfully',
                            icon: 'success',
                            allowOutsideClick: false,
                            heightAuto: false,
                            confirmButtonText: 'OK!',
                          }).then((result) => {
                            if (result.value) {
                              this.modalController.dismiss();
                              //   const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            }
                          });

                          if (this.userid == '1') {
                            var param = {
                              leadid: this.leadId,
                              propid: propid,
                              execid: this.userid,
                              assignid: this.closedexecutiveId,
                              statusid: '1',
                              remarks: 'No Comments',
                            };
                            this._retailservice
                              .closingrequestresponse(param)
                              .subscribe((requestresponse) => {
                                if (requestresponse['status'] == 'True-0') {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title: 'Lead Closed Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    $('.modal-backdrop')
                                      .closest('div')
                                      .remove();
                                    $('body').removeClass('modal-open');
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //          const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                } else {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title: 'Some Error Occured',
                                    icon: 'error',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      // const currentUrl = this.router.url;
                                      // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                                      //   this.router.navigateByUrl(currentUrl, { replaceUrl: true });
                                      // });
                                      location.reload();
                                    }
                                  });
                                }
                              });
                          }
                        } else if (success['status'] == 'Duplicate Request') {
                          this.showSpinner = true;
                          Swal.fire({
                            title:
                              'Already got the request for this same Unit number',
                            icon: 'error',
                            heightAuto: false,
                            confirmButtonText: 'OK!',
                          }).then(() => {
                            this.showSpinner = false;
                          });
                        }
                      },
                      (err) => {
                        console.log('Failed to Update');
                      }
                    );
                } else if (res['status'] === 'False') {
                  this.showSpinner = true;
                  Swal.fire({
                    title: 'Some error Occured in Image upload',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  }).then(() => {
                    this.showSpinner = false;
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
    }
  }
  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.closedDate = selectedDate.toLocaleDateString('en-CA');
  }

  unitselection2() {
    var checkid = $("input[name='select2']:checked")
      .map(function () {
        return this.value;
      })
      .get()
      .join(',');
    const a = document.getElementById('selectedunits2') as HTMLInputElement;
    a.value = checkid;
    this.unitselection = $('#selectedunits2').val();
  }

  closingrequest2() {
    // USV DONE with Lead Closing
    let propid = this.selectedLeadProperty.propid;
    let propname = this.selectedLeadProperty.name;
    let closeLeadStage: any;
    if (this.userid == '1') {
      closeLeadStage = 'Lead Closed';
    } else {
      closeLeadStage = 'Deal Closing Request';
    }

    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Deal Closing Request restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      if ($('#sectionselector').val() == 'USV') {
        var allValuesExist;
        if (firstArray.length === 0) {
          allValuesExist = secondArray;
        } else {
          allValuesExist = secondArray.filter((obj) =>
            firstArray.includes(obj.propid)
          );
        }

        // if ($('#closeddate').val() == "") {
        //   $('#closeddate').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
        // }
        // else {
        //   $('#closeddate').removeAttr("style");
        // }
        // if ($('#closedtime').val() == "") {
        //   $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        // }
        // else {
        //   $('#closedtime').removeAttr("style");
        // }
        if ($('.selectedunits2').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#unitnum2').val() == '') {
          $('#unitnum2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if ($('#dimension2').val() == '') {
          $('#unitnum2').removeAttr('style');
          $('#dimension2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if ($('#ratepersquarfeet2').val() == '') {
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if ($('#remarks2').val() == '') {
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          $('#remarks2').removeAttr('style');
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');
        } else if ($('#closeddate').val() == '') {
          // $('#closeddate1').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closeddate1').removeAttr('style');
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum2').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension2').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet2').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#USVvisiteddate').val();
              var visitedtime = $('#USVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
                  categoryid: this.categoryid,
                };

                this._retailservice
                  .retailpropertyvisitupdate(visitparam)
                  .subscribe(
                    (success) => {
                      // this.status = success.status;
                      if (success['status'] == 'True') {
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#USVvisiteddate').val();
                    var visitedtime = $('#USVvisitedtime').val();
                    // var usvfinalremarks = $('#usvfinalremarks').val();
                    var usvfinalremarks = 'USV Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the USV';
                    var leadusvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'USV',
                      stagestatus: '3',
                      textarearemarks: usvfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadusvparam)
                      .subscribe(
                        (success) => {
                          //  this.status = success.status;
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks2').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;

                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  //  this.status = success.status;
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Request Send Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //      const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                        categoryid: this.categoryid,
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //           const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                window.location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = true;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;

            var visiteddate = $('#USVvisiteddate').val();
            var visitedtime = $('#USVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
                categoryid: this.categoryid,
              };
              this._retailservice
                .retailpropertyvisitupdate(visitparam)
                .subscribe(
                  (success) => {
                    // this.status = success.status;
                    if (success['status'] == 'True') {
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
            }

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#USVvisiteddate').val();
                  var visitedtime = $('#USVvisitedtime').val();
                  // var usvfinalremarks = $('#usvfinalremarks').val();
                  var usvfinalremarks = 'USV Done';
                  this.autoremarks =
                    'Changed the status to Deal Closing Request after Successfully completed the USV';
                  var leadusvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'USV',
                    stagestatus: '3',
                    textarearemarks: usvfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadusvparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        // alert("inside leadhistory")
                        if (success['status'] == 'True') {
                          // alert("inside true")
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks2').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          // alert("sfjlksd")
                          console.log(leadhistparam);
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                // this.status = success.status;
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Request Send Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //        const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                      categoryid: this.categoryid,
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //            const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              window.location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
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
                } else if (res['status'] === 'Duplicate Request') {
                  this.showSpinner = true;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // USV DONE with Lead Closing

      // SV DONE with Lead Closing
      else if ($('#sectionselector').val() == 'SV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits2').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#unitnum2').val() == '') {
          $('#unitnum2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if ($('#dimension2').val() == '') {
          $('#dimension2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if ($('#ratepersquarfeet2').val() == '') {
          $('#ratepersquarfeet2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if ($('#remarks2').val() == '') {
          $('#remarks2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          // $('#closeddate1').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        } else {
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum2').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension2').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet2').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#SVvisiteddate').val();
              var visitedtime = $('#SVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .retailpropertyvisitupdate(visitparam)
                  .subscribe(
                    (success) => {
                      // this.status = success.status;
                      if (success['status'] == 'True') {
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#SVvisiteddate').val();
                    var visitedtime = $('#SVvisitedtime').val();
                    var svfinalremarks = 'SV Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the SV';
                    var leadsvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'SV',
                      stagestatus: '3',
                      textarearemarks: svfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadsvparam)
                      .subscribe(
                        (success) => {
                          // this.status = success.status;
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks2').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //        const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                        categoryid: this.categoryid,
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //            const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                window.location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = true;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            var visiteddate = $('#SVvisiteddate').val();
            var visitedtime = $('#SVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
                categoryid: this.categoryid,
              };
              this._retailservice
                .retailpropertyvisitupdate(visitparam)
                .subscribe(
                  (success) => {
                    // this.status = success.status;
                    if (success['status'] == 'True') {
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
            }

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#SVvisiteddate').val();
                  var visitedtime = $('#SVvisitedtime').val();
                  // var svfinalremarks = $('#svfinalremarks').val();
                  var svfinalremarks = 'SV Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the SV';
                  var leadsvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'SV',
                    stagestatus: '3',
                    textarearemarks: svfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadsvparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks2').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                // this.status = success.status;
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //        const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //              const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              window.location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
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
                } else if (res['status'] === 'Duplicate Request') {
                  this.showSpinner = true;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // SV DONE with Lead Closing

      // RSV DONE with Lead Closing
      else if ($('#sectionselector').val() == 'RSV') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        // if ($('#closeddate').val() == "") {
        //   $('#closeddate').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');

        // }
        // else {
        //   $('#closeddate').removeAttr("style");
        // }
        // if ($('#closedtime').val() == "") {
        //   $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');

        // }
        // else {
        //   $('#closedtime').removeAttr("style");
        // }
        if ($('.selectedunits2').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#unitnum2').val() == '') {
          $('#unitnum2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if ($('#dimension2').val() == '') {
          $('#dimension2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if ($('#ratepersquarfeet2').val() == '') {
          $('#ratepersquarfeet2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if ($('#remarks2').val() == '') {
          $('#remarks2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          // $('#closeddate1').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        } else {
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');
          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum2').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension2').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet2').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#RSVvisiteddate').val();
              var visitedtime = $('#RSVvisitedtime').val();

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
                  assignid: this.closedexecutiveId,
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

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#RSVvisiteddate').val();
                    var visitedtime = $('#RSVvisitedtime').val();
                    // var rsvfinalremarks = $('#rsvfinalremarks').val();
                    // var rsvfinalremarks = "RSV Done";
                    var rsvfinalremarks = $('#propertyremarks').val();
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                    var leadrsvparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'RSV',
                      stagestatus: '3',
                      textarearemarks: rsvfinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadrsvparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks2').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      allowOutsideClick: false,
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        // const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                        categoryid: this.categoryid,
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              allowOutsideClick: false,
                                              heightAuto: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //            const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              allowOutsideClick: false,
                                              heightAuto: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                window.location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = true;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            var visiteddate = $('#RSVvisiteddate').val();
            var visitedtime = $('#RSVvisitedtime').val();

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
                assignid: this.closedexecutiveId,
                categoryid: this.categoryid,
              };
              this._retailservice
                .retailpropertyvisitupdate(visitparam)
                .subscribe(
                  (success) => {
                    // this.status = success.status;
                    if (success['status'] == 'True') {
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
            }

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#RSVvisiteddate').val();
                  var visitedtime = $('#RSVvisitedtime').val();
                  // var rsvfinalremarks = $('#rsvfinalremarks').val();
                  // var rsvfinalremarks = "RSV Done";
                  var rsvfinalremarks = $('#propertyremarks').val();
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                  var leadrsvparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'RSV',
                    stagestatus: '3',
                    textarearemarks: rsvfinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadrsvparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks2').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                // this.status = success.status;
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //          const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                      categoryid: this.categoryid,
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //               const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              window.location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
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
                } else if (res['status'] === 'Duplicate Request') {
                  this.showSpinner = true;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // RSV DONE with Lead Closing

      // NEGOTIATION DONE with Lead Closing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        const allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }

        if ($('.selectedunits2').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#unitnum2').val() == '') {
          $('#unitnum2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if ($('#dimension2').val() == '') {
          $('#dimension2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if ($('#ratepersquarfeet2').val() == '') {
          $('#ratepersquarfeet2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if ($('#remarks2').val() == '') {
          $('#remarks2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          // $('#closeddate1').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        } else {
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');

          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum2').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension2').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet2').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              var visiteddate = $('#negovisiteddate').val();
              var visitedtime = $('#negovisitedtime').val();

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
                  assignid: this.closedexecutiveId,
                  categoryid: this.categoryid,
                };
                this._retailservice
                  .retailpropertyvisitupdate(visitparam)
                  .subscribe(
                    (success) => {
                      // this.status = success.status;
                      if (success['status'] == 'True') {
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              }

              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'True') {
                    var visiteddate = $('#negovisiteddate').val();
                    var visitedtime = $('#negovisitedtime').val();
                    // var negofinalremarks = $('#negofinalremarks').val();
                    var negofinalremarks = 'Final Negotiation Done';
                    this.autoremarks =
                      ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                    var leadnegoparam = {
                      leadid: this.leadId,
                      closedate: visiteddate,
                      closetime: visitedtime,
                      leadstage: 'Final Negotiation',
                      stagestatus: '3',
                      textarearemarks: negofinalremarks,
                      userid: this.userid,
                      assignid: this.closedexecutiveId,
                      autoremarks: this.autoremarks,
                      property: propid,
                      categoryid: this.categoryid,
                    };

                    this._retailservice
                      .addleadhistoryretail(leadnegoparam)
                      .subscribe(
                        (success) => {
                          // this.status = success.status;
                          if (success['status'] == 'True') {
                            var closedate = $('#closeddate').val();
                            var closetime = $('#closedtime').val();
                            var textarearemarks = $('#remarks').val();
                            var dateformatchange = new Date(
                              closedate
                            ).toDateString();

                            this.autoremarks =
                              ' Send the Deal Closing Request for ' +
                              propname +
                              ' On ' +
                              dateformatchange +
                              ' ' +
                              closetime;
                            var leadhistparam = {
                              leadid: this.leadId,
                              closedate: closedate,
                              closetime: closetime,
                              leadstage: closeLeadStage,
                              stagestatus: '0',
                              textarearemarks: textarearemarks,
                              userid: this.userid,
                              assignid: this.closedexecutiveId,
                              property: propid,
                              bhk: this.unitselection,
                              bhkunit: unitnumbers,
                              dimension: dimensions,
                              ratepersft: rpsft,
                              autoremarks: this.autoremarks,
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .addleadhistoryretail(leadhistparam)
                              .subscribe(
                                (success) => {
                                  // this.status = success.status;
                                  if (success['status'] == 'True') {
                                    Swal.fire({
                                      title:
                                        'Deal Closing Requested Successfully',
                                      icon: 'success',
                                      heightAuto: false,
                                      allowOutsideClick: false,
                                      confirmButtonText: 'OK!',
                                    }).then((result) => {
                                      if (result.value) {
                                        this.modalController.dismiss();
                                        //        const currentParams = this.activeroute.snapshot.queryParams;
                                        //  this.router.navigate([], {
                                        //   relativeTo: this.activeroute,
                                        //   queryParams: {
                                        //     ...currentParams,
                                        //     stageForm: 'onleadStatus'
                                        //   },
                                        //   queryParamsHandling: 'merge'  // merges with existing params
                                        // });
                                        location.reload();
                                      }
                                    });
                                    if (this.userid == '1') {
                                      var param = {
                                        leadid: this.leadId,
                                        propid: propid,
                                        execid: this.userid,
                                        assignid: this.closedexecutiveId,
                                        statusid: '1',
                                        remarks: 'No Comments',
                                        categoryid: this.categoryid,
                                      };
                                      this._retailservice
                                        .closingrequestresponse(param)
                                        .subscribe((requestresponse) => {
                                          if (
                                            requestresponse['status'] ==
                                            'True-0'
                                          ) {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Lead Closed Successfully',
                                              icon: 'success',
                                              allowOutsideClick: false,
                                              heightAuto: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              this.modalController.dismiss();
                                              //             const currentParams = this.activeroute.snapshot.queryParams;
                                              //  this.router.navigate([], {
                                              //   relativeTo: this.activeroute,
                                              //   queryParams: {
                                              //     ...currentParams,
                                              //     stageForm: 'onleadStatus'
                                              //   },
                                              //   queryParamsHandling: 'merge'  // merges with existing params
                                              // });
                                              location.reload();
                                            });
                                          } else {
                                            this.showSpinner = true;
                                            Swal.fire({
                                              title: 'Some Error Occured',
                                              icon: 'error',
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                              heightAuto: false,
                                            }).then((result) => {
                                              if (result.value) {
                                                window.location.reload();
                                              }
                                            });
                                          }
                                        });
                                    }
                                  } else if (
                                    success['status'] == 'Duplicate Request'
                                  ) {
                                    this.showSpinner = true;
                                    Swal.fire({
                                      title:
                                        'Already got the request for this same Unit number',
                                      icon: 'error',
                                      heightAuto: false,
                                      confirmButtonText: 'OK!',
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
                  } else if (res['status'] === 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            var visiteddate = $('#negovisiteddate').val();
            var visitedtime = $('#negovisitedtime').val();

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
                assignid: this.closedexecutiveId,
                categoryid: this.categoryid,
              };
              this._retailservice
                .retailpropertyvisitupdate(visitparam)
                .subscribe(
                  (success) => {
                    // this.status = success.status;
                    if (success['status'] == 'True') {
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
            }

            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }

            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var visiteddate = $('#negovisiteddate').val();
                  var visitedtime = $('#negovisitedtime').val();
                  // var negofinalremarks = $('#negofinalremarks').val();
                  var negofinalremarks = 'Final Negotiation Done';
                  this.autoremarks =
                    ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                  var leadnegoparam = {
                    leadid: this.leadId,
                    closedate: visiteddate,
                    closetime: visitedtime,
                    leadstage: 'Final Negotiation',
                    stagestatus: '3',
                    textarearemarks: negofinalremarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    autoremarks: this.autoremarks,
                    property: propid,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadnegoparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          var closedate = $('#closeddate').val();
                          var closetime = $('#closedtime').val();
                          var textarearemarks = $('#remarks').val();
                          var dateformatchange = new Date(
                            closedate
                          ).toDateString();

                          this.autoremarks =
                            ' Send the Deal Closing Request for ' +
                            propname +
                            ' On ' +
                            dateformatchange +
                            ' ' +
                            closetime;
                          var leadhistparam = {
                            leadid: this.leadId,
                            closedate: closedate,
                            closetime: closetime,
                            leadstage: closeLeadStage,
                            stagestatus: '0',
                            textarearemarks: textarearemarks,
                            userid: this.userid,
                            assignid: this.closedexecutiveId,
                            property: propid,
                            bhk: this.unitselection,
                            bhkunit: unitnumbers,
                            dimension: dimensions,
                            ratepersft: rpsft,
                            autoremarks: this.autoremarks,
                            categoryid: this.categoryid,
                          };
                          this._retailservice
                            .addleadhistoryretail(leadhistparam)
                            .subscribe(
                              (success) => {
                                if (success['status'] == 'True') {
                                  Swal.fire({
                                    title:
                                      'Deal Closing Requested Successfully',
                                    icon: 'success',
                                    heightAuto: false,
                                    allowOutsideClick: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      this.cdr.detectChanges();
                                      //         const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                  if (this.userid == '1') {
                                    var param = {
                                      leadid: this.leadId,
                                      propid: propid,
                                      execid: this.userid,
                                      assignid: this.closedexecutiveId,
                                      statusid: '1',
                                      remarks: 'No Comments',
                                      categoryid: this.categoryid,
                                    };
                                    this._retailservice
                                      .closingrequestresponse(param)
                                      .subscribe((requestresponse) => {
                                        if (
                                          requestresponse['status'] == 'True-0'
                                        ) {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Lead Closed Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            this.modalController.dismiss();
                                            //             const currentParams = this.activeroute.snapshot.queryParams;
                                            //  this.router.navigate([], {
                                            //   relativeTo: this.activeroute,
                                            //   queryParams: {
                                            //     ...currentParams,
                                            //     stageForm: 'onleadStatus'
                                            //   },
                                            //   queryParamsHandling: 'merge'  // merges with existing params
                                            // });
                                            location.reload();
                                          });
                                        } else {
                                          this.showSpinner = true;
                                          Swal.fire({
                                            title: 'Some Error Occured',
                                            icon: 'error',
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              window.location.reload();
                                            }
                                          });
                                        }
                                      });
                                  }
                                } else if (
                                  success['status'] == 'Duplicate Request'
                                ) {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title:
                                      'Already got the request for this same Unit number',
                                    icon: 'error',
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
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
                } else if (res['status'] === 'Duplicate Request') {
                  this.showSpinner = true;
                  Swal.fire({
                    title:
                      'Already found the same property and same unit Closing request',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // NEGOTIATION DONE with Lead Closing

      // Direct Lead Closing
      else {
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('.selectedunits2').val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#unitnum2').val() == '') {
          $('#unitnum2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if ($('#dimension2').val() == '') {
          $('#dimension2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if ($('#ratepersquarfeet2').val() == '') {
          $('#ratepersquarfeet2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if ($('#remarks2').val() == '') {
          $('#remarks2')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + '0').val() == '') {
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closeddate').val() == '') {
          // $('#closeddate1').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Date');
          Swal.fire({
            title: '"Closed Date" not selected',
            text: 'Please select "Closed Date"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if ($('#closedtime').val() == '') {
          Swal.fire({
            title: '"Closed Time" not selected',
            text: 'Please select "Closed Time"',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // $('#closedtime').focus().css("border-color", "red").attr('placeholder', 'Please Select closed Time');
        } else {
          $('#unitnum2').removeAttr('style');
          $('#dimension2').removeAttr('style');
          $('#ratepersquarfeet2').removeAttr('style');
          $('#remarks2').removeAttr('style');
          // var unitsselected = $(".selectedunits-" + i).val();
          var lastunit = this.unitselection.replace(/,\s*$/, '');
          var totalunitscount = lastunit.split(',').length;

          var unitnumbers = $('#unitnum2').val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension2').val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet2').val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              this.showSpinner = true;
              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadId);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedexecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this._retailservice.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'Duplicate Request') {
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );

              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks2').val();
              this.autoremarks = ' Send the Deal Closing Request successfully.';
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: unitnumbers,
                dimension: dimensions,
                ratepersft: rpsft,
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };

              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      allowOutsideClick: false,
                      heightAuto: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      if (result.value) {
                        this.modalController.dismiss();
                        //   const currentParams = this.activeroute.snapshot.queryParams;
                        //  this.router.navigate([], {
                        //   relativeTo: this.activeroute,
                        //   queryParams: {
                        //     ...currentParams,
                        //     stageForm: 'onleadStatus'
                        //   },
                        //   queryParamsHandling: 'merge'  // merges with existing params
                        // });
                        location.reload();
                      }
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                        categoryid: this.categoryid,
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = true;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              this.modalController.dismiss();
                              //      const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = true;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'OK!',
                            }).then((result) => {
                              if (result.value) {
                                window.location.reload();
                              }
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = true;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'OK!',
                    });
                  }
                },
                (err) => {
                  console.log('Failed to Update');
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet2')
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            this.showSpinner = true;
            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadId);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedexecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }
            this._retailservice.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var closedate = $('#closeddate').val();
                  var closetime = $('#closedtime').val();
                  var textarearemarks = $('#remarks2').val();
                  this.autoremarks =
                    ' Send the Deal Closing Request successfully.';

                  var leadhistparam = {
                    leadid: this.leadId,
                    closedate: closedate,
                    closetime: closetime,
                    leadstage: closeLeadStage,
                    stagestatus: '0',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.closedexecutiveId,
                    property: propid,
                    bhk: this.unitselection,
                    bhkunit: unitnumbers,
                    dimension: dimensions,
                    ratepersft: rpsft,
                    autoremarks: this.autoremarks,
                    categoryid: this.categoryid,
                  };

                  this._retailservice
                    .addleadhistoryretail(leadhistparam)
                    .subscribe(
                      (success) => {
                        // this.status = success.status;
                        if (success['status'] == 'True') {
                          Swal.fire({
                            title: 'Deal Closing Requested Successfully',
                            icon: 'success',
                            allowOutsideClick: false,
                            heightAuto: false,
                            confirmButtonText: 'OK!',
                          }).then((result) => {
                            if (result.value) {
                              this.cdr.detectChanges();
                              this.modalController.dismiss();
                              //   const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            }
                          });
                          if (this.userid == '1') {
                            var param = {
                              leadid: this.leadId,
                              propid: propid,
                              execid: this.userid,
                              assignid: this.closedexecutiveId,
                              statusid: '1',
                              remarks: 'No Comments',
                              categoryid: this.categoryid,
                            };
                            this._retailservice
                              .closingrequestresponse(param)
                              .subscribe((requestresponse) => {
                                if (requestresponse['status'] == 'True-0') {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title: 'Lead Closed Successfully',
                                    icon: 'success',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    $('.modal-backdrop')
                                      .closest('div')
                                      .remove();
                                    $('body').removeClass('modal-open');
                                    if (result.value) {
                                      this.modalController.dismiss();
                                      //      const currentParams = this.activeroute.snapshot.queryParams;
                                      //  this.router.navigate([], {
                                      //   relativeTo: this.activeroute,
                                      //   queryParams: {
                                      //     ...currentParams,
                                      //     stageForm: 'onleadStatus'
                                      //   },
                                      //   queryParamsHandling: 'merge'  // merges with existing params
                                      // });
                                      location.reload();
                                    }
                                  });
                                } else {
                                  this.showSpinner = true;
                                  Swal.fire({
                                    title: 'Some Error Occured',
                                    icon: 'error',
                                    allowOutsideClick: false,
                                    heightAuto: false,
                                    confirmButtonText: 'OK!',
                                  }).then((result) => {
                                    if (result.value) {
                                      this.cdr.detectChanges();
                                      window.location.reload();
                                    }
                                  });
                                }
                              });
                          }
                        } else if (success['status'] == 'Duplicate Request') {
                          this.showSpinner = true;
                          Swal.fire({
                            title:
                              'Already got the request for this same Unit number',
                            icon: 'error',
                            heightAuto: false,
                            confirmButtonText: 'OK!',
                          });
                        }
                      },
                      (err) => {
                        console.log('Failed to Update');
                      }
                    );
                } else if (res['status'] === 'False') {
                  this.showSpinner = true;
                  Swal.fire({
                    title: 'Some error Occured in Image upload',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
    }
  }

  browseFiles(i) {
    const fileInput = document.getElementById(
      'customFile' + i
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.closedTime) {
      const [time, modifier] = this.closedTime.split(' ');
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
      this.closedTime = '';
      $('#closedtime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  teleclosingrequest2() {
    // USV DONE with Lead Closing
    let propid = this.selectedLeadProperty.propid;
    let propname = this.selectedLeadProperty.name;
    let closeLeadStage: any;
    if (this.userid == '1') {
      closeLeadStage = 'Admin Lead Closed';
    } else {
      closeLeadStage = 'Deal Closing Request';
    }
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if ($('#sectionselector').val() == 'USV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        console.log(allValuesExist);
      }

      console.log('$("#remarks2").val()' + $('#remarks2').val());
      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks2').val() == '') {
        $('#closedtime').removeClass('border_colorRed');
        $('#remarks2')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks2').removeClass('border_colorRed');
        var visiteddate = $('#USVvisiteddate').val();
        var visitedtime = $('#USVvisitedtime').val();
        this.showSpinner = true;

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
            assignid: this.closedexecutiveId,
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

        var visiteddate = $('#USVvisiteddate').val();
        var visitedtime = $('#USVvisitedtime').val();
        // var usvfinalremarks = $('#usvfinalremarks').val();
        var usvfinalremarks = 'USV Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the USV';
        var leadusvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'USV',
          stagestatus: '3',
          textarearemarks: usvfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };

        this._retailservice.addleadhistoryretail(leadusvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks2').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Request Send Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //    const currentParams = this.activeroute.snapshot.queryParams;
                      //  this.router.navigate([], {
                      //   relativeTo: this.activeroute,
                      //   queryParams: {
                      //     ...currentParams,
                      //     stageForm: 'onleadStatus'
                      //   },
                      //   queryParamsHandling: 'merge'  // merges with existing params
                      // });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              timer: 2000,
                              heightAuto: false,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //             const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    } else if ($('#sectionselector').val() == 'SV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        console.log(allValuesExist);
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if (
        $('#remarks2').val() == '' ||
        $('#remarks2').val() == undefined ||
        $('#remarks2').val() == null
      ) {
        $('#closedtime').removeClass('border_colorRed');
        $('#remarks2')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks2').removeClass('border_colorRed');
        this.showSpinner = true;

        var visiteddate = $('#SVvisiteddate').val();
        var visitedtime = $('#SVvisitedtime').val();

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
            assignid: this.closedexecutiveId,
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

        var visiteddate = $('#SVvisiteddate').val();
        var visitedtime = $('#SVvisitedtime').val();
        // var svfinalremarks = $('#svfinalremarks').val();
        var svfinalremarks = 'SV Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the SV';
        var leadsvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'SV',
          stagestatus: '3',
          textarearemarks: svfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadsvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks2').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //   const currentParams = this.activeroute.snapshot.queryParams;
                      //  this.router.navigate([], {
                      //   relativeTo: this.activeroute,
                      //   queryParams: {
                      //     ...currentParams,
                      //     stageForm: 'onleadStatus'
                      //   },
                      //   queryParamsHandling: 'merge'  // merges with existing params
                      // });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              timer: 2000,
                              heightAuto: false,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //               const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //           const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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

    // SV DONE with Lead Closing
    // RSV DONE with Lead Closing
    else if ($('#sectionselector').val() == 'RSV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
        console.log(allValuesExist);
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if (
        $('#remarks2').val() == '' ||
        $('#remarks2').val() == undefined ||
        $('#remarks2').val() == null
      ) {
        $('#closedtime').removeClass('border_colorRed');
        $('#remarks2')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks2').removeClass('border_colorRed');
        this.showSpinner = true;
        var visiteddate = $('#RSVvisiteddate').val();
        var visitedtime = $('#RSVvisitedtime').val();

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
            assignid: this.closedexecutiveId,
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
        var visiteddate = $('#RSVvisiteddate').val();
        var visitedtime = $('#RSVvisitedtime').val();
        var rsvfinalremarks = $('#propertyremarks').val();
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the RSV';
        var leadrsvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'RSV',
          stagestatus: '3',
          textarearemarks: rsvfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadrsvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks2').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      timer: 2000,
                      heightAuto: false,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //     const currentParams = this.activeroute.snapshot.queryParams;
                      //  this.router.navigate([], {
                      //   relativeTo: this.activeroute,
                      //   queryParams: {
                      //     ...currentParams,
                      //     stageForm: 'onleadStatus'
                      //   },
                      //   queryParamsHandling: 'merge'  // merges with existing params
                      // });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //           const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    // RSV DONE with Lead Closing
    else if ($('#sectionselector').val() == 'Final Negotiation') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if (
        $('#remarks2').val() == '' ||
        $('#remarks2').val() == undefined ||
        $('#remarks2').val() == null
      ) {
        $('#closedtime').removeClass('border_colorRed');
        $('#remarks2')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        this.showSpinner = true;
        var visiteddate = $('#negovisiteddate').val();
        var visitedtime = $('#negovisitedtime').val();

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
            assignid: this.closedexecutiveId,
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

        var visiteddate = $('#negovisiteddate').val();
        var visitedtime = $('#negovisitedtime').val();
        // var negofinalremarks = $('#negofinalremarks').val();
        var negofinalremarks = 'Final Negotiation Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
        var leadnegoparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'Final Negotiation',
          stagestatus: '3',
          textarearemarks: negofinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadnegoparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //   const currentParams = this.activeroute.snapshot.queryParams;
                      //  this.router.navigate([], {
                      //   relativeTo: this.activeroute,
                      //   queryParams: {
                      //     ...currentParams,
                      //     stageForm: 'onleadStatus'
                      //   },
                      //   queryParamsHandling: 'merge'  // merges with existing params
                      // });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //            const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    // NEGOTIATION DONE with Lead Closing
    // Direct Lead Closing
    else {
      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if (
        $('#remarks2').val() == '' ||
        $('#remarks2').val() == undefined ||
        $('#remarks2').val() == null
      ) {
        $('#closedtime').removeClass('border_colorRed');
        $('#remarks2')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks2').removeClass('border_colorRed');
        this.showSpinner = true;
        var closedate = $('#closeddate').val();
        var closetime = $('#closedtime').val();
        var textarearemarks = $('#remarks2').val();
        this.autoremarks = ' Send the Deal Closing Request successfully.';
        var leadhistparam0 = {
          leadid: this.leadId,
          closedate: closedate,
          closetime: closetime,
          leadstage: closeLeadStage,
          stagestatus: '0',
          textarearemarks: textarearemarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          property: propid,
          bhk: this.unitselection,
          bhkunit: '',
          dimension: '',
          ratepersft: '',
          autoremarks: this.autoremarks,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadhistparam0).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              Swal.fire({
                title: 'Deal Closing Requested Successfully',
                icon: 'success',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                this.modalController.dismiss();
                const currentParams = this.activeroute.snapshot.queryParams;
                //  this.router.navigate([], {
                //   relativeTo: this.activeroute,
                //   queryParams: {
                //     ...currentParams,
                //     stageForm: 'onleadStatus'
                //   },
                //   queryParamsHandling: 'merge'  // merges with existing params
                // });
                location.reload();
              });
              if (this.userid == '1') {
                var param = {
                  leadid: this.leadId,
                  propid: propid,
                  execid: this.userid,
                  assignid: this.closedexecutiveId,
                  statusid: '1',
                  remarks: 'No Comments',
                };
                this._retailservice
                  .closingrequestresponse(param)
                  .subscribe((requestresponse) => {
                    if (requestresponse['status'] == 'True-0') {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Lead Closed Successfully',
                        icon: 'success',
                        heightAuto: false,
                        timer: 2000,
                        showConfirmButton: false,
                      }).then(() => {
                        this.modalController.dismiss();
                        //        const currentParams = this.activeroute.snapshot.queryParams;
                        //  this.router.navigate([], {
                        //   relativeTo: this.activeroute,
                        //   queryParams: {
                        //     ...currentParams,
                        //     stageForm: 'onleadStatus'
                        //   },
                        //   queryParamsHandling: 'merge'  // merges with existing params
                        // });
                        location.reload();
                      });
                    } else {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Some Error Occured',
                        icon: 'error',
                        heightAuto: false,
                        timer: 2000,
                        showConfirmButton: false,
                      }).then(() => {
                        // let currentUrl = this.router.url;
                        // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        //   this.router.navigate([currentUrl]);
                        // });
                        location.reload();
                      });
                    }
                  });
              }
            } else if (success['status'] == 'Duplicate Request') {
              this.showSpinner = false;
              Swal.fire({
                title: 'Already got the request for this same Unit number',
                icon: 'error',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
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

  teleclosingrequest() {
    // USV DONE with Lead Closing
    let propid = this.selectedLeadProperty.propid;
    let propname = this.selectedLeadProperty.name;

    let closeLeadStage: any;
    if (this.userid == '1') {
      closeLeadStage = 'Admin Lead Closed';
    } else {
      closeLeadStage = 'Deal Closing Request';
    }
    const firstArray = JSON.parse(localStorage.getItem('propertyloops'));
    const secondArray = JSON.parse(localStorage.getItem('visitedprop'));

    if ($('#sectionselector').val() == 'USV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks').val() == '') {
        $('#remarks')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks').removeClass('border_colorRed');
        this.showSpinner = true;

        var visiteddate = $('#USVvisiteddate').val();
        var visitedtime = $('#USVvisitedtime').val();
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
            assignid: this.closedexecutiveId,
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

        var visiteddate = $('#USVvisiteddate').val();
        var visitedtime = $('#USVvisitedtime').val();
        var usvfinalremarks = 'USV Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the USV';
        var leadusvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'USV',
          stagestatus: '3',
          textarearemarks: usvfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };

        this._retailservice.addleadhistoryretail(leadusvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Request Send Successfully',
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //  const currentParams = this.activeroute.snapshot.queryParams;
                      //      this.router.navigate([], {
                      //       relativeTo: this.activeroute,
                      //       queryParams: {
                      //         ...currentParams,
                      //         stageForm: 'onleadStatus'
                      //       },
                      //       queryParamsHandling: 'merge'  // merges with existing params
                      //     });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //     const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    // USV DONE with Lead Closing
    // SV DONE with Lead Closing
    else if ($('#sectionselector').val() == 'SV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks').val() == '') {
        $('#remarks')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks').removeClass('border_colorRed');
        this.showSpinner = true;

        var visiteddate = $('#SVvisiteddate').val();
        var visitedtime = $('#SVvisitedtime').val();
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
            assignid: this.closedexecutiveId,
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

        var visiteddate = $('#SVvisiteddate').val();
        var visitedtime = $('#SVvisitedtime').val();
        var svfinalremarks = 'SV Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the SV';
        var leadsvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'SV',
          stagestatus: '3',
          textarearemarks: svfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadsvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //  const currentParams = this.activeroute.snapshot.queryParams;
                      //      this.router.navigate([], {
                      //       relativeTo: this.activeroute,
                      //       queryParams: {
                      //         ...currentParams,
                      //         stageForm: 'onleadStatus'
                      //       },
                      //       queryParamsHandling: 'merge'  // merges with existing params
                      //     });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //  const currentParams = this.activeroute.snapshot.queryParams;
                              //      this.router.navigate([], {
                              //       relativeTo: this.activeroute,
                              //       queryParams: {
                              //         ...currentParams,
                              //         stageForm: 'onleadStatus'
                              //       },
                              //       queryParamsHandling: 'merge'  // merges with existing params
                              //     });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    // SV DONE with Lead Closing
    // RSV DONE with Lead Closing
    else if ($('#sectionselector').val() == 'RSV') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks').val() == '') {
        $('#remarks')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks').removeClass('border_colorRed');

        this.showSpinner = true;
        var visiteddate = $('#RSVvisiteddate').val();
        var visitedtime = $('#RSVvisitedtime').val();

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
            assignid: this.closedexecutiveId,
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
        var visiteddate = $('#RSVvisiteddate').val();
        var visitedtime = $('#RSVvisitedtime').val();
        var rsvfinalremarks = 'RSV Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the RSV';
        var leadrsvparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'RSV',
          stagestatus: '3',
          textarearemarks: rsvfinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };

        this._retailservice.addleadhistoryretail(leadrsvparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //  const currentParams = this.activeroute.snapshot.queryParams;
                      //      this.router.navigate([], {
                      //       relativeTo: this.activeroute,
                      //       queryParams: {
                      //         ...currentParams,
                      //         stageForm: 'onleadStatus'
                      //       },
                      //       queryParamsHandling: 'merge'  // merges with existing params
                      //     });
                      location.reload();
                    });
                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //      const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      timer: 2000,
                      heightAuto: false,
                      showConfirmButton: false,
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
    // RSV DONE with Lead Closing
    // NEGOTIATION DONE with Lead Closing
    else if ($('#sectionselector').val() == 'Final Negotiation') {
      var allValuesExist;
      if (firstArray.length == 0) {
        allValuesExist = secondArray;
      } else {
        allValuesExist = secondArray.filter((obj) =>
          firstArray.includes(obj.propid)
        );
      }

      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks').val() == '') {
        $('#remarks')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks').removeClass('border_colorRed');
        this.showSpinner = true;
        var visiteddate = $('#negovisiteddate').val();
        var visitedtime = $('#negovisitedtime').val();

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
            assignid: this.closedexecutiveId,
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
        const formData = new FormData();
        formData.append('PropID', propid);
        formData.append('LeadID', this.leadId);
        formData.append('ExecID', this.userid);
        formData.append('assignID', this.closedexecutiveId);
        for (var k = 0; k < this.closurefiles.length; k++) {
          formData.append('file[]', this.closurefiles[k]);
        }
        var visiteddate = $('#negovisiteddate').val();
        var visitedtime = $('#negovisitedtime').val();
        // var negofinalremarks = $('#negofinalremarks').val();
        var negofinalremarks = 'Final Negotiation Done';
        this.autoremarks =
          ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
        var leadnegoparam = {
          leadid: this.leadId,
          closedate: visiteddate,
          closetime: visitedtime,
          leadstage: 'Final Negotiation',
          stagestatus: '3',
          textarearemarks: negofinalremarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          autoremarks: this.autoremarks,
          property: propid,
          categoryid: this.categoryid,
        };

        this._retailservice.addleadhistoryretail(leadnegoparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var closedate = $('#closeddate').val();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks').val();
              var dateformatchange = new Date(closedate).toDateString();

              this.autoremarks =
                ' Send the Deal Closing Request for ' +
                propname +
                ' On ' +
                dateformatchange +
                ' ' +
                closetime;
              var leadhistparam = {
                leadid: this.leadId,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedexecutiveId,
                property: propid,
                bhk: this.unitselection,
                bhkunit: '',
                dimension: '',
                ratepersft: '',
                autoremarks: this.autoremarks,
                categoryid: this.categoryid,
              };
              this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
                (success) => {
                  if (success['status'] == 'True') {
                    Swal.fire({
                      title: 'Deal Closing Requested Successfully',
                      icon: 'success',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
                    }).then(() => {
                      this.modalController.dismiss();
                      //  const currentParams = this.activeroute.snapshot.queryParams;
                      //    this.router.navigate([], {
                      //     relativeTo: this.activeroute,
                      //     queryParams: {
                      //       ...currentParams,
                      //       stageForm: 'onleadStatus'
                      //     },
                      //     queryParamsHandling: 'merge'  // merges with existing params
                      //   });
                      location.reload();
                    });

                    if (this.userid == '1') {
                      var param = {
                        leadid: this.leadId,
                        propid: propid,
                        execid: this.userid,
                        assignid: this.closedexecutiveId,
                        statusid: '1',
                        remarks: 'No Comments',
                      };
                      this._retailservice
                        .closingrequestresponse(param)
                        .subscribe((requestresponse) => {
                          if (requestresponse['status'] == 'True-0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Lead Closed Successfully',
                              icon: 'success',
                              heightAuto: false,
                              timer: 2000,
                              showConfirmButton: false,
                            }).then(() => {
                              this.modalController.dismiss();
                              //      const currentParams = this.activeroute.snapshot.queryParams;
                              //  this.router.navigate([], {
                              //   relativeTo: this.activeroute,
                              //   queryParams: {
                              //     ...currentParams,
                              //     stageForm: 'onleadStatus'
                              //   },
                              //   queryParamsHandling: 'merge'  // merges with existing params
                              // });
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Some Error Occured',
                              icon: 'error',
                              timer: 2000,
                              heightAuto: false,
                              showConfirmButton: false,
                            }).then(() => {
                              // let currentUrl = this.router.url;
                              // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                              //   this.router.navigate([currentUrl]);
                              // });
                              location.reload();
                            });
                          }
                        });
                    }
                  } else if (success['status'] == 'Duplicate Request') {
                    this.showSpinner = false;
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      timer: 2000,
                      showConfirmButton: false,
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
    // NEGOTIATION DONE with Lead Closing
    // Direct Lead Closing
    else {
      if ($('#closeddate').val() == '') {
        $('#closeddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Date');
      } else if ($('#closedtime').val() == '') {
        $('#closeddate').removeClass('border_colorRed');
        $('#closedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select closed Time');
      } else if ($('#remarks').val() == '') {
        $('#remarks')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please type some comments/remarks');
      } else {
        $('#remarks').removeClass('border_colorRed');

        const formData = new FormData();
        formData.append('PropID', propid);
        formData.append('LeadID', this.leadId);
        formData.append('ExecID', this.userid);
        formData.append('assignID', this.closedexecutiveId);
        for (var k = 0; k < this.closurefiles.length; k++) {
          formData.append('file[]', this.closurefiles[k]);
        }
        this.showSpinner = true;
        var closedate = $('#closeddate').val();
        var closetime = $('#closedtime').val();
        var textarearemarks = $('#remarks').val();
        this.autoremarks = ' Send the Deal Closing Request successfully.';
        var leadhistparam = {
          leadid: this.leadId,
          closedate: closedate,
          closetime: closetime,
          leadstage: closeLeadStage,
          stagestatus: '0',
          textarearemarks: textarearemarks,
          userid: this.userid,
          assignid: this.closedexecutiveId,
          property: propid,
          bhk: this.unitselection,
          bhkunit: '',
          dimension: '',
          ratepersft: '',
          autoremarks: this.autoremarks,
          categoryid: this.categoryid,
        };
        this._retailservice.addleadhistoryretail(leadhistparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              Swal.fire({
                title: 'Deal Closing Requested Successfully',
                icon: 'success',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                this.modalController.dismiss();
                //  const currentParams = this.activeroute.snapshot.queryParams;
                //        this.router.navigate([], {
                //         relativeTo: this.activeroute,
                //         queryParams: {
                //           ...currentParams,
                //           stageForm: 'onleadStatus'
                //         },
                //         queryParamsHandling: 'merge'  // merges with existing params
                //       });
                location.reload();
              });

              if (this.userid == '1') {
                var param = {
                  leadid: this.leadId,
                  propid: propid,
                  execid: this.userid,
                  assignid: this.closedexecutiveId,
                  statusid: '1',
                  remarks: 'No Comments',
                };
                this._retailservice
                  .closingrequestresponse(param)
                  .subscribe((requestresponse) => {
                    if (requestresponse['status'] == 'True-0') {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Lead Closed Successfully',
                        icon: 'success',
                        heightAuto: false,
                        timer: 2000,
                        showConfirmButton: false,
                      }).then(() => {
                        this.modalController.dismiss();
                        //   const currentParams = this.activeroute.snapshot.queryParams;
                        //  this.router.navigate([], {
                        //   relativeTo: this.activeroute,
                        //   queryParams: {
                        //     ...currentParams,
                        //     stageForm: 'onleadStatus'
                        //   },
                        //   queryParamsHandling: 'merge'  // merges with existing params
                        // });
                        location.reload();
                      });
                    } else {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Some Error Occured',
                        icon: 'error',
                        heightAuto: false,
                        timer: 2000,
                        showConfirmButton: false,
                      }).then(() => {
                        // let currentUrl = this.router.url;
                        // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        //   this.router.navigate([currentUrl]);
                        // });
                        location.reload();
                      });
                    }
                  });
              }
            } else if (success['status'] == 'Duplicate Request') {
              this.showSpinner = false;
              Swal.fire({
                title: 'Already got the request for this same Unit number',
                icon: 'error',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
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
  ngOnChanges(changes: SimpleChanges) {
    if (changes['refreshTrigger']) {
      this.loadimportantapi();
    }
  }
}
