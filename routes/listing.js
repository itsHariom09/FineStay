const express = require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");
const multer = require('multer');
const {storage}=require("../cloudConfig.js");

const upload = multer({ storage });



router.route("/")
//Index Route
.get(wrapAsync(listingController.index))
//Create Route
.post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.create));


//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
//Show Route
.get(wrapAsync(listingController.show))
//Update Route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateRoute))
//Delete Route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteRoute));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editRoute));



module.exports=router;