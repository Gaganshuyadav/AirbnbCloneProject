const mongoose = require("mongoose");
const {Schema} = mongoose;
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }, 
    description: String ,
    image: {
        url: {
        type: String,
        //  set: (v) =>  v === "" ?  "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60" : v ,
        //  default:  "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",                                                      
        },
        filename: String,
    }, 
    price: { 
        type: Number,
        default: 0,
    },
    location: String,
    country: String,
    reviews: [
     {
        type: Schema.Types.ObjectId,
        ref: "Review",
      }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    category:{
      type:String,
      enum: ["Trending","Rooms","Iconic Cities","Mountains","Castles","Camping","Farms","Amazing Pools","Skiing","Beach","Arctic"],
      required: true
    }
})


//delete all reviews of user with its data
listingSchema.post("findOneAndDelete", async (listing) =>{
    if(listing.reviews.length){
        await Review.deleteMany({_id: {$in: listing.reviews }});
    }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing; 





