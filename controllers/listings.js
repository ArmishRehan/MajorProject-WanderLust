const Listing = require("../models/listing");

// Helper: convert address to coordinates
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "wanderlust-app/1.0 (your_email@example.com)" }
  });
  const data = await res.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  }
  return null;
}

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you are trying to access does not exist");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// CREATE
module.exports.createListing = async (req, res) => {
  try {
    const { title, description, location, country, price } = req.body.listing;
    const newListing = new Listing({ title, description, location, country, price });
    newListing.owner = req.user._id;

    // Image
    if (req.file) {
      newListing.image = { url: req.file.path, filename: req.file.filename };
    }

    // Coordinates
    const coords = await geocodeAddress(`${location}, ${country}`);
    if (coords) newListing.coordinates = coords;

    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error creating listing");
    res.redirect("/listings/new");
  }
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }
  const orignalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, orignalImageUrl });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, country, price } = req.body.listing;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Update fields
    listing.title = title;
    listing.description = description;
    listing.location = location;
    listing.country = country;
    listing.price = price;

    // Update coordinates
    const coords = await geocodeAddress(`${location}, ${country}`);
    if (coords) listing.coordinates = coords;

    // Update image if new file uploaded
    if (req.file) {
      listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating listing");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

// DELETE
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
