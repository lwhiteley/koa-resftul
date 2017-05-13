const union = require('lodash/union');
const merge = require('lodash/merge');
const omit = require('lodash/omit');
const body = require('koa-better-body')()

const filterReadOnlyFields = (ctx, options, self) => {
    var defaultOmits = self.options.defaultReadOnlyFields
    var omitFields = union(
        defaultOmits, 
        self.options.readOnlyFields || [], 
        options.readOnly || [])
    return omit(ctx.request.fields, omitFields)
};

const getHiddenFields = (ctx, options, self) => {
    var defaultOmits = self.options.defaultHiddenFields
    var omitFields = union(
        defaultOmits, 
        self.options.hiddenFields || [], 
        options.hidden || [])
    return omitFields
};

const filterHiddenFields = (ctx, options, self) => {
    var omitFields = getHiddenFields(ctx, options, self)
    return omit(ctx.toObject(), omitFields)
};

const getSelectForHiddenFields = (ctx, options, self) => {
    var omitFields = getHiddenFields(ctx, options, self)
    omitFields.forEach((field, i) => {
        omitFields[i] = `-${field}`
    })
    return omitFields
};


const getIdFromReq = (ctx, schema) => {
    return ctx.params[schema.modelName.toLowerCase()]
};

const getFilterParam = (ctx) => {
    var filter = {};
    try {
        filter = JSON.parse(ctx.query.filter);
    }catch(e){
        console.warn('could not JSON.parse filter:', ctx.query.filter)
    }
    return filter
};

const factory = ({schema, options = {}}, self) => {
    let ctrl = {
        // GET /models
        index: [
            body,
            (ctx, next) => {
                const filter = getFilterParam(ctx)
                return schema
                    .find(filter)
                    .select(getSelectForHiddenFields(ctx, options, self))
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
        // new: [
        //     body,
        //     (ctx, next) => {
        //         return next();
        //     }
        // ],

        // POST /models
        create: [
            body,
            (ctx, next) => {
                const newFields = filterReadOnlyFields(ctx, options, self);
                var instance = new schema(newFields);
                return instance.save()
                    .then((model) => {
                        ctx.body = filterHiddenFields(model, options, self)
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
                        const newFields = filterReadOnlyFields(ctx, options, self);
                        instance = merge(instance, newFields);
                        // console.log(newFields)
                        return instance.save()
                            .then((model) => {
                                ctx.body = filterHiddenFields(model, options, self)
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
        // edit: [
        //     body,
        //     (ctx, next) => {
        //         return next();
        //     }
        // ],

        // GET /model/:model
        show: [
            body,
            (ctx, next) => {
                const id = getIdFromReq(ctx, schema);
                return schema
                    .findById({_id: id})
                    .then((model) => {
                        ctx.body = filterHiddenFields(model, options, self)
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