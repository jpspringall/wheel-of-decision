import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, take } from 'rxjs';
import { User } from 'src/models/user.model';
import {
  NgxWheelComponent,
  TextAlignment,
  TextOrientation,
} from '../ngx-wheel/ngx-wheel.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.css'],
})
export class WheelComponent implements OnInit {
  @ViewChild(NgxWheelComponent, { static: false })
  wheel!: NgxWheelComponent;
  title: string = 'Wheel Of Decision';
  users: User[] = [];
  idToLandOn: any;
  wheelItems: any[] = [];
  textOrientation: TextOrientation = TextOrientation.HORIZONTAL;
  textAlignment: TextAlignment = TextAlignment.OUTER;
  constructor(private userService: UserService) {
    this.getUsers$()
      .pipe(take(1))
      .subscribe((value: User[]) => {
        this.users = value;
        this.configureWheelItems();
      });
  }

  updateUsers() {
    this.userService
      .setUsers(this.users)
      .pipe(take(1))
      .subscribe(() => {});
  }

  ngOnInit() {}

  getUsers$(): Observable<User[]> {
    return this.userService.getUsers();
  }

  isSelected(user: User) {
    return user.spun;
  }

  toggle(user: User) {
    var index = this.users.indexOf(user);
    this.users[index].spun = !user.spun;
    this.configureWheelItems();
    this.updateUsers();
  }

  configureWheelItems() {
    const colors = ['Red', 'Green', 'Blue', 'Purple'];
    console.log('configureWheelItems users', this.users);
    this.wheelItems = this.users
      .filter((f) => f.spun == false)
      .map((user, i) => ({
        fillStyle: colors[i % colors.length],
        text: user.id,
        id: user.id,
        textFillStyle: 'white',
        textFontSize: '16',
      }));
    this.resetWheel();
  }

  resetWheel() {
    setTimeout(() => this.wheel.reset(), 100);
  }
  spin() {
    this.configureWheelItems();
    this.idToLandOn =
      this.wheelItems[Math.floor(Math.random() * this.wheelItems.length)].id;
    setTimeout(() => this.wheel.spin(), 100);
  }

  afterWheel() {
    this.users[this.users.findIndex((u) => u.id == this.idToLandOn)].spun =
      true;

    if (this.users.every((user) => user.spun)) {
      this.users.forEach((user) => (user.spun = false));
    }

    this.updateUsers();
  }
}
