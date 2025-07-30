const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const chalk = require("chalk");
const PORT = process.env.portr || 3000;
const path = require("path");
const nodemailer = require("nodemailer");
const session = require("express-session");
require("dotenv").config();
const MONGO_URI = process.env.mongourl;

// Database connection
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
});
const Email = mongoose.model("Email", emailSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/style", express.static(path.join(__dirname, "views/style")));
app.use(
  session({
    secret: "VERYSECRETKEY",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home", { title: "Newsletter Subscription" });
});



  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.send("Please provide an email address.");

  try {
    const existing = await Email.findOne({ email });
    if (existing) return res.send("This email is already subscribed.");

    await Email.create({ email });
        await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SDG Newsletter",
      text: "Thanks for subscribing to the SDG newsletter!",
    });
    res.render("success", { message: "Thank you for subscribing!" });
  } catch (error) {
    console.error(error);
    res.send("An error occurred. Please try again.");
  }
});
app.get("/subscribers", async (req, res) => {
  try {
    const subscribers = await Email.find({});
    res.render("subscribers", { subscribers, title: "Subscribers List" });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching subscribers.");
  }
});
app.get("/unsubscribe/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const result = await Email.deleteOne({ email });
    if (result.deletedCount === 0) {
      return res.send("Email not found or already unsubscribed.");
    }
    res.render("success", {
      message: "You have been unsubscribed successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while unsubscribing.");
  }
});
app.get("/unsubscribe", (req, res) => {
  res.render("unsubscribe", { title: "Unsubscribe" });
});


app.get("/send", async (req, res) => {
  const adminKey = req.query.key;
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).send("Unauthorized access.");
  }

  const emails = await Email.find();

  for (let entry of emails) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: entry.email,
      subject: "SDG Newsletter",
      text: "Thanks for subscribing to the SDG newsletter!",
    });
  }

  res.send("Emails sent to all subscribers.");
});

app.listen(PORT, () => {
  console.clear();
  console.log(chalk`{yellow [MONGODB]} Connecting to MongoDB...`);
  console.log(chalk`{green [APP]} Server is running on port {green ${PORT}}`);
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log(chalk`{green [MONGODB]} Connected to MongoDB successfully!`);
    })
    .catch((err) => {
      console.error(chalk.red("Error connecting to MongoDB:"), err);
    });
});
