var db = require('../config/connection')
var collection = require('../config/collections')

module.exports = {
    addProduct : (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data)
            callback(data.ops[0]._id)
        })
    },

    getAllProducts: () => {
        return new Promise(async(resolve, reject) => {
            var products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    }
}