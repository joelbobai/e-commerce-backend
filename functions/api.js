require("./src/config/db/mongodb");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");
const cors = require("cors");
const routes = require("./src/routes/index");

// Init Express App
const app = express();

app.use(cookieParser());

// Parse JSON Date
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

//middleware
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//app.use("/api/v1", routes);
app.use("/.netlify/functions/api", routes);
//module.exports = app;
module.exports.handler = serverless(app);
