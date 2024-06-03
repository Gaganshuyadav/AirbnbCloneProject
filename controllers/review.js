const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.createReview = async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await listing.save();         
    await newReview.save();
    req.flash("success","New Review Added!!");
    res.redirect(`/listings/${listing._id}`);
}


module.exports.destroyReview = async(req,res)=>{
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});           // Use Mongo $pull operator 
    req.flash("success","Review Deleted!!");
    res.redirect(`/listings/${id}`);
}