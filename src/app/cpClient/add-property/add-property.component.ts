import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CpApiService } from '../cp-api.service';
import { SharedService } from 'src/app/realEstate/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-property',
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.scss'],
})
export class AddPropertyComponent implements OnInit {
  @ViewChild('addProperty') addProperty;
  @ViewChild('addSource') addSource;
  @ViewChild('addLocality') addLocality;
  showSpinner = false;
  isPropSourceLocality = 'property';
  source: any;
  localityList: any;
  propertyList: any;
  addPropertyForm!: FormGroup;
  addSourceForm!: FormGroup;
  addLocalityForm!: FormGroup;
  category = '';
  filterPropertyList: any;
  constructor(
    private activeroute: ActivatedRoute,
    private router: Router,
    private api: CpApiService,
    private fb: FormBuilder,
    public sharedService: SharedService
  ) {}

  ngOnInit() {
    this.addPropertyForm = this.fb.group({
      name: ['', Validators.required],
      category: [[], Validators.required],
    });
    this.addSourceForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.addLocalityForm = this.fb.group({
      name: ['', Validators.required],
    });
    this.activeroute.queryParams.subscribe((params) => {
      this.showSpinner = true;
      if (params['isPropSourceLocality']) {
        this.isPropSourceLocality = params['isPropSourceLocality'];
      } else {
        this.isPropSourceLocality = 'property';
      }
      if (this.isPropSourceLocality == 'property') {
        this.getProperties();
      } else if (this.isPropSourceLocality == 'source') {
        this.getSource();
      } else {
        this.getLocalities();
      }
    });
  }

  onPropSourceLocality(data) {
    this.isPropSourceLocality = data;
    this.router.navigate([], {
      queryParams: {
        isPropSourceLocality: data,
      },
    });
  }

  getSource() {
    this.api.getSource().subscribe((resp) => {
      this.source = resp['Sources'];
      this.showSpinner = false;
    });
  }
  getLocalities() {
    this.api.localitylist().subscribe((resp) => {
      this.localityList = resp['Localities'];
      this.showSpinner = false;
    });
  }
  getProperties() {
    this.api.propertylistnew().subscribe((resp) => {
      this.propertyList = resp['Properties'];
      this.filterPropertyList = this.propertyList;
      this.showSpinner = false;
    });
  }
  togglecategory(value: string) {
    const current = this.addPropertyForm.value.category || [];

    if (current.includes(value)) {
      // remove
      this.addPropertyForm.patchValue({
        category: current.filter((v: string) => v !== value),
      });
    } else {
      // add
      this.addPropertyForm.patchValue({
        category: [...current, value],
      });
    }
  }
  hasError(controlName: string, error: string): boolean {
    const control = this.addPropertyForm.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }
  propertyAdd() {
    if (this.addPropertyForm.invalid) {
      this.addPropertyForm.markAllAsTouched();
      return;
    }
    const params = {
      Propname: this.addPropertyForm.value.name,
      category: this.addPropertyForm.value.category,
    };
    this.api.addProperty(params).subscribe((resp) => {
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Successfully Added',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.showSpinner = true;
          this.addProperty.dismiss();
          this.getProperties();
        });
      }
    });
  }
  sourceAdd() {
    if (this.addSourceForm.invalid) {
      this.addSourceForm.markAllAsTouched();
      return;
    }
    const params = {
      sourcename: this.addSourceForm.value.name,
    };
    this.api.addSource(params).subscribe((resp) => {
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Successfully Added',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.showSpinner = true;
          this.addSource.dismiss();
          this.getSource();
        });
      }
    });
  }
  localityAdd() {
    if (this.addLocalityForm.invalid) {
      this.addLocalityForm.markAllAsTouched();
      return;
    }
    const params = {
      localityname: this.addLocalityForm.value.name,
    };
    this.api.addLocality(params).subscribe((resp) => {
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Successfully Added',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.showSpinner = true;
          this.addLocality.dismiss();
          this.getLocalities();
        });
      }
    });
  }
  onCategory(value) {
    this.category = this.category === value ? null : value;
    if (this.category != null) {
      this.filterPropertyList = this.propertyList.filter((item) => {
        return item.listing_category === value;
      });
    } else {
      this.filterPropertyList = this.propertyList;
    }
  }
}
