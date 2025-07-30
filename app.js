const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const chalk = require("chalk");
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb+srv://Adham:K2pXYL82vrJsmqk4@cluster0.94gew.mongodb.net/newsletter";

app.listen(PORT, () => {
console.clear()
  console.log(chalk`{yellow [MONGODB]} Connecting to MongoDB...`);
    console.log(
    chalk`{green [APP]} Server is running on port {green ${PORT}}`
  )
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(chalk`{green [MONGODB]} Connected to MongoDB successfully!`);
    
    })
    .catch((err) => {
      console.error(chalk.red("Error connecting to MongoDB:"), err);
    });
});


