const axios = require('axios')

const getCityState = (req, res, next) => {
  const city = req.params.city
  const apiKey = req.apiKey
  axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`).then((response) => {
    const responseData = response.data[0]
    const cityState = responseData.state
    req.cityState = cityState
    next()
  }).catch(() => {
    // if something goes wrong, just move on, the next promise will handle the error correctly
    next()
  })
}

module.exports = getCityState