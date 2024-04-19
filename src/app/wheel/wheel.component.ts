import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { take } from 'rxjs';
import { UserList } from 'src/models/user.list.model';
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
  title: string = 'Wheels Of Decisions';
  userList: UserList = { partitionKeyValue: '', users: [] };
  idToLandOn: any;
  wheelItems: any[] = [];
  textOrientation: TextOrientation = TextOrientation.HORIZONTAL;
  textAlignment: TextAlignment = TextAlignment.OUTER;
  decisionType: string = 'wheel-of-decision-stand-up';
  newUser: FormControl;
  constructor(private userService: UserService) {
    this.newUser = new FormControl();
    this.getUsers();
  }

  updateUsers() {
    if (this.shouldCallService()) {
      this.userService
        .setUsers(this.userList)
        .pipe(take(1))
        .subscribe(() => {});
    }
  }

  ngOnInit() {}

  shouldCallService() {
    return this.decisionType.length > 0;
  }

  decisionChange(event: any) {
    this.decisionType = event.value;
    if (this.shouldCallService()) {
      this.getUsers();
    } else {
      this.userList.users.forEach((u) => (u.toSpin = true));
      this.configureWheelItems();
    }
  }

  getUsers() {
    this.userService
      .getUsers(this.decisionType)
      .pipe(take(1))
      .subscribe((value: UserList) => {
        this.userList = value;
        this.userList.users = this.userList.users.sort(this.userSort);
        this.configureWheelItems();
      });
  }

  isSelected(user: User) {
    return user.toSpin;
  }

  toggle(user: User) {
    var index = this.userList.users.indexOf(user);
    this.userList.users[index].toSpin = !user.toSpin;
    this.configureWheelItems();
    this.updateUsers();
  }

  delete(user: User) {
    if (confirm('Are you sure to delete ' + user.id)) {
      this.userList.users = this.userList.users
        .filter((item) => item !== user)
        .sort(this.userSort);
      this.configureWheelItems();
      this.updateUsers();
    }
  }

  add() {
    if (!this.userList.users.some((s) => s.id == this.newUser.value)) {
      this.userList.users.push({ id: this.newUser.value, toSpin: true });
      this.userList.users.sort(this.userSort);
      this.newUser.reset();
      this.configureWheelItems();
      this.updateUsers();
    }
  }

  configureWheelItems() {
    var colors = ['#e6194B',
    '#3cb44b',
    '#4363d8',
    '#f58231',
    '#f032e6',
    '#469990',
    '#9A6324',
    '#800000',
    '#000075',
    '#a9a9a9',
    '#000000'];
    this.wheelItems = this.userList.users
      .filter((f) => f.toSpin === true)
      .map((user) => {
        // between min (included) and max (not included):
        /*
        function randomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }
        */
        const colorIndex = Math.floor(Math.random() * (colors.length - 0) + 0);
        const color = colors[colorIndex]
        colors.splice(colorIndex, 1);

        return {
        fillStyle: color,
        text: user.id,
        id: user.id,
        textFillStyle: 'white',
        textFontSize: '16',
      }});
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
    this.userList.users[
      this.userList.users.findIndex((u) => u.id == this.idToLandOn)
    ].toSpin = false;

    if (this.userList.users.every((user) => !user.toSpin)) {
      this.userList.users.forEach((user) => (user.toSpin = true));
    }
    this.updateUsers();
  }

  userSort(a: User, b: User) {
    const nameA = a.id.toUpperCase(); // ignore upper and lowercase
    const nameB = b.id.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }
}
