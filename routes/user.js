var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

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
  
  res.render('index', { products });
});

module.exports = router;
