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
        return new Promise(async(resolve, reject) => {
            var userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: ObjectId(userId)})
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user: ObjectId(userId)}, {
                    $push: {products : objectId(prodId)}
                }).then((response) => {
                    resolve()
                })
            } else {
                var cartObj = {
                    user : ObjectId(userId),
                    products : [ObjectId(prodId)]
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
                    $match: {user: objectId(userId)}
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let :{prodList: '$products'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', "$$prodList"]
                                    } 
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }
            ]).toArray()
            // resolve(cartItems)
            resolve(cartItems[0].cartItems)
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