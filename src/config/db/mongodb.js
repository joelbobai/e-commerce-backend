const mongoose = require("mongoose");

// .Env config
require("dotenv").config();

// url
const { MONGO_URL } = process.env;

const connectToDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Backend database running");
  } catch (error) {
    console.log(`${error} did not work`);
  }
};

connectToDB();
