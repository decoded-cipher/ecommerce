const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

var verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', async (req, res, next) => {
  var user = req.session.user
  console.log(user);
  var cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    // console.log(products);
    res.render('user/view-products', { products, user, cartCount })
  })
});

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  userHelpers.doSignUp(req.body).then((response) => {
    console.log(response);
    req.session.loggedInlogg = true
    req.session.user = response
    res.redirect('/')
  })
})

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', {"LoginErr" : req.session.loginErr})
    req.session.loginErr = false
  }
})

router.post('/login', (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      
      req.session.loggedIn = true
      req.session.user = response.user

      res.redirect('/')
    } else {
      req.session.loginErr = true
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, async(req, res) => {
  var products =await userHelpers.getCartProducts(req.session.user._id)
  console.log(products);
  res.render('user/cart', {products, user: req.session.user})
})

router.get('/add-to-cart/:id', (req, res) => {
  console.log("API Call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    // res.redirect('/')
    res.json({ status: true })
  })
})

router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    res.json(response)
  })
})

module.exports = router;