require("./config/db/mongodb");

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes/index");

// Init Express App
const app = express();

app.use(cookieParser());

// Parse JSON Date
app.use(express.json({ limit: "5mb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

//middleware
app.use(cors({ credentials: true, origin: "https://e-commerce-ui-lylm.onrender.com" }));

app.use("/api/v1", routes);

module.exports = app;
