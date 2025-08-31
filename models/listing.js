const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        filename: String ,
        url: String 
    },
    country: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['rooms', 'mountains', 'iconic-cities', 'beaches', 'pools', 'camping', 'lakefront', 'farms', 'treehouse']
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    owner: {type: Schema.Types.ObjectId, ref: "User"},
    coordinates: {
    lat: Number,
    lng: Number
  }
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } })
    }
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;


