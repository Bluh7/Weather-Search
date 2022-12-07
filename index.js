const express = require('express')
const app = express()
const bodyParser = require("body-parser")
const axios = require('axios')
const compression = require('compression')
const verifyApiKey = require('./middlewares/verifyApiKey')
const getCityState = require('./middlewares/getCityState')
const helmet = require('helmet')
const path = require('path')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(compression({ level: 9 })) //Compress all routes for faster loading

app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))

// Set HTTP headers to prevent clickjacking and other security issues
app.use(helmet())

app.get('/', (req, res) => {
  res.header('X-XSS-Protection', '1; mode=block')
  res.render('index')
})

app.post('/search', (req, res) => {
  res.header('X-XSS-Protection', '1; mode=block')
  const city = req.body.city
  // Get the current URL excluding the actual path. This can prevent the user from be redirected to a malicious site
  const currentUrl = `${req.protocol}://${req.get('host')}`
  res.redirect(`${currentUrl}/${city}`)
  res.redirect('/')
})

app.get('/:city', verifyApiKey, getCityState, async (req, res) => {
  // Set Content-Security-Policy header to allow images from openweathermap.org
  res.header('Content-Security-Policy', 'img-src https://openweathermap.org/;')
  res.header('X-XSS-Protection', '1; mode=block')
  const apiKey       = req.apiKey
  const cityParam    = req.params.city.trim()
  const cityState    = await req.cityState
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
      iconUrl,
      cityState
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
  res.header('X-XSS-Protection', '1; mode=block')
  res.redirect('/')
})

app.listen(3000, (err) => {
  if(err){
    console.log(err)
  }else{
    console.log(`http://localhost:3000`)
  }
})