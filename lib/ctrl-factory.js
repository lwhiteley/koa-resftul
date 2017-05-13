const union = require('lodash/union');
const merge = require('lodash/merge');
const omit = require('lodash/omit');
const body = require('koa-better-body')()

const filterReadOnlyFields = (ctx, options) => {
    var defaultOmits = ["_id", "id", "__v", "createdAt", "password"]
    var omitFields = union(defaultOmits, options.readOnly || [])
    return omit(ctx.request.fields, omitFields)
};

const getIdFromReq = (ctx, schema) => {
    return ctx.params[schema.modelName.toLowerCase()]
};

const factory = ({schema, options = {}}, self) => {
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
                const id = getIdFromReq(ctx, schema);
                return schema
                    .findById({_id: id})
                    .then((instance) => {
                        const newFields = filterReadOnlyFields(ctx, options);
                        instance = merge(instance, newFields);
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
                const id = getIdFromReq(ctx, schema);
                return schema
                    .findById({_id: id})
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
                const id = getIdFromReq(ctx, schema);
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

module.exports = factory;