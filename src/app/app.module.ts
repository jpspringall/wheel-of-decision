import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { isPlatformBrowser } from '@angular/common';
import { APP_ID, Inject, PLATFORM_ID } from '@angular/core';
import { ClientSideDirective } from './directives/client-side';
import { ServerSideDirective } from './directives/server-side';
import { NgxWheelComponent } from './ngx-wheel/ngx-wheel.component';
import { WheelComponent } from './wheel/wheel.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatCheckboxModule,
  ],
  providers: [{ provide: APP_ID, useValue: 'wheel-of-decision' }],
  declarations: [
    AppComponent,
    WheelComponent,
    NgxWheelComponent,
    ClientSideDirective,
    ServerSideDirective,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    @Inject(APP_ID) private appId: string
  ) {
    const platform = isPlatformBrowser(this.platformId)
      ? 'in the browser'
      : 'on the server';
    console.log(`Running ${platform} with appId=${this.appId}`);
  }
}
