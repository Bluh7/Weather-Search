require("dotenv").config();
const apiKey = process.env.OPENWEATHERMAP_API_KEY;

const verifyApiKey = (req, res, next) => {
  if (!apiKey) {
    throw new Error(
      "No API key found. Please create a .env file in the root directory and add your API key as OPENWEATHERMAP_API_KEY"
    );
  } else {
    // Set the API key in the request object so that it can be accessed by other middlewares and routes.
    req.apiKey = apiKey;
    next();
  }
};

module.exports = verifyApiKey;
