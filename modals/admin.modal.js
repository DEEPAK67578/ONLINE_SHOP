const db = require('../data/database')
const MongoDb = require('mongodb')
const ObjectId = MongoDb.ObjectId


class ProductData {
    constructor(id,email) {
        this.email = email
        this.id = id
    }
    async ProductDetails() {
        const productDetails = await db
        .getdb()
        .collection("productDetails")
        .find()
        .toArray()
        return productDetails
    }

    async user() {
        const user = await db
        .getdb()
        .collection("users")
        .findOne({ email: this.email })
        return user
    }

    async productOne() {
        const data = await db
        .getdb()
        .collection("productDetails")
        .findOne({ _id: new ObjectId(this.id) })

        return data
    }

    async deleteProduct() {
        await db
        .getdb()
        .collection("productDetails")
        .deleteOne({ _id: new ObjectId(this.id) })
    }

    
}

class insertMany {
    constructor(title,summary,price,description,imagePath,id) {
        this.id = id,
        this .title = title,
        this.summary = summary,
        this.price = price,
        this.description = description,
        this.imagePath = imagePath
    }
    
    async insertMany() {
       await db
      .getdb()
      .collection("productDetails")
      .insertMany([
        {
          title: this.title,
          summary: this.summary,
          price: this.price,
          description: this.description,
          imagePath: this.imagePath,
        },
      ]);
    }
   
    async updateMany() {
        await db
        .getdb()
        .collection("productDetails")
        .updateMany(
          { _id: new ObjectId(this.id) },
          {
            $set: {
              title: this.title,
              summary: this.summary,
              price: this.price,
              description: this.description,
              imagePath: this.imagePath,
            },
          }
        );
    }

    async updateExeptImage() {
       await db
      .getdb()
      .collection("productDetails")
      .updateMany(
        { _id: new ObjectId(this.id) },
        {
          $set: {
            title: this.title,
            summary: this.summary,
            price: this.price,
            description: this.description,
          },
        }
      )
    }
} 

class order {
    constructor(id,status) {
        this.status = status,
        this.id = id
    }

    async AllOrders() {
            const data = await db.getdb().collection("order").find().toArray()
            return data
    }
    
    async updateOrder() {
     await db
    .getdb()
    .collection("order")
    .updateOne(
      { _id: new ObjectId(this.id) },
      { $set: { OrderStatus: this.status } }
    );
    }
    }

module.exports = {
    ProductData:ProductData,
    insertMany:insertMany,
    order:order
}