const { Low, JSONFile } = require('lowdb-node')
const path = require('path')

//处理某个用户的index.json
class Theme {
  constructor(dirName) {
    this.db = new Low(new JSONFile(path.join(dirName, '/config/theme.json')))
  }

  async add(data) {
    await this.db.read()
    if (!this.db.data.choices.includes(data)) {
      this.db.data.choices.push(data) //加入一条记录
    }

    this.db.data.current = data
    await this.db.write()
  }

  async update(data) {
    await this.db.read()
    this.db.data.current = data
    await this.db.write()
  }

  async read() {
    //读取所有内容
    await this.db.read()
    return this.db.data
  }
}

module.exports = Theme
