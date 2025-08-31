const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async(req, res) => {
    let id = req.params.id.trim();
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save(); // Save review first
    listing.reviews.push(newReview._id); // Push only the ObjectId
    await listing.save(); // Save listing after updating reviews array
      req.flash("success", "New Review Created");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async(req,res)=>{
    let {id, reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
      req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
};