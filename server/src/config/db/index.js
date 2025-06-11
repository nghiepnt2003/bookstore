const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/bookstore"
    );
    console.log("Connect successfully");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connect };
