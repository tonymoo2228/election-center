import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { IgxDoughnutChartModule, IgxPieChartModule, IgxLegendModule, IgxItemLegendModule } from 'igniteui-angular-charts';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    IgxDoughnutChartModule,
    IgxPieChartModule,
		IgxLegendModule,
		IgxItemLegendModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
