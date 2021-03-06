var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')

const { ObjectId } = require('mongodb')
const { response } = require('express')

var objectId = require('mongodb').ObjectID
require('dotenv').config()
var Razorpay = require('razorpay')
const { resolve } = require('path')

var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

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
                    .updateOne({
                        user : objectId(userId),
                        'products.item' : objectId(prodId)
                    },
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
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
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
    },

    changeProductQuantity: (details) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        // console.log(cartId, prodId);

        return new Promise ((resolve, reject) => {
            if(details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id: objectId(details.cart)},
                    {
                        $pull: {products: {item: objectId(details.product)} }
                    }
                ).then((response) => {
                    resolve({removeProduct: true})
                })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne( { _id : objectId(details.cart) , 'products.item' : objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity' : details.count }
                    }
                ).then((response) => {
                    resolve({status: true})
                })
            }
        })
    },

    removeCartProduct: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id: objectId(details.cart)},
                {
                    $pull: {products: {item: objectId(details.product)} }
                }
            ).then(resolve())
        })
    },

    getTotalAmount: (userId) => {
            return new Promise(async(resolve, reject) => {
                var total = await db.get().collection(collection.CART_COLLECTION).aggregate([
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
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity' , '$product.Price'] } }
                        }
                    }
    
                ]).toArray()
                console.log(total[0].total);
                resolve(total[0].total)
            })
        },

        placeOrder: (order, products, total) => {
            return new Promise((resolve, reject) => {
                console.log(order, products, total);
                var status = order['payment-method'] === 'COD' ? 'PLACED' : 'PENDING'
                var orderObj = {
                    deliveryDetails : {
                        mobile: order.mobile,
                        address: order.address,
                        pincode: order.pincode
                    },
                    userId: objectId(order.userId),
                    paymentMethod: order['payment-method'],
                    products: products,
                    totalAmount: total,
                    status: status,
                    date: new Date().toLocaleDateString()
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).removeOne({user: objectId(order.userId)})
                    // console.log("Order ID : ", response.ops[0]._id);
                    resolve(response.ops[0]._id)
                })
            })
        },

        getCartProductList: (userId) => {
            return new Promise(async(resolve, reject) => {
                var cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
                resolve(cart.products)
            })
        },

        getUserOrders: (userId) => {
            return new Promise(async(resolve, reject) => {
                // console.log(userId);
                var orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId : ObjectId(userId)}).toArray()
                // console.log(orders);
                resolve(orders)
            })
        },

        getOrderProducts: (orderId) => {
            return new Promise(async(resolve, reject) => {
                var orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectId(orderId) }
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
                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
    
                ]).toArray()
                // console.log(orderItems);
                resolve(orderItems)
            })
        },

        generateRazorpay: (orderId, total) => {
            return new Promise((resolve, reject) => {
                var options = {
                    // amount: total * 100,
                    amount: total,          // For saving Razorpay Payment Trial Limit
                    currency: "INR",
                    receipt: "" + orderId
                  };
                  instance.orders.create(options, function(err, order) {
                      if (err){
                          console.log(err);
                      } else{
                        console.log("New Order : ", order);
                        resolve(order)
                      }
                  });
            })
        },

        verifyPayment: (details) => {
            return new Promise((resolve, reject) => {
                const crypto = require('crypto');
                var hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
                hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                // console.log(hmac);
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            })
        },

        changePaymentStatus: (orderId) => {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.ORDER_COLLECTION)
                    .updateOne({_id: objectId(orderId)},
                    {
                        $set: {
                            status: 'PLACED'
                        }
                    }
                ).then(() => {
                    resolve()
                })
            })
        },

        getUserList: () => {
            return new Promise((resolve, reject) => {
                var users = db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(users)
            })
        }
    }