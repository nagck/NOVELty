// Requiring our models and passport as we've configured it
var db = require("../models");
var fetch = require('node-fetch');

const request = require('request');

require('dotenv').config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
  app.get('/', (req, res) => {
    // let book = 'book:The Dead Zone'
    // const url = `https://tastedive.com/api/similar?q=${book}&k=${process.env.MYAPIKEY_TD}`;
    // request(
    //   { url: url },
    //   (error, response, body) => {
    //     if (error || response.statusCode !== 200) {
    //       return res.status(500).json({ type: 'error', message: err.message });
    //     }
  
    //     res.json(JSON.parse(body));
    //   }
    // )

    // recommendationTasteDive('The Dead Zone', data => {
    //     if(!data) {
    //         res.status(500);
    //     }
    //     else {
    //         res.json(data)
    //     }
    // })
    recommendationNewYork('hardcover-fiction', data => {
        if(!data) {
            res.status(500);
        }
        else {
            res.json(data)
        }
    })
    
  });

  app.listen(PORT, () => {
    console.log("Weather App is listening on PORT:", PORT);
  });

const recommendationTasteDive = (title, cb) =>{
    let book = `book:${title}`;
    let apikey = process.env.MYAPIKEY_TD;
    const url = `https://tastedive.com/api/similar?q=${book}&k=${apikey}`;
    request(
        { 
            url: url 
        },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                console.error(error)
                cb(false);
            }
            cb(JSON.parse(body));
        }
    )
}

const recommendationNewYork = (genre, cb) =>{
    let apikey = process.env.MYAPIKEY_NY;
    let url = `https://api.nytimes.com/svc/books/v3/lists.json?list=${genre}&api-key=${apikey}`;
    fetch(url)  
        .then(response => response.json())  
        .then(data => { 
            console.log(data); 
            cb(data)
        })
        .catch(error => {
            cb(false)
        });
}


