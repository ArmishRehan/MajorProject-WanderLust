const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const Mongoose_url = 'mongodb://127.0.0.1:27017/Wanderlust';

main().then(() => {
    console.log("Connected to database");

}).catch((err) => {
    console.log(err);

});
async function main() {
    await mongoose.connect(Mongoose_url);
}

const initDb = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"689bbe751d57e497c0265ce9"}) );
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
    
};

initDb();