import { isPlatformServer } from '@angular/common';
import {
  Directive,
  Inject,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({ selector: '[server-side]' })
export class ServerSideDirective implements OnInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private templateRef: TemplateRef<any>,
    private vcr: ViewContainerRef
  ) {}

  ngOnInit(): void {
    if (isPlatformServer(this.platformId)) {
      this.vcr.createEmbeddedView(this.templateRef);
    } else {
      this.vcr.clear();
    }
  }
}
