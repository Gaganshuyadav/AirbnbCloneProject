const User = require("../models/user.js");

module.exports.renderSignupForm = async (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.signup = async (req,res) =>{
    try{
    let { username ,email, password} = req.body;
    const newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    req.login(registeredUser,(err) => {                          //automatically login after Signup
        if(err){
            return next(err);
        } 
        req.flash("success","Welcome to Wanderlust!");
        res.redirect("/listings");
    });
   
}
catch(err){
    req.flash("error",err.message);
    // console.log(err);
    res.redirect("/signup");
}
};


module.exports.renderLoginForm = (req,res)=>{
    res.render("./users/login.ejs");
};

module.exports.login = async(req,res) =>{
    req.flash("success","Welcome back to Wanderlust!");
    // console.log("req.session :- ", req.session.redirectUrl);
    let redirectUrl = res.locals.redirectUrl || "listings";
    console.log(redirectUrl);
    res.redirect(redirectUrl);
};

module.exports.logout =  (req,res)=>{
    req.logout((err) => {
        if(err){
            return next(err);
        }
    })
    req.flash("success","you are logged out!");
    res.redirect("/listings");
}

