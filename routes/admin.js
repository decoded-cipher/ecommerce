const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();

var productHelper = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');

  productHelpers.getAllProducts().then((products) => {
    // console.log(products);
    res.render('admin/view-products', {admin:true, products})
  })
});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product', {admin:true})
});

router.post('/add-product', (req, res) => {
  // console.log(req.body)
  // console.log(req.files.Image)

  productHelpers.addProduct(req.body, (id) => {
    var image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render('admin/add-product')
      } else {
        console.log(err);
      }
    })
  })
})

router.get('/delete-product/:id', (req, res) => {
  var proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async(req, res) => {
  var product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', {admin:true, product})
})

router.post('/edit-product/:id', (req, res) => {
  var id = req.params.id
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      var image = req.files.Image
      image.mv('./public/product-images/' + id + '.jpg', (err) => {
        // if (!err) {
        //   res.render('admin/add-product')
        // } else {
        //   console.log(err);
        // }
      })
    }
  })
})

router.get('/users', (req, res) => {
  userHelpers.getUserList().then((users) => {
    // console.log(users);
    res.render('admin/view-users', {admin:true, users})
  })
})

module.exports = router;
