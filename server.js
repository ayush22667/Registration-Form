require('dotenv').config(); // at the top of your file

var express = require('express');
var path = require('path');
var fs = require('fs');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var crypto = require('crypto');

// Using environment variables
var username = process.env.DB_USER;
var password = encodeURIComponent(process.env.DB_PASSWORD);
var dbName = process.env.DB_NAME; // Replace with your database name
var host = "cluster0.28y5eon.mongodb.net"; // Change if your host is different

var new_db = `mongodb+srv://${username}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;


app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Hashing function
var getHash = (pass, phone) => {
    var hmac = crypto.createHmac('sha512', phone);
    data = hmac.update(pass);
    gen_hmac = data.digest('hex');
    console.log("hmac : " + gen_hmac);
    return gen_hmac;
}

app.get('/', function(req, res) {
    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    return res.redirect('/public/index.html');
}).listen(3000);

console.log("Server listening at : 3000");

// Sign-up function
app.post('/sign_up', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pass = req.body.password;
    var phone = req.body.phone;
    var password = getHash(pass, phone);

    var data = {
        "name": name,
        "email": email,
        "password": password,
        "phone": phone
    }

    MongoClient.connect(new_db, { useNewUrlParser: true, useUnifiedTopology: true }, function(error, client) {
        if (error) {
            throw error;
        }
        console.log("Connected to database successfully");

        var db = client.db(dbName);

        db.collection("details").insertOne(data, (err, collection) => {
            if (err) throw err;
            console.log("Record inserted successfully");
            console.log(collection);
            client.close();
        });
    });

    res.set({
        'Access-Control-Allow-Origin': '*'
    });
    return res.redirect('/public/success.html');
});