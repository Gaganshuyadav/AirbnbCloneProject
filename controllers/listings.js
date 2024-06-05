const Listing = require("../models/listing.js");
//-----------------------
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});
//-----------------------


module.exports.index = async (req,res)=>{
    const allListings = await Listing.find() ;
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res) => {

    // console.log("information:- ",req.user);

    // if(!req.isAuthenticated()){                                           //use isLoggedIn in middleware(userauth).js
    //     req.flash("success","you must be logged in to create listing!");   
    //     res.redirect("/login");
    // }
    
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res) =>{
    const {id}=req.params;
    const listing = await Listing.findById(id)
    .populate({ 
        path: "reviews", 
        populate : { 
            path: "author"
        } 
        })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    } 
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req,res,next) =>{
    try{

    //add listing information
    const newlisting = new Listing(req.body.listing);

    //store filename 
    const url = req.file.url;
    const filename = req.file.public_id;
    //console.log(url,"and ",filename);
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename};

    //store geocoding coordinates
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 1
      })
        .send()

    console.log(response.body.features[0].geometry);

    newlisting.geometry = response.body.features[0].geometry;

    //save listing in database
    let savedListing = await newlisting.save();
    console.log(savedListing);
    
    req.flash("success","New Listing Created!!");                //flash message
    res.redirect("/listings");
    }
    catch(err){
        next(err);
    }
}

module.exports.renderEditForm = async (req,res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    
    //to resize the image to show it in edit form
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_125,w_175");

    // if(!listing){
    //     req.flash("error","Listing you requested for does not exist!");
    //     return res.redirect("/listings");
    // }
    res.render("listings/edit.ejs",{listing , originalImageUrl});
    }

    

module.exports.updateListing = async (req,res) =>{

    // if(!req.body.listing){
    //     throw new ExpressError(500, "Send valid data for listing");
    // }

    const {id} = req.params;
    const listing = await Listing.findById(id);

    // if(! listing.owner.equals(res.locals.currUser._id)){
    //     req.flash("error", "You are not the owner of this listing");
    //     return res.redirect(`/listings/${id}`);                      //return required to not execute lower code
    // }
    

    //we have to update the database by req.body.listing
    await Listing.findByIdAndUpdate(id, req.body.listing, {runValidators:true,new:true} );

    //we have to update file by using file request(req.file)
    if(typeof(req.file) !="undefined"){
        let url = req.file.url;
        let filename = req.file.public_id;
        listing.image = { url, filename} ;
        // update listing in  database 
        await listing.save();
    }

    //we have to update the stored geocoding coordinates and change the mapped location
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location ,
        limit: 1
      })
        .send()

    console.log(response.body.features[0].geometry);
    listing.geometry = response.body.features[0].geometry; 
    // update listing in  database 
    await listing.save();

    //flash message in the redirected page
    req.flash("success","Listing Updated!!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res) =>{
    const {id} = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!!");
    res.redirect("/listings");

}

module.exports.searchListing = async(req,res) =>{
    const {search} = req.body;
    
    //search by location
    let allListings = await Listing.find({location: {$regex: `(.*)${search}(.*)`,$options: "i" }});
    //search by country
    if(allListings.length<1){
        allListings = await Listing.find({country: {$regex: `(.*)${search}(.*)`,$options: "i" }});
    }
    //search by title
    if(allListings.length<1){
        allListings = await Listing.find({title: {$regex: `(.*)${search}(.*)`,$options: "i" }});
    }
    
    res.render("listings/index.ejs", {allListings});

}

module.exports.searchListingByCategory = async(req,res) => {
   const {name} = req.params;
   const allListings = await Listing.find({category:`${name}`});
   res.render("listings/index.ejs", {allListings});
}


