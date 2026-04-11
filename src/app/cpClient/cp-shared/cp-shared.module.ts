import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpHeaderComponent } from '../cp-header/cp-header.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CpFooterComponent } from '../cp-footer/cp-footer.component';

@NgModule({
  declarations: [CpHeaderComponent, CpFooterComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [CpHeaderComponent, CpFooterComponent],
})
export class CpSharedModule {}
