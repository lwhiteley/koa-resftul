let Koa = require('koa')
let app = new Koa()

const mongoose = require('mongoose-fill');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/myapp');

let rest = require('../')({
    router: {
      prefix: '/'
    },
    models: [
        require('./user.model')
    ]
})

const api = rest.api;
app.use(api.middleware())

app.listen(4444, () => {
  console.log('Open http://localhost:4444 and try')
  api.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:4444${route.path}`)
  })
})