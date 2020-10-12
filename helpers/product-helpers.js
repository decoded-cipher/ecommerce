var db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
var objectId = require('mongodb').ObjectID

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
    },

    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id : ObjectId(prodId)}).then((response) => {
                // console.log(response);
                resolve(response)
            })
        })
    }
}