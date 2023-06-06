import { UserDao } from '../models/user.dao';

export class UserList {
  userDao: UserDao;
  /**
   * Handles the various APIs for displaying and managing users
   * @param {UserDao} userDao
   */
  constructor(userDao: UserDao) {
    this.userDao = userDao;
  }
  async getUsers(req: any, res: any) {
    const items = await this.userDao.getAll();
    res.json(items);
  }

  async recreateUsers(req: any, res: any) {
    const result = await this.userDao.recreateUsers(req.body);
    res.json(result);
  }

  // async completeUser(req: any, res: any) {
  //   const completedUsers = Object.keys(req.body);
  //   const users: any = [];

  //   completedUsers.forEach((user) => {
  //     users.push(this.userDao.updateItem(user));
  //   });

  //   await Promise.all(users);

  //   res.redirect('/');
  // }
}
