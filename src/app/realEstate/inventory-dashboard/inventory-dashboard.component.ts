import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import {
  AlertController,
  AnimationController,
  IonContent,
  IonPopover,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { MandateService } from '../mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { toLower } from 'ionicons/dist/types/components/icon/utils';
import { forkJoin } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss'],
})
export class InventoryDashboardComponent implements OnInit {
  @ViewChild('content', { static: false }) content!: IonContent;
  @ViewChild('editUnitDetailsModal') editUnitDetailsModal;
  @ViewChild('popover') popover: IonPopover;
  editToSelectedUnit;
  showSpinner = false;
  filteredParams = {
    propid: '',
    towerid: '',
    size: '',
    bhk: '',
    status: '',
    viewtype: '',
  };
  properties;
  selectedProp;
  selectedTower;

  inventoryDashboardCounts;
  towerData: any;
  bhkData: any;
  selectedbhk: any;
  sizeData: any;
  selectedSize: any;
  statusData: any;
  selectedstatus: any;
  inventoryData: any;
  statusListingData: any;
  bhkListingData: any;
  unitListingData: any;
  doreFacingData: any;
  selectedExec: any;
  leadsBasedexecData: any;
  bookingForm!: FormGroup;
  saleAgreementForm!: FormGroup;
  paymentForm!: FormGroup;
  soldForm!: FormGroup;
  unitEditForm!: FormGroup;
  bankNames;
  selectedFloors = [];
  registrationForm;
  isEditUnitStatus = false;
  selectedLeadsBasedexec;
  executiveList;
  backstage = 0;
  inventoryData1: any;
  unitDetails = '';
  constructor(
    private sharedService: SharedService,
    private menuCtrl: MenuController,
    private mandateService: MandateService,
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private messageService: MessageService,
    private toastController: ToastController,
    private animationCtrl: AnimationController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.formsInitialization();
    this.activeRoute.queryParams.subscribe(() => {
      this.showSpinner = true;
      this.getQueryParams();
      this.getExecutivedata();
      this.getmandateprojects();
      this.getAllCountsOfInventory();

      setTimeout(() => {
        this.getTowerDetails();
        this.getBHKDetails();
        this.getSizeDetails();
        this.getStatusDetails();
      }, 1000);

      this.getDoreFacingDetails();
      this.getBHKListing();
      // this.getStatusListing();
      this.getUnitListing();
    });
  }

  formsInitialization() {
    this.bookingForm = this.fb.group({
      bhk: ['', Validators.required],
      unitNumber: ['', Validators.required],
      exename: ['', Validators.required],
      leadname: ['', Validators.required],
      dimension: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[0-9])[0-9 ]+$/)],
      ],
      rateSquareFeet: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[0-9])[0-9 ]+$/)],
      ],
      remark: [''],
      documents: [null, Validators.required],
    });

    this.saleAgreementForm = this.fb.group({
      status: ['', Validators.required],
      documents: [''],
      remark: [''],
    });

    this.saleAgreementForm.get('status')?.valueChanges.subscribe((value) => {
      const documentsControl = this.saleAgreementForm.get('documents');

      if (value == '1') {
        documentsControl?.clearValidators(); // NOT required
      } else {
        documentsControl?.setValidators([Validators.required]); // required
      }

      documentsControl?.updateValueAndValidity();
    });
    this.paymentForm = this.fb.group({
      paymentMode: ['1'],
      // toggle control
      addBank: [false],
      // Self payment
      transactionMode: [''],
      transactionId: [''],
      amountReceived: [''],
      receivedDate: [''],
      remark: [''],

      // Loan
      bankName: [''],
      loanStatus: [''],
      ifscCode: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
    });

    this.paymentForm.get('paymentMode')?.valueChanges.subscribe((value) => {
      this.applyValidation();
    });

    this.registrationForm = this.fb.group({
      date: ['', Validators.required],
      status: ['', Validators.required],
      documents: [''],
      remark: [''],
    });
    this.registrationForm.get('status')?.valueChanges.subscribe((value) => {
      const documentsControl = this.registrationForm.get('documents');

      if (value == '1') {
        documentsControl?.clearValidators(); // NOT required
      } else {
        documentsControl?.setValidators([Validators.required]); // required
      }
      documentsControl?.updateValueAndValidity();
    });

    this.soldForm = this.fb.group({
      remark: [''],
    });

    this.unitEditForm = this.fb.group({
      unitName: [null, Validators.required],
      bhk: [null],
      unitSize: ['', [, Validators.pattern(/^[0-9 ]+$/)]],
      builtupArea: ['', [, Validators.pattern(/^[0-9 ]+$/)]],
      carpetarea: ['', [Validators.pattern(/^[0-9 ]+$/)]],
      unitSBA: ['', [, Validators.pattern(/^[0-9 ]+$/)]],
      unitUDS: ['', [, Validators.pattern(/^[0-9 ]+$/)]],
      doreFacing: [null],
      status: [null],
      balcony: [false],
      garden: [false],
    });
  }
  applyValidation() {
    const form = this.paymentForm;
    const paymentMode = form.value.paymentMode;
    const addBank = form.value.addBank;
    const loanStatus = form.value.loanStatus;
    const transactionMode = form.value.transactionMode;

    if (paymentMode == '2') {
      form.get('transactionMode')?.setValidators([Validators.required]);
      form.get('bankName')?.clearValidators();
      form.get('ifscCode')?.clearValidators();
      form.get('loanStatus')?.clearValidators();
    } else {
      form.get('loanStatus')?.setValidators([Validators.required]);
      form.get('bankName')?.clearValidators();
      if (loanStatus == '2') {
        form.get('bankName')?.setValidators([Validators.required]);
        if (addBank) {
          form
            .get('ifscCode')
            ?.setValidators([
              Validators.required,
              Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
            ]);
          form.get('bankName')?.setValidators([Validators.required]);
        } else {
          form.get('ifscCode')?.clearValidators();
        }
      }
    }
    // Clear
    form.get('transactionId')?.clearValidators();
    form.get('amountReceived')?.clearValidators();
    form.get('receivedDate')?.clearValidators();

    if (
      (paymentMode == '1' && loanStatus == '2') ||
      (paymentMode == '2' && transactionMode != '1' && transactionMode != '')
    ) {
      form.get('transactionId')?.setValidators([Validators.required]);
      form.get('amountReceived')?.setValidators([Validators.required]);
      form.get('receivedDate')?.setValidators([Validators.required]);
    }

    Object.keys(form.controls).forEach((key) => {
      form.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  getTowerDetails() {
    this.sharedService
      .getTowerDetails(this.filteredParams.propid)
      .subscribe((resp) => {
        this.towerData = resp['data'];
        this.selectedTower = resp['data']?.filter(
          (item) => item?.tower_IDPK == this.filteredParams.towerid
        );
        this.selectedTower = this.selectedTower[0];
      });
  }

  getBHKDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      status: this.filteredParams.status,
    };
    this.sharedService.getBHKDetails(params).subscribe((resp) => {
      this.bhkData = resp['data'];
      this.selectedbhk = resp['data']?.filter(
        (item) => item?.bhk_IDFK == this.filteredParams.bhk
      );
      this.selectedbhk = this.selectedbhk[0];
    });
  }

  getSizeDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      bhk: this.filteredParams.bhk,
      status: this.filteredParams.status,
    };
    this.sharedService.getSizeDetails(params).subscribe((resp) => {
      this.sizeData = resp['data'];
      this.selectedSize = resp['data']?.filter(
        (item) => item?.unit_size == this.filteredParams.size
      );
      this.selectedSize = this.selectedSize[0];
    });
  }

  getStatusDetails() {
    const params = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      bhk: this.filteredParams.bhk,
    };
    this.sharedService.getStatusDetails(params).subscribe((resp) => {
      this.statusData = resp['data'];
      this.selectedstatus = resp['data'].filter(
        (item) => item.unitstatus_IDFK == this.filteredParams.status
      );
      this.selectedstatus = this.selectedstatus[0];
    });
  }

  getDoreFacingDetails() {
    this.sharedService.getDoreFacingDetails().subscribe((resp) => {
      this.doreFacingData = resp['data'];
    });
  }

  getBHKListing() {
    this.sharedService.getBHKListing().subscribe((resp) => {
      this.bhkListingData = resp;
    });
  }

  getStatusListing() {
    this.sharedService.getStatusListing().subscribe((resp) => {
      this.statusListingData = resp['data'];
    });
  }

  getUnitListing() {
    const param = {
      propid: this.filteredParams.propid,
      towerid: this.filteredParams.towerid,
      size: this.filteredParams.size,
      status: this.filteredParams.status,
      bhk: this.filteredParams.bhk,
    };
    this.sharedService.getUnitListing(param).subscribe((resp) => {
      this.unitListingData = resp['data'];
    });
  }

  getmandateprojects() {
    this.mandateService.getmandateprojects().subscribe((resp) => {
      this.properties = resp['Properties'];
      this.selectedProp = resp['Properties'].filter(
        (item) => item.property_idfk == this.filteredParams.propid
      );
      this.selectedProp = this.selectedProp[0];
    });
  }

  getExecutivedata() {
    this.mandateService
      .fetchmandateexecutives(this.filteredParams.propid, '')
      .subscribe((resp) => {
        this.executiveList = resp['mandateexecutives'];
      });
  }

  getAllCountsOfInventory() {
    this.sharedService
      .getPropInventoryCount(this.filteredParams.propid)
      .subscribe((resp) => {
        this.inventoryDashboardCounts = resp['counts'];
        this.getInventoryDetails();
      });
  }

  getInventoryDetails() {
    const baseParams = {
      propid: this.filteredParams.propid,
      viewtype: this.filteredParams.viewtype,
      size: this.filteredParams.size,
      bhk: this.filteredParams.bhk,
      status: this.filteredParams.status,
    };

    this.sharedService.getInventoryDetails(baseParams).subscribe((resp) => {
      this.inventoryData = resp['data'];
      this.inventoryData1 = this.inventoryData;
      if (
        this.filteredParams.towerid == '' &&
        this.filteredParams.viewtype == '2'
      ) {
        this.filteredParams.towerid = this.inventoryData?.[0].towerid;
      }
      // this.selectedFloors = this.inventoryData?.[0]?.floors;
      this.showSpinner = false;
      this.prepareData(resp['data']);
    });

    // forkJoin({
    //   withoutTower: this.sharedService.getInventoryDetails(baseParams),
    //   withTower: this.sharedService.getInventoryDetails({
    //     ...baseParams,
    //     towerid: this.filteredParams.towerid,
    //   }),
    // }).subscribe(({ withoutTower, withTower }) => {
    //   this.fullInventoryData = withoutTower['data'];
    //   this.inventoryData = withTower['data'];

    //   if (
    //     this.filteredParams.towerid == '' &&
    //     this.filteredParams.viewtype == '2'
    //   ) {
    //     this.filteredParams.towerid = this.inventoryData?.[0].towerid;
    //   }
    //   this.selectedFloors = this.inventoryData?.[0]?.floors;
    //   this.showSpinner = false;
    // });
  }

  addQueryParams() {
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router
      .navigate([], { queryParams, queryParamsHandling: 'merge' })
      .then(() => {});
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  toggleTableBlockView(istable) {
    this.filteredParams.bhk = '';
    this.filteredParams.size = '';
    this.filteredParams.status = '';
    this.filteredParams.towerid = '';
    this.filteredParams.viewtype = istable;
    this.addQueryParams();
  }

  ondropdownFilter(data, event) {
    if (data == 'tower') {
      this.filteredParams.bhk = '';
      this.filteredParams.size = '';
      this.filteredParams.status = '';
      this.filteredParams.towerid = event.value.tower_IDPK;
    } else if (data == 'bhk') {
      this.filteredParams.bhk = event.value.bhk_IDFK;
    } else if (data == 'size') {
      this.filteredParams.size = event.value.unit_size;
    } else if (data == 'status') {
      this.filteredParams.status = event.value.unitstatus_IDFK;
    } else if (data == 'property') {
      this.filteredParams.bhk = '';
      this.filteredParams.size = '';
      this.filteredParams.status = '';
      this.filteredParams.towerid = '';
      this.filteredParams.propid = event.value.property_idfk;
    }
    this.addQueryParams();
  }

  onBlock(data) {
    this.filteredParams.towerid = data.towerid;
    // this.selectedFloors = data['floors'];
    this.addQueryParams();
  }

  onEditInventoryUintDetails(data) {
    const unitid = data.unit_IDPK || data;
    this.sharedService.getSingleUnit(unitid).subscribe((res) => {
      console.log(res);
      this.editToSelectedUnit = res['data'][0];
      if (this.editToSelectedUnit?.unitstatus_IDFK == '4') {
        this.sharedService.getBankNames().subscribe((resp) => {
          this.bankNames = resp['data'];
        });
      }
      if (
        this.editToSelectedUnit?.unitstatus_IDFK == '1' ||
        this.editToSelectedUnit?.unitstatus_IDFK == '2' ||
        this.editToSelectedUnit?.unitstatus_IDFK == '8'
      ) {
        this.bookingForm.patchValue({
          bhk: data.bhk,
          unitNumber: data.unit_name,
          dimension: data.unit_sba,
          exename: data.Exec_IDFK,
        });
      } else if (this.editToSelectedUnit?.unitstatus_IDFK == '4') {
        const saleDocs =
          this.editToSelectedUnit.saleagreement_files?.map((file: any) => {
            return {
              name: file.salefile_name,
              type: file.salefile_name.toLowerCase().endsWith('.pdf')
                ? 'application/pdf'
                : 'image/jpeg',
              preview: `http://192.168.0.121/noncdnsuperadmin-live/images/crm/saleagreement/${file.salefile_name}`,
            };
          }) || [];
        this.saleAgreementForm.patchValue({
          documents: [...saleDocs],
          status: this.editToSelectedUnit.saleagreement_stage || '',
          remark: this.editToSelectedUnit.remarks_4 || '',
        });
      } else if (this.editToSelectedUnit?.unitstatus_IDFK == '5') {
        this.sharedService.getBankNames().subscribe((resp) => {
          this.bankNames = resp['data'];
        });
        this.paymentForm.patchValue({
          paymentMode: this.editToSelectedUnit.payment_mode || '',
          transactionMode: this.editToSelectedUnit.transacmode_status || '',
          transactionId: this.editToSelectedUnit.transacid_chequeno || '',
          amountReceived: this.editToSelectedUnit.payreceive_amount || '',
          receivedDate: this.editToSelectedUnit.payreceive_date || '',
          remark: this.editToSelectedUnit.remarks_5 || '',
          bankName: this.editToSelectedUnit.ifsc_code
            ? this.editToSelectedUnit.bank_name
            : this.editToSelectedUnit.bankinfo_IDFK || '',
          loanStatus: this.editToSelectedUnit.loan_status || '',
          ifscCode: this.editToSelectedUnit.ifsc_code || '',
          addBank: this.editToSelectedUnit.ifsc_code != null ? true : false,
        });
      } else if (this.editToSelectedUnit?.unitstatus_IDFK == '6') {
        const regDocs =
          this.editToSelectedUnit.registration_files?.map((file: any) => {
            return {
              name: file.regfiles_name,
              type: file.regfiles_name.toLowerCase().endsWith('.pdf')
                ? 'application/pdf'
                : 'image/jpeg',
              preview: `http://192.168.0.121/noncdnsuperadmin-live/images/crm/saleagreement/${file.regfiles_name}`,
            };
          }) || [];

        this.registrationForm.patchValue({
          date: this.editToSelectedUnit.registration_date || '',
          status: this.editToSelectedUnit.registration_status || '',
          documents: [...regDocs],
          remark: this.editToSelectedUnit.remarks_6 || '',
        });
      }
      this.showSpinner = false;
    });
    this.editUnitDetailsModal.present();
  }

  onBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    const now = new Date();
    // Date → YYYY-MM-DD
    const actiondate = now.toISOString().split('T')[0];
    // Time → 12 hour format with AM/PM
    const actiontime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formData = new FormData();
    formData.append('unitstatus', '3');
    formData.append('leadid', this.bookingForm.get('leadname').value.Lead_IDFK);
    formData.append('propid', this.editToSelectedUnit.property_idfk);
    formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
    formData.append('userid', localStorage.getItem('UserId'));
    formData.append('assignid', this.bookingForm.get('exename').value);
    formData.append('remarks', this.bookingForm.get('remark').value);
    formData.append('actiondate', actiondate);
    formData.append('actiontime', actiontime);
    formData.append('dimension', this.bookingForm.get('dimension').value);
    formData.append(
      'rate_persqft',
      this.bookingForm.get('rateSquareFeet').value
    );
    formData.append(
      'prevstatus',
      this.editToSelectedUnit.unitstatus == 'Available'
        ? '1'
        : this.editToSelectedUnit.unitstatus == 'Hold'
        ? '2'
        : ''
    );

    const documentsArray = this.bookingForm.get('documents')?.value;

    if (documentsArray && documentsArray.length > 0) {
      documentsArray.forEach((doc: any) => {
        formData.append('closure_files', doc.file);
      });
    }
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.sharedService.saveUnit(formData).subscribe((res) => {
      if (res['status'] == 'true') {
        this.onEditInventoryUintDetails(this.editToSelectedUnit);
        this.showSuccess();
      }
    });
  }

  saleAgreementformSubmit() {
    if (this.saleAgreementForm.invalid) {
      this.saleAgreementForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    console.log(this.saleAgreementForm.value);

    const now = new Date();
    // Date → YYYY-MM-DD
    const actiondate = now.toISOString().split('T')[0];
    // Time → 12 hour format with AM/PM
    const actiontime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formData = new FormData();
    formData.append('unitstatus', '4');
    formData.append('leadid', this.editToSelectedUnit.Lead_IDFK);
    formData.append('propid', this.editToSelectedUnit.property_idfk);
    formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
    formData.append('assignid', this.editToSelectedUnit.Exec_IDFK);
    formData.append('userid', localStorage.getItem('UserId'));
    formData.append('remarks', this.saleAgreementForm.get('remark').value);
    formData.append('actiondate', actiondate);
    formData.append('actiontime', actiontime);
    formData.append('sale_stage', this.saleAgreementForm.get('status').value);

    const documentsArray = this.saleAgreementForm.get('documents')?.value;

    if (documentsArray && documentsArray.length > 0) {
      documentsArray.forEach((doc: any) => {
        formData.append('sale_file', doc.file);
      });
    }
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.sharedService.saveUnit(formData).subscribe((res) => {
      if (res['status'] == 'true') {
        this.onEditInventoryUintDetails(this.editToSelectedUnit);
        this.showSuccess();
      }
    });
  }
  paymentformSubmit() {
    console.log(this.paymentForm.value);
    this.applyValidation();
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    console.log(this.paymentForm.value);

    const now = new Date();
    // Date → YYYY-MM-DD
    const actiondate = now.toISOString().split('T')[0];
    // Time → 12 hour format with AM/PM
    const actiontime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formData = new FormData();
    formData.append('unitstatus', '5');
    formData.append('leadid', this.editToSelectedUnit.Lead_IDFK);
    formData.append('propid', this.editToSelectedUnit.property_idfk);
    formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
    formData.append('assignid', this.editToSelectedUnit.Exec_IDFK);
    formData.append('userid', localStorage.getItem('UserId'));
    formData.append('remarks', this.paymentForm.get('remark').value);
    formData.append('actiondate', actiondate);
    formData.append('actiontime', actiontime);
    formData.append('pay_mode', this.paymentForm.get('paymentMode').value);
    formData.append(
      'transacid_chequeno',
      this.paymentForm.get('transactionId').value
    );
    formData.append(
      'payreceive_date',
      this.paymentForm.get('receivedDate').value
    );
    formData.append(
      'payreceive_amount',
      this.paymentForm.get('amountReceived').value
    );

    if (this.paymentForm.get('paymentMode').value == 1) {
      formData.append('bankid', this.paymentForm.get('bankName').value);
      formData.append('loan_status', this.paymentForm.get('loanStatus').value);
      formData.append('ifsc_code', this.paymentForm.get('ifscCode').value);
    } else {
      formData.append(
        'transacmode_status',
        this.paymentForm.get('transactionMode').value
      );
    }

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.sharedService.saveUnit(formData).subscribe((res) => {
      if (res['status'] == 'true') {
        this.onEditInventoryUintDetails(this.editToSelectedUnit);
        this.showSuccess();
      }
    });
  }

  registrationformSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    this.showSpinner = true;
    console.log(this.registrationForm.value);

    const now = new Date();
    // Date → YYYY-MM-DD
    const actiondate = now.toISOString().split('T')[0];
    // Time → 12 hour format with AM/PM
    const actiontime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formData = new FormData();
    formData.append('unitstatus', '6');
    formData.append('leadid', this.editToSelectedUnit.Lead_IDFK);
    formData.append('propid', this.editToSelectedUnit.property_idfk);
    formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
    formData.append('assignid', this.editToSelectedUnit.Exec_IDFK);
    formData.append('userid', localStorage.getItem('UserId'));
    formData.append('remarks', this.registrationForm.get('remark').value);
    formData.append('actiondate', actiondate);
    formData.append('actiontime', actiontime);
    formData.append('regist_status', this.registrationForm.get('status').value);
    formData.append(
      'regist_date',
      new Date(this.registrationForm.get('date').value).toLocaleDateString(
        'en-CA'
      )
    );
    const documentsArray = this.registrationForm.get('documents')?.value;

    if (documentsArray && documentsArray.length > 0) {
      documentsArray.forEach((doc: any) => {
        formData.append('regist_file', doc.file);
      });
    }

    formData.forEach((value, key) => {
      console.log(key, value);
    });

    this.sharedService.saveUnit(formData).subscribe(async (res) => {
      if (res['status'] == 'true') {
        await this.showSuccess();
        this.editUnitDetailsModal.dismiss();
        setTimeout(() => {
          this.content.scrollToTop(500);
        }, 300);
      }
    });
  }

  soldformSubmit() {
    this.showSpinner = true;
    const formData = new FormData();
    formData.append('unitstatus', '9');
    formData.append('leadid', this.editToSelectedUnit.Lead_IDFK);
    formData.append('propid', this.editToSelectedUnit.property_idfk);
    formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
    formData.append('assignid', this.editToSelectedUnit.Exec_IDFK);
    formData.append('userid', localStorage.getItem('UserId'));
    formData.append('remarks', this.soldForm.get('remark').value);

    console.log(this.soldForm.value);
    this.sharedService.saveUnit(formData).subscribe(async (res) => {
      if (res['status'] == 'true') {
        await this.showSuccess();
        // this.onEditInventoryUintDetails(this.editToSelectedUnit);
        this.editUnitDetailsModal.dismiss();
      }
    });
  }
  updateUnit() {
    if (this.unitEditForm.invalid) {
      this.unitEditForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    const formValue = this.unitEditForm.value;
    // Convert if the values are in other datatype to string
    const updateValues = Object.fromEntries(
      Object.entries({
        unitno: formValue.unitName,
        bhk: formValue.bhk,
        size: formValue.unitSize,
        builtuparea: formValue.builtupArea,
        carpetarea: formValue.carpetarea,
        sba: formValue.unitSBA,
        uds: formValue.unitUDS,
        facing: formValue.doreFacing,
        status: formValue.status,
        balcony: formValue.balcony ? '1' : '0',
        garden: formValue.garden ? '1' : '0',
      }).map(([key, val]) => [key, val != null ? String(val) : ''])
    );

    const params = {
      propid: this.editToSelectedUnit.property_idfk,
      unitid: this.editToSelectedUnit.unit_IDPK,
      unitdetails: JSON.stringify(updateValues),
    };
    console.log(params);
    this.sharedService.updateUnit(params).subscribe(async (resp) => {
      await this.showSuccess();
      this.editUnitDetailsModal.dismiss();
    });
  }

  getLeadsBasedexec(event) {
    const params = {
      execid: this.bookingForm.get('exename')?.value,
      content: event.query,
    };
    this.sharedService.getLeadsBasedexec(params).subscribe({
      next: (resp) => {
        this.leadsBasedexecData = resp['leads'] || [];
        this.selectedLeadsBasedexec = this.leadsBasedexecData.filter(
          (element) => element.Lead_IDFK == this.editToSelectedUnit.Lead_IDFK
        );
        this.selectedLeadsBasedexec = this.selectedLeadsBasedexec[0];
      },
      error: () => {
        this.leadsBasedexecData = [];
      },
      complete: () => {},
    });
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files: File[] = Array.from(input.files);

    const filesWithPreview = files.map((file) => ({
      name: file.name,
      file: file,
      preview: URL.createObjectURL(file),
    }));

    this.bookingForm.patchValue({
      documents: filesWithPreview,
    });
    this.bookingForm.get('documents')?.updateValueAndValidity();
  }

  onAgreementFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files: File[] = Array.from(input.files);

    const filesWithPreview = files.map((file) => ({
      name: file.name,
      file: file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));

    // Get existing files
    const existingFiles = this.saleAgreementForm.get('documents')?.value || [];

    // Merge old + new files
    const updatedFiles = [...existingFiles, ...filesWithPreview];

    this.saleAgreementForm.patchValue({
      documents: updatedFiles,
    });

    this.saleAgreementForm.get('documents')?.updateValueAndValidity();

    // Reset input so same file can be uploaded again if needed
    input.value = '';
  }

  onRegistrationFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files: File[] = Array.from(input.files);

    const filesWithPreview = files.map((file) => ({
      name: file.name,
      file: file,
      preview: URL.createObjectURL(file),
      type: file.type,
    }));

    // Get existing files
    const existingFiles = this.registrationForm.get('documents')?.value || [];

    // Merge old + new files
    const updatedFiles = [...existingFiles, ...filesWithPreview];

    this.registrationForm.patchValue({
      documents: updatedFiles,
    });

    this.registrationForm.get('documents')?.updateValueAndValidity();

    // Reset input so same file can be uploaded again if needed
    input.value = '';
  }

  removeDocument(form: FormGroup, index: number) {
    const files = [...(form.get('documents')?.value || [])];

    files.splice(index, 1);

    form.patchValue({
      documents: files.length ? files : null,
    });
  }
  removeImage(index: number) {
    const files = this.bookingForm.get('documents')?.value || [];

    files.splice(index, 1);
    if (files.length === 0) {
      this.bookingForm.patchValue({
        documents: null,
      });
    } else {
      this.bookingForm.patchValue({
        documents: files,
      });
    }
  }

  removeSaleAgeementDocument(index: number) {
    const files = this.saleAgreementForm.get('documents')?.value || [];

    files.splice(index, 1);
    if (files.length === 0) {
      this.saleAgreementForm.patchValue({
        documents: null,
      });
    } else {
      this.saleAgreementForm.patchValue({
        documents: files,
      });
    }
  }

  removeregistrationDocument(index: number) {
    const files = this.registrationForm.get('documents')?.value || [];

    files.splice(index, 1);
    if (files.length === 0) {
      this.registrationForm.patchValue({
        documents: null,
      });
    } else {
      this.registrationForm.patchValue({
        documents: files,
      });
    }
  }

  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  onDateChange(event: any) {
    const value = event.detail.value;

    // optional formatting
    const date = new Date(value);
    const formatted = date.toLocaleDateString('en-CA');

    // SET VALUE
    this.paymentForm.get('receivedDate')?.setValue(formatted);

    // close popover
    this.popover.dismiss();
  }

  onBack() {
    if (
      this.editToSelectedUnit.saleagreement_stage == '1' &&
      this.backstage == 0
    ) {
      this.backstage = 3;
    } else if (
      (this.editToSelectedUnit.loan_status == '1' ||
        this.editToSelectedUnit.transacmode_status == '1') &&
      this.backstage == 0
    ) {
      this.backstage = 4;
    } else if (
      this.editToSelectedUnit.registration_status == '1' &&
      this.backstage == 0
    ) {
      this.backstage = 5;
    }
    {
      this.backstage =
        this.backstage == 0
          ? Number(this.editToSelectedUnit.unitstatus_IDFK) - 1
          : this.backstage - 1;
    }
    this.getTheformDate(0);
  }
  getTheformDate(backstage) {
    this.showSpinner = true;
    this.backstage = backstage != 0 ? backstage : this.backstage;
    let saleDocs =
      this.editToSelectedUnit.saleagreement_files?.map((file: any) => {
        return {
          name: file.salefile_name,
          type: file.salefile_name.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'image/jpeg',
          preview: `http://192.168.0.121/noncdnsuperadmin-live/images/crm/closurefiles/${file.salefile_name}`,
        };
      }) || [];

    let closureDocs =
      this.editToSelectedUnit.closure_img?.map((file: any) => {
        return {
          name: file.file_name,
          type: file.file_name.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'image/jpeg',
          preview: `http://192.168.0.121/noncdnsuperadmin-live/images/crm/closurefiles/${file.file_name}`,
        };
      }) || [];

    if (this.backstage == 4) {
      this.paymentForm.patchValue({
        paymentMode: this.editToSelectedUnit.payment_mode || '',
        transactionMode: this.editToSelectedUnit.transacmode_status || '',
        transactionId: this.editToSelectedUnit.transacid_chequeno || '',
        amountReceived: this.editToSelectedUnit.payreceive_amount || '',
        receivedDate: this.editToSelectedUnit.payreceive_date || '',
        remark: this.editToSelectedUnit.remarks_5 || '',
        bankName: this.editToSelectedUnit.ifsc_code
          ? this.editToSelectedUnit.bank_name
          : this.editToSelectedUnit.bankinfo_IDFK || '',
        loanStatus: this.editToSelectedUnit.loan_status || '',
        ifscCode: this.editToSelectedUnit.ifsc_code || '',
        addBank: this.editToSelectedUnit.ifsc_code != null ? true : false,
      });
    } else if (this.backstage == 3) {
      this.saleAgreementForm.patchValue({
        documents: [...saleDocs],
        status: this.editToSelectedUnit.saleagreement_stage || '',
        remark: this.editToSelectedUnit.remarks_4 || '',
      });
    } else if (this.backstage == 2) {
      this.bookingForm.patchValue({
        bhk: this.editToSelectedUnit.bhk,
        unitNumber: this.editToSelectedUnit.unit_name,
        dimension: this.editToSelectedUnit.unit_sba,
        exename: this.editToSelectedUnit.Exec_IDFK,
        rateSquareFeet: this.editToSelectedUnit.rate_per_sqft,
        remark: this.editToSelectedUnit.remarks_3,
        documents: [...closureDocs],
        leadname: this.editToSelectedUnit.customer_name,
      });
    }
    setTimeout(() => {
      this.showSpinner = false;
    }, 200);
  }
  onModalClose() {
    this.backstage = 0;
    this.isEditUnitStatus = false;
    this.unitDetails = '';
    this.bookingForm.reset();
    this.saleAgreementForm.reset();
    this.paymentForm.reset();
    this.registrationForm.reset();
    this.soldForm.reset();
    this.unitEditForm.reset();
  }

  toggleAddBank() {
    const currentValue = this.paymentForm.get('addBank')?.value;
    const newValue = !currentValue;

    this.paymentForm.patchValue({
      addBank: newValue,
      bankName: null,
      ifscCode: null,
    });

    // Optional: reset validation state
    this.paymentForm.get('bankName')?.markAsPristine();
    this.paymentForm.get('ifscCode')?.markAsPristine();
    this.applyValidation();
  }

  async showSuccess() {
    const toast = await this.toastController.create({
      message: 'Unit Updated successfully!',
      duration: 1000,
      position: 'bottom',
      cssClass: 'slide-toast',
      icon: 'checkmark',
      buttons: [
        {
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await toast.present();

    // ✅ Wait until toast disappears
    await toast.onDidDismiss();

    // Now call method
    this.getAllCountsOfInventory();
  }

  async onCheckboxChange(event: any) {
    if (event.detail.checked) {
      const alert = await this.alertController.create({
        header: 'Move to Available?',
        message: 'Do you want to move this unit to Available?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              event.target.checked = false; // uncheck if cancel
            },
          },
          {
            text: 'Yes',
            handler: () => {
              this.showSpinner = true;
              const formData = new FormData();
              formData.append('unitstatus', '7');
              formData.append('leadid', this.editToSelectedUnit.Lead_IDFK);
              formData.append('propid', this.editToSelectedUnit.property_idfk);
              formData.append('unitid', this.editToSelectedUnit.unit_IDPK);
              formData.append('assignid', this.editToSelectedUnit.Exec_IDFK);
              formData.append('userid', localStorage.getItem('UserId'));

              console.log(this.soldForm.value);
              this.sharedService.saveUnit(formData).subscribe((res) => {
                if (res['status'] == 'true') {
                  this.onEditInventoryUintDetails(this.editToSelectedUnit);
                  this.showSuccess();
                }
              });
            },
          },
        ],
      });
      await alert.present();
    }
  }
  onUpdateUnit() {
    this.isEditUnitStatus = !this.isEditUnitStatus;
    this.unitEditForm.patchValue({
      unitName: this.editToSelectedUnit.unit_name,
      bhk: this.editToSelectedUnit.bhk_IDFK,
      unitSize: this.editToSelectedUnit.unit_size,
      builtupArea: this.editToSelectedUnit.unit_builtuparea,
      carpetarea: this.editToSelectedUnit.unit_carpetarea,
      unitSBA: this.editToSelectedUnit.unit_sba,
      unitUDS: this.editToSelectedUnit.unit_uds,
      doreFacing: this.editToSelectedUnit.doorfacing_IDFK,
      status: this.editToSelectedUnit.unitstatus_IDFK,
      balcony: this.editToSelectedUnit.unit_balcony == '1',
      garden: this.editToSelectedUnit.unit_garden == '1',
    });
  }

  onUnitNameSearch(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.inventoryData1 = [...this.inventoryData];
      return;
    }
    this.inventoryData1 = this.inventoryData.filter((item: any) => {
      return item.unit_name?.toLowerCase().includes(searchTerm);
    });
  }

  onreset() {
    this.filteredParams = {
      propid: '1830',
      towerid: '',
      size: '',
      bhk: '',
      status: '1',
      viewtype: this.filteredParams.viewtype,
    };
    this.addQueryParams();
  }

  prepareData(data: any[]) {
    data.forEach((tower) => {
      tower.floors.forEach((floor) => {
        const total = +floor.floor_units || 0;
        const actual = floor.units || [];

        const result = [...actual];
        const remaining = total - actual.length;

        for (let i = 0; i < remaining; i++) {
          result.push({
            isEmpty: true,
            index: actual.length + i + 1,
          });
        }
        floor.unitSlots = result;
      });
    });
  }

  onEmptyUnitDetailsUpdate(tIndex, fIndex) {
    const tower = this.inventoryData[tIndex];
    const floor = tower.floors[fIndex];

    console.log(tower, floor);
    this.isEditUnitStatus = true;
    this.unitDetails = {
      ...floor,
      floornum: this.getOrdinalFloor(+floor.floornum),
      ...tower,
    };
    const form = this.unitEditForm;
    form.get('status')?.setValidators([Validators.required]);

    this.editUnitDetailsModal.present();
  }

  getOrdinalFloor(floorNum: number): string {
    if (floorNum === 0) return 'Ground Floor';

    const j = floorNum % 10;
    const k = floorNum % 100;

    let suffix = 'th';
    if (j === 1 && k !== 11) suffix = 'st';
    else if (j === 2 && k !== 12) suffix = 'nd';
    else if (j === 3 && k !== 13) suffix = 'rd';

    return `${floorNum}${suffix} Floor`;
  }
  addUnitDetails() {
    if (this.unitEditForm.invalid) {
      this.unitEditForm.markAllAsTouched();
      return;
    }
    this.showSpinner = true;
    const formValue = this.unitEditForm.value;
    const updateValues = Object.fromEntries(
      Object.entries({
        unitno: formValue.unitName,
        bhk: formValue.bhk,
        size: formValue.unitSize,
        builtuparea: formValue.builtupArea,
        carpetarea: formValue.carpetarea,
        sba: formValue.unitSBA,
        uds: formValue.unitUDS,
        facing: formValue.doreFacing,
        status: formValue.status,
        balcony: formValue.balcony ? '1' : '0',
        garden: formValue.garden ? '1' : '0',
      }).map(([key, val]) => [key, val != null ? String(val) : ''])
    );
    let param = {
      propid: this.filteredParams.propid,
      propname: this.selectedProp.property_info_name,
      towerid: this.unitDetails['towerid'],
      floorid: this.unitDetails['floorid'],
      units: JSON.stringify(updateValues),
    };

    console.log(param);
    this.sharedService.addUnitsForTower(param).subscribe(async (resp) => {
      await this.showSuccess();
      this.editUnitDetailsModal.dismiss();
    });
  }
}
