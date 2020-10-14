var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
var objectId = require('mongodb').ObjectID

module.exports = {
    doSignUp: (userData) => {
        return new Promise(async(resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
            })
        })
    },

    doLogin: (userData) => {
        return new Promise(async(resolve, reject) => {
            var loginStatus = false
            var response = {}
            var user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email : userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if(status) {
                        console.log("Login Success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("Login Failed");
                        resolve({status : false})
                    }
                })
            } else {
                console.log("Login Failed : User doesnot exist");
                resolve({status : false})
            }
        })
    },

    addToCart: (prodId, userId) => {
        var prodObj = {
            item : objectId(prodId),
            quantity : 1
        }
        return new Promise(async(resolve, reject) => {
            var userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(userId)})
            if (userCart) {

                var prodExist = userCart.products.findIndex(product => product.item == prodId)
                console.log(prodExist);

                if(prodExist !=-1) {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'products.item' : objectId(prodId)},
                    {
                        $inc: { 'products.$.quantity' : 1 }
                    }).then(() => {
                        resolve()
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user: ObjectId(userId)}, {
                        $push: {products : prodObj}
                    }).then((response) => {
                        resolve()
                    })
                }

            } else {
                var cartObj = {
                    user : ObjectId(userId),
                    products : [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },

    getCartProducts: (userId) => {
        return new Promise(async(resolve, reject) => {
            var cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product' 
                    }
                }

                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         let :{prodList: '$products'},
                //         pipeline: [
                //             {
                //                 $match: {
                //                     $expr: {
                //                         $in: ['$_id', "$$prodList"]
                //                     } 
                //                 }
                //             }
                //         ],
                //         as: 'cartItems'
                //     }
                // }

            ]).toArray()
            // resolve(cartItems)
            // console.log(cartItems[0].products);
            resolve(cartItems)
        })
    },

    getCartCount: (userId) => {
        return new Promise (async(resolve, reject) => {
            var count = 0
            var cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    }
}