//import { Low, JSONFile } from 'lowdb';
const { Low, JSONFile } = require('lowdb-node')
const path = require('path')

//处理某个用户的index.json
class OrderDb {
  constructor(dirName) {
    this.db = new Low(new JSONFile(path.join(dirName, '/config/order.json')))
  }

  async read() {
    //读取所有内容
    await this.db.read()
    this.db.data ||= { order: [] } //如果没有对应的JSON文件，进行初始化
    return this.db.data.order
  }

  async update(data) {
    await this.db.read()
    this.db.data.order = data
    await this.db.write()
  }

  async addChildren(data) {
    await this.db.read()
    const target = this.db.data.order.find((item) => item.title === 'roomList')
    target.children = data
    await this.db.write()
  }
}

module.exports = OrderDb
