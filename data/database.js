const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;

let database;

async function connectToDatabase() {
  const MongoClient = await mongoClient.connect("mongodb://127.0.0.1:27017");
  database = MongoClient.db("shop");
}

function getdb() {
  if (!getdb) {
    throw { message: "not connected" };
  }
  return database;
}

module.exports = {
    connectToDatabase:connectToDatabase,
    getdb:getdb
};
