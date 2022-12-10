const contentPolicyAndXss = (req, res, next) => {
  // Set X-XSS-Protection to block rendering of page if a XSS attack is detected
  res.header("X-XSS-Protection", "1; mode=block");

  // Set Content-Security-Policy to only allow scripts from cdn.jsdelivr.net and images from openweathermap.org
  res.header(
    "Content-Security-Policy",
    "script-src-elem https://cdn.jsdelivr.net/;"
  );
  res.header("Content-Security-Policy", "img-src https://openweathermap.org/;");

  // Remove X-Powered-By header to prevent information disclosure about the server
  res.removeHeader("X-Powered-By")
  next();
};

module.exports = contentPolicyAndXss;
