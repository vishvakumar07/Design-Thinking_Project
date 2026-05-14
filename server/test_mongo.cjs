const mongoose = require('mongoose');

// Using the standard connection string instead of SRV
const uri = "mongodb://vishvakumarab_db_user:pqDaIjbFaiEk1v1u@ac-zvi2tyd-shard-00-00.zulkvfi.mongodb.net:27017,ac-zvi2tyd-shard-00-01.zulkvfi.mongodb.net:27017,ac-zvi2tyd-shard-00-02.zulkvfi.mongodb.net:27017/?ssl=true&replicaSet=atlas-tpa8yd-shard-0&authSource=admin&retryWrites=true&w=majority&appName=minesafety";

mongoose.connect(uri)
    .then(() => {
        console.log("Successfully connected to MongoDB with standard URI!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
