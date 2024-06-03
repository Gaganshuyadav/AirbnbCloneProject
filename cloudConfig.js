const cloudinary = require("cloudinary").v2;
const  CloudinaryStorage  = require("cloudinary-multer");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});




const storage = CloudinaryStorage({
    cloudinary: cloudinary,
  });


module.exports = {
    cloudinary,
    storage,
}
