const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const axios = require('axios')
const icons = require('./icons/icons.json')
const compression = require('compression')
const verifyApiKey = require('./middlewares/verifyApiKey')

app.set("view engine", "ejs")
app.use(express.static("public"))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(compression()) //Compress all routes for faster loading

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/search', (req, res) => {
  const city = req.body.city
  if(city.length > 0 && city != '/'){
    res.redirect(`/${city}`)
  }else{
    res.redirect('/')
  }
})

app.get('/:city', verifyApiKey, (req, res) => {
  const apiKey    = req.apiKey
  const cityParam = req.params.city
  axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cityParam}&units=metric&appid=${apiKey}`).then((response) => {
    const status       = response.status
    const responseData = response.data
    const city         = responseData.name
    const temperature  = responseData.main.temp.toFixed(0)
    const feelsLike    = responseData.main.feels_like.toFixed(0)
    const description  = responseData.weather[0].description
    const iconCode     = responseData.weather[0].icon
    const icon         = icons[iconCode]
    res.render('weather', {
      status,
      city,
      temperature,
      feelsLike,
      description,
      icon
    })
  }).catch((err) => {
    const status = err.response.status
    if(status == 401){
      throw new Error('Invalid API key. Please check your .env file and make sure you have added your API key as OPENWEATHERMAP_API_KEY')
    }else if(status == 404){
      res.render('weather', {
        status
      })
    }else{
      throw new Error('Something went wrong. Please try again later.')
    }
  })
})

app.get('*', (req, res) => {
  res.redirect('/')
})

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }else{
    console.log(`http://localhost:3000`)
  }
})