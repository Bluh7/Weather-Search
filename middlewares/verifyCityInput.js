const verifyCityInput = (req, res, next) => {
  const city = req.body.city;
  const bannedChars = [
    "<",
    ">",
    "(",
    ")",
    "{",
    "}",
    "[",
    "]",
    "=",
    "+",
    "-",
    "*",
    "/",
    "\\",
    "|",
    "&",
    "^",
    "%",
    "$",
    "#",
    "@",
    "!",
    "?",
    "~",
    "`",
    '"',
    "'",
    ";",
    ":",
    ",",
    ".",
  ];
  // Check if city is a string and doesn't contain any banned characters
  if (
    city &&
    typeof city == "string" &&
    !bannedChars.some((char) => city.includes(char))
  ) {
    req.city = city;
    next();
  } else {
    res.redirect("/");
  }
};

module.exports = verifyCityInput;
