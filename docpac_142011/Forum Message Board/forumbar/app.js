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
      secure: true,
      httpOnly: true,
      sameSite: true
   },
  })
);

//Routes
app.get('/', (req, res) => {
  res.locals.title = "Home Page";
  res.status(200).render('index');
});

app.get('/register', (req, res) => {
  res.locals.title = "Register";
  res.locals.error = false
  res.status(200).render('register');
});

app.post('/register', (req, res) => {
  let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const query = querystring.parse(body);

        res.locals.title = "Register Account"
        if (query.name.trim() && query.passW.trim() && query.passW2.trim()){

            if(query.passW.trim() == query.passW2.trim()){

                if(query.name.length >= 3 && query.name.length <= 20){
                  
                  if(accessDb.uGetUname(query.name.trim())){
                    res.locals.error = "Username Taken"
                    res.status(200).render('register');
                  } else {
                    let crypted_pass = 0
                    bcrypt.hash(query.passW.trim(), 10, function (err, hash) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        crypted_pass = hash
                      });

                      accessDb.uAdd(query.name.trim(), crypted_pass)
                      res.redirect('/')
                  }

                } else {
                    res.locals.error = "Improper Username Length"
                    res.status(200).render('register');
                }

            } else {
                res.locals.error = "Passwords Don't Match, Please Resubmit"
                res.status(200).render('register');
            }

        } else {
            res.locals.error = "Missing Data, Make Sure A Boxes Are Filled"
            res.status(200).render('register');
        }
    })
});

app.get('/login', (req, res) => {
  if (req.session.userId){
    res.redirect('/')
  } else {
    res.locals.title = "Log In";
    res.locals.error = false
    res.status(200).render('login');
  }
});

app.post('/login', (req, res) => {
  res.locals.title = "Log In";
  req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        res.locals.title = "Log In"
        if(query.name.trim() && query.passW.trim()){
            if(accessDb.uGetUname(query.name.trim())){

              let passGood = false
                bcrypt.compare(query.passW.trim(), accessDb.uGetUname(query.name.trim()).password_hash, function (err, result) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  if (result) {
                    passGood = true
                  } else {}
                });

                if (passGood){
                    let account = accessDb.uGetUname(query.name.trim())
                    req.session.userId = account.id
                    res.redirect("/")
                } else {
                  res.locals.error = 'Incorrect Password'
                  res.status(200).render('login');
                }

            } else {
                res.locals.error = 'No Account With Username Exists'
                res.status(200).render('login');
            }

        } else {
            res.locals.error = 'Must Fill All Boxes'
            res.status(200).render('login');
        }

    });
});


app.post('/logout', (req, res) => {

})



var server = app.listen(200, () => {
  console.log(`Server running at http://localhost:200/`);
});