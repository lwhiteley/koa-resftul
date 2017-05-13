const Router = require('koa-rest-router');
const forEach = require('lodash/forEach');
const ctrlFactory = require('./lib/ctrl-factory')

function KoaRestful (options = {}) {
  if (!(this instanceof KoaRestful)) {
    return new KoaRestful(options)
  }

  this.errHandler = options.errorHandler || ((err) => err);

  this.api = new Router(options.router || {});
  forEach(options.models, (model) => {
    const ctrl = ctrlFactory(model, this);
    const modelName = model.schema.modelName.toLowerCase();
    this.api.resource(modelName, ctrl, model.options || {});
  })
}

KoaRestful.prototype.getApi = () => {
    return this.api;
}

module.exports = KoaRestful