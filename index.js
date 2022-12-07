const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const axios = require('axios')
const compression = require('compression')
const verifyApiKey = require('./middlewares/verifyApiKey')
const path = require('path')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(compression({ level: 9 })) //Compress all routes for faster loading

app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/search', (req, res) => {
  const bannedChars = ['/', '\\', '?', '%', '*', ':', '|', '"', '<', '>', '.', '&']
  const city = req.body.city
  // Check if city name contains any banned characters and if the city name is not empty
  if(city && !bannedChars.some(char => city.includes(char))){
    res.redirect(`/${city}`)
  }else{
    res.redirect('/')
  }
})

app.get('/:city', verifyApiKey, (req, res) => {
  const apiKey    = req.apiKey
  const cityParam = req.params.city
  axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityParam}&units=metric&appid=${apiKey}`).then((response) => {
    const status       = response.status
    const responseData = response.data
    const city         = responseData.name
    const temperature  = responseData.main.temp.toFixed(0)
    const feelsLike    = responseData.main.feels_like.toFixed(0)
    const description  = responseData.weather[0].description
    const iconCode     = responseData.weather[0].icon
    const iconUrl      = `https://openweathermap.org/img/wn/${iconCode}.png`
    res.render('weather', {
      status,
      city,
      temperature,
      feelsLike,
      description,
      iconUrl
    })
  }).catch((err) => {
    const status = err.response.status
    if(status == 401){
      throw new Error('Invalid API key. Please check your .env file and make sure you have added your API key as OPENWEATHERMAP_API_KEY')
    }else if(status == 404 || status == 400){
      res.render('weather', {
        status
      })
    }else{
      throw new Error(err)
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