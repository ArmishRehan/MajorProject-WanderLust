if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const DB_URL = process.env.ATLASDB_URI;

const ExpressError = require("./utils/ExpressError");
const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

let isConnected = false; // cache DB connection state

async function connectDB() {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(DB_URL);
        isConnected = db.connections[0].readyState;
        console.log("✅ Connected to database");
    } catch (err) {
        console.error("❌ DB connection failed", err);
        throw err;
    }
}

connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});
store.on("error", (e) => {
    console.log("Session Store Error", e);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// TEMP: Root route for testing if server works
app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "Delta-student"
    });
    let registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

// Listings
app.use("/listings", listingRouter);

// Reviews
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 handler
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
});

// middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/Error.ejs", { message });
});

module.exports = app;
