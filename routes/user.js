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
  var products = await userHelpers.getCartProducts(req.session.user._id)

  var totalValue = 0
  if (products.length > 0) {
    totalValue = await userHelpers.getTotalAmount(req.session.user._id)
  }
  console.log(products);
  res.render('user/cart', {products, user: req.session.user, totalValue})
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
  userHelpers.changeProductQuantity(req.body).then(async(response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})

router.post('/remove-cart-product', (req, res) => {
  userHelpers.removeCartProduct(req.body)
    res.redirect('/cart')
})

router.get('/place-order', verifyLogin, async(req, res) => {
  var total = await userHelpers.getTotalAmount(req.session.user._id)
  // console.log(total);
  res.render('user/place-order', {total, user: req.session.user})
})

router.post('/place-order', async(req, res) => {
  var products = await userHelpers.getCartProductList(req.body.userId)
  var totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
    // console.log(orderId);
    
    if (req.body['payment-method'] === 'COD'){
      res.json({ COD_success: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response)
      })
    }
    
  })
  // console.log(req.body);
})

router.get('/order-complete', verifyLogin, (req, res) => {
  // console.log(user);
  res.render('user/order-complete', {user: req.session.user})
})

router.get('/orders', verifyLogin, async(req, res) => {
  var orders = await userHelpers.getUserOrders(req.session.user._id)
  // console.log(orders);
  res.render('user/orders', {user: req.session.user, orders})
})

router.get('/view-order-products/:id', verifyLogin, async(req, res) => {
  // console.log(user);
  var products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', {user: req.session.user, products})
})

router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment Successfull");
      res.json({status : true})
    })
  }).catch((err) => {
    console.log(err);
    res.json({status : false, errMsg: 'Payment Failed'})
  })
})

module.exports = router;