const mongoose = require("mongoose");
async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connect successfully");
  } catch (error) {
    console.log(error);
  }
}

module.exports = { connect };
