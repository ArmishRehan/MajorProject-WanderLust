const Joi = require('joi');

module.exports.listingSchema = Joi.object({

    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.string().required().min(0),
        country: Joi.string().required(),
        location: Joi.string().required(),
        category: Joi.string().required().valid('rooms', 'mountains', 'iconic-cities', 'beaches', 'pools', 'camping', 'lakefront', 'farms', 'treehouse' , 'others'),
        image: Joi.object({
            url: Joi.string().allow(''),
            filename: Joi.string().allow('')
        })
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});