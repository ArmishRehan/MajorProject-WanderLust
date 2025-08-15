const serverless = require("serverless-http");
const app = require("../app"); // goes one level up to import your app.js

module.exports = serverless(app);
