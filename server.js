// Requiring necessary npm packages
var express = require("express");
var session = require("express-session");
// Requiring passport as we've configured it
var passport = require("./config/passport");
var exphbs = require("express-handlebars");

// Setting up port and requiring models for syncing
var PORT = process.env.PORT || 8080;
var db = require("./models");

require('dotenv').config();

// Creating express app and configuring middleware needed for authentication
var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


app.use(session({ secret: "keyboard cat", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Handlebars
app.engine("handlebars",exphbs({
  layoutsDir: __dirname + '/views/layouts',
  defaultLayout: 'main',
  partialsDir : __dirname+'/views/partials',
}));
app.set("view engine", "handlebars");


// Routes
require("./routes/api-routes")(app);
require("./routes/html-routes")(app);
// Requiring our routes

let syncOptions = { force: false };

// Syncing our database and logging a message to the user upon success
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  });
});
