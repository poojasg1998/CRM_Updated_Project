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
import { AddLeadComponent } from './add-lead.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AddLeadComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    SharedModule,
    NgMultiSelectDropDownModule,
    CpSharedModule,
  ],

  declarations: [AddLeadComponent],
})
export class AddLeadModule {}
