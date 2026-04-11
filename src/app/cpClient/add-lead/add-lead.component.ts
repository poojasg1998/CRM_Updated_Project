import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';

@Component({
  selector: 'app-add-lead',
  templateUrl: './add-lead.component.html',
  styleUrls: ['./add-lead.component.scss'],
})
export class AddLeadComponent implements OnInit {
  addleadForm!: FormGroup;
  localityList: any;
  source: any;
  filteredSource: any;

  constructor(private fb: FormBuilder, private api: CpApiService) {}

  ngOnInit() {
    this.addleadForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]*$/),
        ],
      ],
      number: [
        '',
        [Validators.required, Validators.pattern(/^(\+91[\-\s]?)?[0-9]{10}$/)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      source: ['', Validators.required],
      location: [''],
      priority: [''],
      type: [''],
      possession: [''],
      leadSegment: [[]],
      size: [''],
      budget: [''],
      address: ['', Validators.required],
    });
    this.getSource();
    this.getLocalities();
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.addleadForm.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }

  addLead() {
    if (this.addleadForm.invalid) {
      this.addleadForm.markAllAsTouched();
      return;
    }

    const params = {
      Name: this.addleadForm.value.name,
      Number: this.addleadForm.value.number,
      Mail: this.addleadForm.value.email,
      Source: this.addleadForm.value.source,
      PropertyType: this.addleadForm.value.type,
      Timeline: this.addleadForm.value.possession,
      Varient: this.addleadForm.value.size,
      Budget: this.addleadForm.value.budget,
      Address: this.addleadForm.value.address,
      addedby: localStorage.getItem('Name'),
      leadpriority: this.addleadForm.value.priority,
      preferdlocation: this.addleadForm.value.location.locality,
      localityid: this.addleadForm.value.location.id,
      categoryid: this.addleadForm.value.leadSegment,
      loginid: localStorage.getItem('UserId'),
    };
    console.log(params);
    this.api.addLead(params).subscribe((resp) => {
      console.log(resp);
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Lead Added Successfully',
          text: 'added new Lead',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.addleadForm.reset();
          location.reload();
        });
      }
    });
    console.log(this.addleadForm.value);
  }
  toggleLeadSegment(value: string) {
    const current = this.addleadForm.value.leadSegment || [];

    if (current.includes(value)) {
      // remove
      this.addleadForm.patchValue({
        leadSegment: current.filter((v: string) => v !== value),
      });
    } else {
      // add
      this.addleadForm.patchValue({
        leadSegment: [...current, value],
      });
    }
  }
  getLocalities() {
    this.api.localitylist().subscribe((resp) => {
      this.localityList = resp['Localities'];
    });
  }
  getSource() {
    this.api.getSource().subscribe((resp) => {
      this.source = resp['Sources'];
      this.filteredSource = resp['Sources'];
    });
  }
}
