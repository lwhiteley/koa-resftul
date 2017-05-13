let Koa = require('koa')
let app = new Koa()

const mongoose = require('mongoose-fill');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/myapp');

let Rest = require('../') // require('koa-restful')
const rest = Rest({ 
    router: {
      prefix: '/'
    },
    models: [
        require('./user.model')
    ],
    defaultHiddenFields: Rest.defaultHiddenFields.concat(["salt"]),
    defaultReadOnlyFields: Rest.defaultReadOnlyFields.concat(["salt"])
})
const api = rest.api;
app.use(api.middleware())

app.listen(4444, () => {
  console.log('Open http://localhost:4444 and try')
  var basePath = '';
  api.routes.forEach((route) => {
    var base = route.path.split('/')[1]
    if(basePath !== base){
      var underline = '\n======================================='
      console.log('\n\t\t', base, underline)
      basePath = base;
    }
    console.log(`${route.method} http://localhost:4444${route.path}`)
  })
})