var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');

  var products = [
    {
    name: "OnePlus Nord 5G",
    category: "Mobile",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    imageURL: "https://images-na.ssl-images-amazon.com/images/I/719CgfLcqNL._SL1500_.jpg"
  },
  {
    name: "OnePlus 8 Pro",
    category: "Mobile",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    imageURL: "https://images-na.ssl-images-amazon.com/images/I/61n6Ovq6EdL._SL1500_.jpg"
  },
  {
    name: "OnePlus 7T",
    category: "Mobile",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    imageURL: "https://images-na.ssl-images-amazon.com/images/I/71ncRs6HzyL._SL1500_.jpg"
  },
  {
    name: "OnePlus 8",
    category: "Mobile",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    imageURL: "https://images-na.ssl-images-amazon.com/images/I/61qGR60Ak9L._SL1500_.jpg"
  },
]

  res.render('admin/view-products', {admin:true, products})
});

router.get('/add-product', (req, res) => {
  res.render('admin/add-product')
});

router.post('/add-product', (req, res) => {
  console.log(req.body)
  console.log(req.files.Image)
});

module.exports = router;
