const Router = require('koa-rest-router');
const assign = require('lodash/assign');
const ctrlFactory = require('./lib/ctrl-factory')

const defaultHiddenFields = ["__v", "password"];
const defaultReadOnlyFields = ["_id", "id", "__v", "createdAt", "updatedAt", "password"];

function KoaRestful (options = {}) {
  if (!(this instanceof KoaRestful)) {
    return new KoaRestful(options)
  }
  const defaultOptions = {
      router: {},
      models: [],
      defaultHiddenFields: defaultHiddenFields,
      defaultReadOnlyFields: defaultReadOnlyFields
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

KoaRestful.defaultHiddenFields = defaultHiddenFields
KoaRestful.defaultReadOnlyFields = defaultReadOnlyFields

module.exports = KoaRestful