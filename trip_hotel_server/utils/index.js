let xlsx = require('node-xlsx')
const fs = require('fs')

// 解析得到文档中的所有 sheet
function readXlsx(fileName, onlyFirstRow = false) {
  let sheet = xlsx.parse(fs.readFileSync(fileName))[0]
  let res = { allData: [] }

  let keys = []
  // 遍历xlsx每行内容
  for (let rowId in sheet['data']) {
    let row = sheet['data'][rowId]
    if (rowId == 0) {
      keys = row
    } else {
      //遍历改行的所有数据
      let obj = {}
      for (let i = 0; i < row.length; i++) {
        obj[keys[i]] = row[i]
      }
      res.allData.push(obj)

      if (onlyFirstRow) {
        break
      }
    }
  }

  return res
}

//更新hotel-room
function writeXlsx(fileName, data) {
  //添加数据
  var addInfo = {}
  //名称
  addInfo.name = '酒店详情'
  let keys = Object.keys(data[0])

  //数据数组
  addInfo.data = [keys]
  //添加数据
  for (const obj of data) {
    addInfo.data.push(Object.values(obj))
  }

  const excelData = [addInfo]
  // 写xlsx
  var buffer = xlsx.build(excelData)
  console.log(fileName)
  //写入数据
  fs.writeFile(fileName, buffer, function (err) {
    if (err) {
      throw err
    }
    //输出日志
    console.log('Write to xls has finished')
  })
}

module.exports = {
  readXlsx,
  writeXlsx,
}
