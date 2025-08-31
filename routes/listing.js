const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isLoggedIn , isOwner, validatelisting} = require("../middleware.js");
const ExpressError = require("../utils/ExpressError");

const ListingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer ({ storage });



//index route and create route
router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(isLoggedIn,upload.single("listing[image]"), validatelisting, wrapAsync(ListingController.createListing)
);



// new route
router.get("/new" ,isLoggedIn, ListingController.renderNewForm);

//show route. delete and update route
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validatelisting, wrapAsync(ListingController.updateListing))
    .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.destroyListing)
  );

//edit route
router.get("/:id/edit" ,isLoggedIn,isOwner, wrapAsync(ListingController.renderEditForm));



module.exports = router;