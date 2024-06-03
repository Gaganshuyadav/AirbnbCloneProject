const express = require("express");
const router = express.Router({mergeParams: true}); 

const asyncWrap = require("../utils/asyncWrap.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");

const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner} = require("../middleware(userauth).js");

const listingController = require("../controllers/listings.js");

/*--------------------------//Upload File(multer)--------------------------------------------------------------------------------------------------------------------*/
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage: storage });
/*----------------------------------------------------------------------------------------------------------------------*/

//( Middleware ) Create Validation Listing Schema with joi
const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    // console.log(error);
    if(error){
         let errmsg = error.details[0].message;
        throw new ExpressError(400, errmsg);
    }
    next();
}
//----------------------------------------------------------------------------------------------------------------------*/


router
    .route("/")
    //Index Route
    .get( asyncWrap( listingController.index )
    )
    //CreateListing Route
    .post( 
         isLoggedIn,
         upload.single("listing[image]") , 
         validateListing,
        asyncWrap( listingController.createListing )
    );

//NewForm Route
router.get(
    "/new", 
    isLoggedIn ,
    asyncWrap( listingController.renderNewForm )
);

//ShowListing Route
router.get(
    "/:id", 
    asyncWrap ( listingController.showListing )
);


//EditForm Route
router.get(
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    asyncWrap ( listingController.renderEditForm )
);

//UpdateListing Route
router.put(
    "/:id", 
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"),
    validateListing, 
    asyncWrap( listingController.updateListing )
);

//destroyListing Route
router.delete(
    "/:id", 
    isLoggedIn, 
    isOwner, 
    asyncWrap( listingController.destroyListing )
);

module.exports = router;













