const Router = require('koa-rest-router');
const _ = require('lodash');
let body = require('koa-better-body')()

const filterReadOnlyFields = (ctx, options) => {
    var defaultOmits = ["_id", "id", "__v", "createdAt", "password"]
    var omitFields = _.union(defaultOmits, options.readOnly || [])
    return _.omit(ctx.request.fields, omitFields)
}
const cntrlGenerator = ({schema, options = {}}, self) => {
    let ctrl = {
        // GET /models
        index: [
            body,
            (ctx, next) => {
                return schema
                    .find({})
                    .then((models) => {
                        ctx.body = models
                        return next();
                    })
                    .catch((err) => {
                        ctx.body = self.errHandler(err)
                        return next();
                    })
            }
        ],

        // GET /models/new
        new: [
            body,
            (ctx, next) => {
                return next();
            }
        ],

        // POST /models
        create: [
            body,
            (ctx, next) => {
                const newFields = filterReadOnlyFields(ctx, options);
                var instance = new schema(newFields);
                return instance.save()
                    .then((model) => {
                        ctx.body = model
                        return next();
                    })
                    .catch((err) => {
                        ctx.body = self.errHandler(err)
                        return next();
                    })
            }
        ],

        // PUT /models/:model
        update: [
            body,
            (ctx, next) => {
                return schema
                    .findById({_id: ctx.params[schema.modelName.toLowerCase()]})
                    .then((instance) => {
                        const newFields = filterReadOnlyFields(ctx, options);
                        instance = _.merge(instance, newFields);
                        // console.log(newFields)
                        return instance.save()
                            .then((model) => {
                                ctx.body = model
                                return next();
                            })
                            .catch((err) => {
                                ctx.body = self.errHandler(err)
                                return next();
                            });
                    })
                    .catch((err) => {
                        ctx.body = self.errHandler(err)
                        return next();
                    })
            }
        ],

        // GET /models/:model/edit
        edit: [
            body,
            (ctx, next) => {
                return next();
            }
        ],

        // GET /model/:model
        show: [
            body,
            (ctx, next) => {
                return schema
                    .findById({_id: ctx.params[schema.modelName.toLowerCase()]})
                    .then((model) => {
                        ctx.body = model
                        return next();
                    })
                    .catch((err) => {
                        ctx.body = self.errHandler(err)
                        return next();
                    })
            }
        ],

        // DELETE /models/:model
        remove: [
            body,
            (ctx, next) => {
                const id = ctx.params[schema.modelName.toLowerCase()]
                return schema
                    .remove({_id: id})
                    .then((model) => {
                        ctx.body = {deleted: true, id: id}
                        return next();
                    })
                    .catch((err) => {
                        ctx.body = self.errHandler(err)
                        return next();
                    })
            }
        ],
    };

    return ctrl;
};

function KoaRestful (options = {}) {
  if (!(this instanceof KoaRestful)) {
    return new KoaRestful(options)
  }

  this.errHandler = options.errorHandler || ((err) => err);

  this.api = new Router(options.router || {});
  _.forEach(options.models, (model) => {
    const ctrl = cntrlGenerator(model, this);
    const modelName = model.schema.modelName.toLowerCase();
    this.api.resource(modelName, ctrl, model.options || {});
  })

//   console.log(this.api.getResources())
}

KoaRestful.prototype.getApi = () => {
    return this.api;
}

module.exports = KoaRestful