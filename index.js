require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");
const compression = require("compression");
const verifyApiKey = require("./middlewares/verifyApiKey");
const httpHeaders = require("./middlewares/httpHeaders");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(compression({ level: 9 })); //Compress all routes for faster loading

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Set HTTP headers to prevent clickjacking and other security issues
app.use(helmet());

// Set a rate limiter to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.get("/", httpHeaders, (req, res) => {
  res.render("index");
});

app.post("/search", (req, res) => {
  const { city } = req.body;
  if (city && typeof city == "string") {
    res.redirect(`/Search/${city}`);
  } else {
    res.redirect("/");
  }
});

app.get("/Search/:city", httpHeaders, verifyApiKey, async (req, res) => {
  // Get the API key from the request object set by the verifyApiKey middleware.
  const { apiKey } = req;
  const cityParam = req.params.city.trim();

  // Get the state of the city.
  let cityState;
  try {
    // Make a request to the API and get the state of the city from the response.
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${cityParam}&limit=5&appid=${apiKey}`
    );
    const { data: responseData } = response;
    if (responseData[0]) {
      cityState = responseData[0].state;
    }
  } catch (err) {
    const { status } = err.response;
    if (status != 400 && status != 404) {
      console.log(err);
    }
  }

  // Get the weather data and render the weather page.
  try {
    // Make a request to the API and get the weather data from the response.
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityParam}&units=metric&appid=${apiKey}`
    );
    const { status, data: responseData } = response;
    const { name: city } = responseData;
    const temperature = responseData.main.temp.toFixed(0);
    const feelsLike = responseData.main.feels_like.toFixed(0);
    const { description, icon: iconCode } = responseData.weather[0];
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
    res.render("weather", {
      status,
      city,
      temperature,
      feelsLike,
      description,
      iconUrl,
      cityState,
    });
  } catch (err) {
    const { status } = err.response;
    if (status == 401) {
      throw new Error(
        "Invalid API key. Please check your .env file and make sure you have added your API key as OPENWEATHERMAP_API_KEY"
      );
    } else if (status == 404 || status == 400) {
      res.render("weather", {
        status,
      });
    } else {
      console.log(err);
    }
  }
});

// If the user tries to access a route that doesn't exist, redirect them to the home page.
app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`http://localhost:${port}`);
  }
});
