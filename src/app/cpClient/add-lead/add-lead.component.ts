import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CpApiService } from '../cp-api.service';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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
  isupload: boolean = false;

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

      if (resp['code'] == '0') {
        Swal.fire({
          title: 'Lead Added Successfully',
          text: 'Added as a new Lead',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'success',
        }).then(() => {
          this.addleadForm.reset();
          location.reload();
        });
      } else if (resp['code'] == '1') {
        Swal.fire({
          title: 'Duplicate Lead',
          text: 'Lead already exists with this number.',
          confirmButtonText: 'OK',
          heightAuto: false,
          icon: 'error',
        }).then(() => {
          this.addleadForm.reset();
          location.reload();
        });
      } else if (resp['code'] == '2') {
        Swal.fire({
          title: 'Lead Added Succesfully',
          text: 'Added as a new Lead',
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

  onUploadAddLeads(isUpload) {
    this.isupload = !this.isupload;
  }

  onDragOver(event: any) {
    event.preventDefault();
  }
  // Drag Leave
  onDragLeave(event: any) {
    event.preventDefault();
  }

  async downloadSample() {
    const csvData = [
      [
        'Name*',
        'Phone*',
        'Email',
        'Source*',
        'PropertyType',
        'Segment',
        'Size',
      ],
      [
        'Ravi Kumar',
        '9876543210',
        'ravi@gmail.com',
        'Website',
        'Apartment',
        'Sale',
        '3 BHK',
      ],
      [
        'Anita Sharma',
        '9123456780',
        'anita@gmail.com',
        'Facebook',
        'Villa',
        'Resale',
        '4 BHK',
      ],
      [
        'Rohit Sharma',
        '9123006780',
        'rohit45@gmail.com',
        'Meta',
        'Plot',
        'Rental',
        '3 BHK',
      ],
    ];

    // let csvContent = '';
    // csvData.forEach((row) => {
    //   csvContent += row.join(',') + '\n';
    // });

    // const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // const link = document.createElement('a');
    // const url = URL.createObjectURL(blob);

    // link.href = url;
    // link.download = 'sample_leads.csv';

    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // const csvContent = csvData.map((row) => row.join(',')).join('\n');
    // try {
    //   await Filesystem.writeFile({
    //     path: 'sample_leads1.csv',
    //     data: csvContent,
    //     directory: Directory.Documents, // or Directory.External
    //     encoding: Encoding.UTF8,
    //   });

    //   alert('File downloaded successfully');
    // } catch (error) {
    //   console.error('Error saving file:', error);
    // }

    try {
      // 1. Convert the array to a CSV string
      const csvContent = csvData.map((e) => e.join(',')).join('\n');

      // 2. Convert the string to a Base64 Data URL
      // This "simulates" a server URL for the downloadFile method
      const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
      const dataUrl = `data:text/csv;base64,${base64Data}`;

      // 3. Use the Data URL in downloadFile
      const result = await Filesystem.downloadFile({
        url: dataUrl,
        path: 'sample_leads1.csv',
        directory: Directory.Documents,
        progress: true,
      });

      console.log('File generated and saved to:', result.path);
    } catch (error) {
      console.error('Error processing local download:', error);
    }
  }

  onCsvSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const isCsv =
      file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';

    if (!isCsv) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Only CSV files are supported',
        icon: 'error',
        heightAuto: false,
      });
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('loginid', localStorage.getItem('UserId'));
    formData.append('csvfile', file);

    this.api.uploadBulkLeadsService(formData).subscribe((res) => {
      if (res['status'] == 'True') {
        Swal.fire({
          title: 'Success',
          text: 'CSV uploaded successfully',
          icon: 'success',
          heightAuto: false,
        });

        // 🔥 SWITCH TAB
        this.todaysTabs('manuallead');
      } else {
        Swal.fire({
          title: 'Error',
          text: 'CSV uploaded failed',
          icon: 'error',
          heightAuto: false,
        });
      }
    });
  }

  todaysTabs(type: string) {
    // this.selectedTab = type;
    // if (type === 'manuallead') {
    //   this.openManuallyAddForm = true;
    //   this.bulkLeadsAdd = false;
    // } else if (type === 'bulkleads') {
    //   this.openManuallyAddForm = false;
    //   this.bulkLeadsAdd = true;
    // }
  }

  // File Drop
  onFileDrop(event: any) {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const isCsv = file.name.toLowerCase().endsWith('.csv');

    if (!isCsv) {
      Swal.fire({
        title: 'Invalid File',
        text: 'Only CSV files are supported',
        icon: 'error',
        heightAuto: false,
      });
      return;
    }

    //  CALL API HERE (important)

    const formData = new FormData();
    formData.append('loginid', localStorage.getItem('UserId'));
    formData.append('csvfile', file);

    this.api.uploadBulkLeadsService(formData).subscribe(
      (res) => {
        if (res['status'] == 'True') {
          Swal.fire({
            title: 'Success',
            text: 'CSV file uploaded successfully',
            icon: 'success',
            heightAuto: false,
          });

          this.todaysTabs('manuallead');
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Upload failed',
            icon: 'error',
            heightAuto: false,
          });
        }
      },
      (err) => {
        Swal.fire({
          title: 'Error',
          text: 'Upload failed',
          icon: 'error',
          heightAuto: false,
        });
      }
    );
  }
}
