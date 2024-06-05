if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
/*----------------------------------------------------------------------------------------------------------------------*/
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

/*----------------------------------------------------------------------------------------------------------------------*/

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dburl = process.env.ATLASDB_URL ;

main()
    .then(res => {
        console.log("Connected to  DB");
    })
    .catch( err=>{
        console.log(err);
    })

async function main() {
    await mongoose.connect(dburl);
}

/*----------------------------------------------------------------------------------------------------------------------*/
const path = require("path");
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
/*----------------------------------------------------------------------------------------------------------------------*/
app.use(express.urlencoded({extended:true}));
/*----------------------------------------------------------------------------------------------------------------------*/
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
/*----------------------------------------------------------------------------------------------------------------------*/
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
/*----------------------------------------------------------------------------------------------------------------------*/
app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
/*----------------------------------------------------------------------------------------------------------------------*/
const asyncWrap = require("./utils/asyncWrap.js");
const ExpressError = require("./utils/ExpressError.js");
/*----------------------------------------------------------------------------------------------------------------------*/
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
/*----------------------------------------------------------------------------------------------------------------------*/
const cookieParser = require("cookie-parser");
app.use(cookieParser("secretcode"));
/*----------------------------------------------------------------------------------------------------------------------*/
const session = require("express-session");
const MongoStore = require("connect-mongo");  //use this to store session information in mongo atlas instead of local storage in express-session
const flash = require("connect-flash");

//--to store mongoatlas session
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret: process.env.SECRET           //When working with sensitive session data it is recommended to use encryption
    },
    touchAfter: 24*3600,                      //Interval (in seconds) between session updates.
})

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
})
//--

const sessionOptions = {
    store,                                     //or write store:store
    secret: process.env.SECRET ,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

/*----------------------------------------------------------------------------------------------------------------------*/
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) =>{
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;                      //req.user have the session information of  the user(id ,username and email)
    next();
})
// app.get("/demouser", async (req,res) =>{
//     let fakeUser = new User({
//         email: "student2@gmail.com",
//         username: "student2"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld2");
//     console.log(registeredUser);
//     res.send(registeredUser);
// })

//----------------------------------------------------------------------------------------------------------------------*/
app.listen(8080, () => {
    console.log("server is listening to port 8080");
})

//----------------------------------------------------------------------------------------------------------------------*/

//--------(listings)---------//

app.use("/listings", listingRouter);

//----------------------------------------------------------------------------------------------------------------------*/

//--------(Reviews)---------//

app.use("/listings/:id/reviews", reviewRouter);

//--------(Users)---------//

app.use("/", userRouter);

//----------------------------------------------------------------------------------------------------------------------*/

app.all("/*", (req, res, next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

//Middlewares
app.use(( err, req, res, next) =>{
    let {statusCode=500 , message="Something went wrong!"}=err;
    // res.status(statusCode).send(`<h1>${message}</h1>`);           //render new page with StatusCode instead of showing message
    res.status(statusCode).render("error.ejs", {err,statusCode});
})





