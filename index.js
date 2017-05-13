const Router = require('koa-rest-router');
const assign = require('lodash/assign');
const ctrlFactory = require('./lib/ctrl-factory')

function KoaRestful (options = {}) {
  if (!(this instanceof KoaRestful)) {
    return new KoaRestful(options)
  }
  const defaultOptions = {
      router: {},
      models: [],
      defaultHiddenFields: ["__v", "password"],
      defaultReadOnlyFields: ["_id", "id", "__v", "createdAt", "updatedAt", "password"]
  };

  this.errHandler = options.errorHandler || ((err) => err);
  this.options = assign({}, defaultOptions, options);

  this.api = new Router(this.options.router || {});
  this.options.models.forEach((model) => {
    const ctrl = ctrlFactory(model, this);
    const modelName = model.schema.modelName.toLowerCase();
    this.api.resource(modelName, ctrl, model.options || {});
  })
}

KoaRestful.prototype.getApi = () => {
    return this.api;
}

module.exports = KoaRestful