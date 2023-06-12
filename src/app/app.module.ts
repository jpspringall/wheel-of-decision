import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    MatToolbarModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
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
