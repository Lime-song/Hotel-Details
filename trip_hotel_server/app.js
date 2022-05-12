const express = require('express')
const path = require('path')
const Theme = require('./utils/themeDb')
const OrderDb = require('./utils/orderDb.js')
//可用托管静态文件方法直接访问图片：app.use(express.static('public'))
const { readXlsx, writeXlsx } = require('./utils/index')

const port = 4000
const app = express()
let firstWriteFlag = true
app.use(express.json()) // for parsing application/json
app.use(express.static('static'))

app.use(function (req, res, next) {
  /*匹配任何路由*/ //res.send('中间件');
  // console.log(new Date());
  next() /*表示匹配完成这个中间件以后程序继续向下执行*/
})

//获取某个酒店的详情信息
app.get('/hotel-detail', function (req, res) {
  let filePath = path.join(__dirname, 'data', 'ctrip_hotels_details.xls')
  const data = readXlsx(filePath, true)
  res.send({ code: 200, data: data.allData })
})

//获取酒店的所有房间情况
app.get('/hotel-room-detail', async function (req, res) {
  try {
    let filePath = path.join(__dirname, 'data', 'ctrip_hotels_base_rooms.xls')
    const { allData } = readXlsx(filePath)
    //读出房间信息，同时把配置存到order.json
    if (firstWriteFlag) {
      let list = []
      allData.forEach((element) => {
        list.push({
          title: element.base_room_name,
          key: element.base_room_id,
          detail: element,
        })
      })
      await new OrderDb(__dirname).addChildren(list)
      firstWriteFlag = false
    }

    res.send({ code: 200, data: allData })
  } catch (e) {
    console.log(e)
    res.send({ code: 500, data: {} })
  }
})

//更新酒店的房间顺序
app.post('/hotel-room-detail', function (req, res) {
  const { list: data } = req.body
  const filePath = path.join(__dirname, 'data', 'ctrip_hotels_base_rooms.xls')
  writeXlsx(filePath, data)

  //读出房间信息，同时把配置存到order.json
  let list = []
  data.forEach((element) => {
    list.push({
      title: element.base_room_name,
      key: element.base_room_id,
      detail: element,
    })
  })
  new OrderDb(__dirname).addChildren(list)

  res.send({ code: 200 })
})

//酒店的所有图片以及视频，首页展示
app.get('/hotel-picture', function (req, res) {
  try {
    let filePath = path.join(__dirname, 'data', 'ctrip_hotels_pictures.xls')
    const data = readXlsx(filePath)
    res.send({ code: 200, data: data.allData })
  } catch (e) {
    res.send({ code: 500, data: {} })
  }
})

//
app.post('/theme/:type', async function (req, res) {
  const { color } = req.query
  const { type } = req.params
  const db = new Theme(__dirname)
  if (type === 'add') {
    await db.add(color)
  } else {
    await db.update(color)
  }
  res.send({ code: 200 })
})

app.get('/theme', async function (req, res) {
  let data = await new Theme(__dirname).read()
  res.send({ code: 200, data })
})

app.get('/order', function (req, res) {
  new OrderDb(__dirname)
    .read()
    .then((data) => res.send({ code: 200, data }))
    .catch((e) => {
      console.log(e)
    })
})

app.post('/order/:type', async function (req, res) {
  const { order } = req.body
  const { type } = req.params

  try {
    if (type === 'roomItem') {
      const target = order.find((item) => item.key === 'roomList')
      const filePath = path.join(
        __dirname,
        'data',
        'ctrip_hotels_base_rooms.xls',
      )
      let list = []
      target.children.forEach((item) => list.push(item.detail))
      await writeXlsx(filePath, list)
    }

    await new OrderDb(__dirname).update(order)
    res.send({ code: 200 })
  } catch (err) {
    res.send({ code: 500 })
  }
})

app.use(function (req, res) {
  //res.render('404',{});
  res.status(404).send('404')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
