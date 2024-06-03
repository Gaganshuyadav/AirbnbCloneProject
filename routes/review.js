const express = require("express");
const router = express.Router({ mergeParams: true});


const asyncWrap = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");


const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isReviewAuthor} = require("../middleware(userauth).js");

const reviewController = require("../controllers/review.js");
//----------------------------------------------------------------------------------------------------------------------*/

//( Middleware )Create Validation Review Schema with joi
const validateReview = (req, res, next) =>{
    let {error} = reviewSchema.validate(req.body);
    //console.log(error);
    if(error){
         let errmsg = error.details[0].message;
        throw new ExpressError(400,errmsg)
    }
    next();
}
//----------------------------------------------------------------------------------------------------------------------*/

//createReview Route

router.post(
    "/",
    isLoggedIn,
    validateReview,
    asyncWrap(reviewController.createReview )
);

//destroyReview Route

router.delete(
    "/:reviewId", 
    isLoggedIn, 
    isReviewAuthor,
    asyncWrap( reviewController.destroyReview )
);

module.exports = router;














