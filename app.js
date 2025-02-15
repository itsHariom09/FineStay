if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
};


const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate"); // it is use for template engine or making template/style.
// const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
// const {listingSchema, reviewSchema}=require("./schema.js");
// const Review = require("./models/review.js");
const sessions=require("express-session");
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User = require("./models/user.js");


const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");
const users=require("./routes/user.js");

const dbURL=process.env.ATLISTDB_URL;



main().then(() => { console.log("DB connected") })
.catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



const store=MongoStore.create({
    mongoUrl:dbURL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("SESSION STORE ERROR",err);
});

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    }
}




app.use(sessions(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});


// app.get("/demouser",async (req,res)=>{
//     let fakeUser=new User({email:"hariom@gmail.com",username:"Hariom"});
//     let registerUser=await User.register(fakeUser,"helloworld");
//     res.send(registerUser);
// });


// //Validatee Listings
// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map(el=>el.message).join(",");
//         throw new ExpressError(errMsg,400);
//     }else{
//         next();
//     }
// };

// //Validatee Reviews
// const validateReview=(req,res,next)=>{
//     let {error}=reviewSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map(el=>el.message).join(",");
//         throw new ExpressError(errMsg,400);
//     }else{
//         next();
//     }
// };

app.use("/listings",listings);

// //Index Route
// app.get("/listings", async (req, res) => {
//     const allListing = await Listing.find();
//     res.render("listings/index", { allListing });
// });


// //New Route
// app.get("/listings/new",(req,res)=>{
//     res.render("listings/new.ejs");
// })

// //Show Route
// app.get("/listings/:id",wrapAsync(async (req,res,next)=>{
//     let {id}=req.params;
//     const listing=await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs",{listing});
// }));

// //Create Route
// app.post("/listings",validateListing,wrapAsync( async (req, res,next) => {
//     // if(!req.body.listing) {throw new ExpressError("Invalid Listing Data",400)};
//     const newListing=new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
// }));


// //Edit Route
// app.get("/listings/:id/edit",wrapAsync(async (req,res,next)=>{
//     let {id}=req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs",{listing});
// }));


// //Update Route
// app.put("/listings/:id",validateListing,wrapAsync(async (req,res,next)=>{
//     // if(!req.body.listing) {throw new ExpressError("Invalid Listing Data",400)};
//     let {id}=req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// }));


// //Delete Route
// app.delete("/listings/:id",wrapAsync(async (req,res,next)=>{
//     let {id}=req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
// }));

// //Reviews
// //Post reviews
// app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res)=>{
//     let listing=await Listing.findById(req.params.id);
//     let newReview=new Review(req.body.review);

//     listing.reviews.push(newReview);
//     await newReview.save();
//     await listing.save();

//     res.redirect(`/listings/${listing._id}`);
// }));


// //Delete Reviews
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res)=>{
//     let {id,reviewId}=req.params;
//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));


app.use("/listings/:id/reviews",reviews);


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "by the beach",
//         price: 1000000,
//         location: "Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     res.send("Successful Testing");
// });


app.use("/",users);


app.all("*",(req,res,next)=>{
    next(new ExpressError("Page not found",404));
});

app.use((err,req,res,next)=>{
    let {statusCode=500,message="Something went wrong"}=err;
    // res.send("Something went wrong");
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

app.listen(8081, () => {
    console.log("server is running on port 8081");
});
