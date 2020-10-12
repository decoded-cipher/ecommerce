var db = require('../config/connection')
var collection = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
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
    },

    getProductDetails: (prodId) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id : ObjectId(prodId)}).then((product) => {
                resolve(product)
            })
        })
    },

    updateProduct: (prodId, prodDetails) => {
        return new Promise ((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id: ObjectId(prodId)}, {
                $set: {
                    Name: prodDetails.Name,
                    Category: prodDetails.Category,
                    Description: prodDetails.Description,
                    Price: prodDetails.Price
                }
            }).then((response) => {
                resolve()
            })
        })
    }
}