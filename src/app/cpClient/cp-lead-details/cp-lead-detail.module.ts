import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CalendarModule } from 'primeng/calendar';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { CpSharedModule } from '../cp-shared/cp-shared.module';
import { SharedModule } from 'src/app/realEstate/shared.module';
import { CpLeadDetailsComponent } from './cp-lead-details.component';
import { UsvformComponent } from '../usvform/usvform.component';
import { SvformComponent } from '../svform/svform.component';
import { RsvformComponent } from '../rsvform/rsvform.component';
import { RetailFollowupformComponent } from '../retail-followupform/retail-followupform.component';
import { NegoformComponent } from '../negoform/negoform.component';
import { ClosedformComponent } from '../closedform/closedform.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { JunkformComponent } from '../junkform/junkform.component';
import { RetailJunkFormComponent } from '../retail-junk-form/retail-junk-form.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CpLeadDetailsComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    NgxMaterialTimepickerModule,
    PhotoGalleryModule,
    ReactiveFormsModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    CpSharedModule,
    MultiSelectModule,
  ],
  declarations: [
    CpLeadDetailsComponent,
    UsvformComponent,
    SvformComponent,
    RsvformComponent,
    RetailFollowupformComponent,
    NegoformComponent,
    JunkformComponent,
    ClosedformComponent,
    RetailJunkFormComponent,
  ],
})
export class CpLeadDetailsModule {}
