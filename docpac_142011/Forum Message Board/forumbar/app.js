//Server Init
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const accessDb = require('./database.js');
const bcrypt = require('bcrypt');

//Session Set Up
const session = require("express-session");
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      httpOnly: true,
      sameSite: true
   },
  })
);

//Routes
app.use((req, res, next) => {
  if (req.session.userId){
    let user = accessDb.uGetId(req.session.userId)
    res.locals.username = user.username;
    next()
  }
})

app.get('/', (req, res) => {
  res.locals.title = "Home Page";
  res.status(200).render('index');
});

app.get('/register', (req, res) => {
  if (req.session.userId){
    res.redirect('/');
  } else {
    res.locals.title = "Register";
    res.locals.error = false
    res.status(200).render('register');
  }
});

app.post('/register', (req, res) => {
  res.locals.title = "Register Account"
  if (req.body.name.trim() && req.body.passW.trim() && req.body.passW2.trim()){

    if(req.body.passW.trim() == req.body.passW2.trim()){

      if(req.body.name.length >= 3 && req.body.name.length <= 20){
                  
        if(accessDb.uGetUname(req.body.name.trim())){
          res.locals.error = "Username Taken";
          res.status(200).render('register');
        } else {

          bcrypt.hash(req.body.passW.trim(), 10, function (err, hash) {
            if (err) {
              console.error(err);
              return;
            }
            if (hash){
              accessDb.uAdd(req.body.name.trim(), hash);
              let account = accessDb.uGetUname(req.body.name.trim());
              req.session.userId = account.id;
              res.redirect('/');
            }
          });

        }

      } else {
        res.locals.error = "Improper Username Length";
        res.status(200).render('register');
      }

    } else {
      res.locals.error = "Passwords Don't Match, Please Resubmit";
      res.status(200).render('register');
    }

  } else {
    res.locals.error = "Missing Data, Make Sure A Boxes Are Filled";
    res.status(200).render('register');
  }
    
});

app.get('/login', (req, res) => {
  console.log(req.session.userId);
  if (req.session.userId){
    res.redirect('/');
  } else {
    res.locals.title = "Log In";
    res.locals.error = false;
    res.status(200).render('login');
  }
});

app.post('/login', (req, res) => {
  res.locals.title = "Log In";
  if(req.body.name.trim() && req.body.passW.trim()){

    if(accessDb.uGetUname(req.body.name.trim())){

      let passGood = false
      bcrypt.compare(req.body.passW.trim(), accessDb.uGetUname(req.body.name.trim()).password_hash, function (err, result) {
        if (err) {
          console.error(err);
          return;
        }
        if (result) {
          let account = accessDb.uGetUname(req.body.name.trim());
          req.session.userId = account.id;
          console.log(req.session.userId);
          
          res.redirect("/");
        } else {
          res.locals.error = 'Incorrect Password';
          res.status(200).render('login');
        }

      });

    } else {
      res.locals.error = 'No Account With Username Exists';
      res.status(200).render('login');
    }

  } else {
    res.locals.error = 'Must Fill All Boxes';
    res.status(200).render('login');
  }
});

app.post('/logout', (req, res) => {
  if (req.session.userId){
    req.session.destroy();
  }
  res.redirect('/');
});

app.use((req, res, next) => {
  if (req.session.userId){
    next()
  } else {
    res.redirect('/login')
  }
})





var server = app.listen(200, () => {
  console.log(`Server running at http://localhost:200/`);
});