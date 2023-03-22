const db = require('../data/database')

class auth {
    constructor(email,name,password,street,postal,city) {
        this.email = email,
        this.name = name,
        this.password = password,
        this.street = street,
        this.postal = postal,
        this.city = city
    }

    async insertUserData() {
        await db
    .getdb()
    .collection("users")
    .insertMany([{
       email: this.email ,
       name: this.name ,
       password: this.password ,
       street: this.street ,
       postal: this.postal ,
       city: this.city },
    ])
    }

    async user() {
            const user = await db
            .getdb()
            .collection("users")
            .findOne({ email: this.email })
            return user
    }
}


module.exports = {
    auth:auth
}