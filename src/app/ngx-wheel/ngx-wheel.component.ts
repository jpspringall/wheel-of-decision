import {
  AfterRenderPhase,
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  afterNextRender,
} from '@angular/core';
export interface Item {
  text: string;
  fillStyle: string;
  id: any;
}
export enum TextAlignment {
  INNER = 'inner',
  OUTER = 'outer',
  CENTER = 'center',
}

export enum TextOrientation {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CURVED = 'curved',
}

declare let Winwheel: any;
declare let TweenMax: any

@Component({
  selector: 'ngx-wheel',
  standalone: true,
  template: `
    <canvas
      (click)="!disableSpinOnClick && spinEmit()"
      id="canvas"
      [width]="width"
      [height]="height"
    >
      Canvas not supported, use another browser.
    </canvas>
  `,
  styles: [],
})
export class NgxWheelComponent {

  @Input() height!: number;
  @Input() idToLandOn: any;
  @Input() width!: number;
  @Input() items!: Item[];
  @Input() spinDuration!: number;
  @Input() spinAmount!: number;
  @Input() innerRadius!: number;
  @Input() pointerStrokeColor!: string;
  @Input() pointerFillColor!: string;
  @Input() disableSpinOnClick!: boolean;
  @Input() textOrientation!: TextOrientation;
  @Input() textAlignment!: TextAlignment;

  @Output() onSpinEmit: EventEmitter<any> = new EventEmitter();
  @Output() onSpinStart: EventEmitter<any> = new EventEmitter();
  @Output() onSpinComplete: EventEmitter<any> = new EventEmitter();

  wheel: any;
  completedSpin: boolean = false;
  isSpinning: boolean = false;

  constructor() {
    afterNextRender(() => { this.loadWheel(); }, { phase: AfterRenderPhase.Write });
  }

  reset() {
    if (this.wheel !== undefined) {
      this.wheel.stopAnimation(false);
      this.wheel.rotationAngle = 0;
      this.wheel.ctx.clearRect(
        0,
        0,
        this.wheel.ctx.canvas.width,
        this.wheel.ctx.canvas.height
      );
      this.isSpinning = false;
      this.completedSpin = false;
      this.loadWheel();
    }
  }

  loadWheel() {
    const segments = this.items;
    // @ts-ignore
    this.wheel = new Winwheel({
      numSegments: segments.length,
      segments,
      innerRadius: this.innerRadius || 0,
      outerRadius: this.height / 2 - 20,
      centerY: this.height / 2 + 20,
      textOrientation: this.textOrientation,
      textAligment: this.textAlignment,
      animation: {
        type: 'spinToStop', // Type of animation.
        duration: this.spinDuration, // How long the animation is to take in seconds.
        spins: this.spinAmount, // The number of complete 360 degree rotations the wheel is to do.
      },
    });
    // @ts-ignore
    TweenMax.ticker.addEventListener('tick', this.drawPointer.bind(this));
  }

  spinEmit() {
    this.onSpinEmit.emit(null);
  }

  spin() {
    if (this.completedSpin || this.isSpinning) return;
    this.isSpinning = true;
    this.onSpinStart.emit(null);
    const segmentToLandOn = this.wheel.segments
      .filter((x: any) => !!x)
      .find((y: any) => this.idToLandOn == y.id);
    const segmentTheta = segmentToLandOn.endAngle - segmentToLandOn.startAngle;
    this.wheel.animation.stopAngle =
      segmentToLandOn.endAngle - segmentTheta / 4;
    this.wheel.startAnimation();
    setTimeout(() => {
      this.completedSpin = true;
      this.onSpinComplete.emit(null);
    }, this.spinDuration * 1000);
  }

  ngOnDestroy() {
    // @ts-ignore
    //TweenMax.ticker.removeEventListener('tick');
  }

  drawPointer() {
    let c = this.wheel.ctx;
    // Create pointer.
    if (c) {
      c.save();
      c.lineWidth = 2;
      c.strokeStyle = this.pointerStrokeColor;
      c.fillStyle = this.pointerFillColor;
      c.beginPath();
      c.moveTo(this.width / 2 - 40, 2);
      c.lineTo(this.width / 2 + 40, 2);
      c.lineTo(this.width / 2, 84);
      c.lineTo(this.width / 2 - 40, 2);
      c.stroke();
      c.fill();
      c.restore();
    }
  }
}
