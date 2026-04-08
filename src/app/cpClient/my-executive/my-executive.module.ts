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
import { MyExecutiveComponent } from './my-executive.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MyExecutiveComponent,
      },
    ]),
    IonicModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    CalendarModule,
    ReactiveFormsModule,
    CpSharedModule,
    NgMultiSelectDropDownModule,
  ],

  declarations: [MyExecutiveComponent],
})
export class MyExecutiveModule {}
