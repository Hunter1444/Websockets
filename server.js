const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const bodyParser = require('body-parser');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3007);

io.on('connection', function(client){
    client.on('sendMessages', function(data){
        client.broadcast.emit('receivedMessage', data);
        sendMessage(data);
    });
    client.on('disconnect', function(){});
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/get-messages', function (req, res) {
    getMessages(res);
});

const url = 'mongodb://admin:414175akk@ds239873.mlab.com:39873/maxim-database';

function sendMessage(msg) {
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server sendMessage");
        const db = client.db('maxim-database');
        const collection = db.collection("CHAT_HISTORY");
        collection.insertOne(msg, function(){
            client.close();
        });
    });
}

function getMessages(res) {
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server getMessage");

        const db = client.db('maxim-database');
        const collection = db.collection("CHAT_HISTORY");
        collection.find({}).toArray(function(err, docs) {
            console.log(docs);
            res.send(docs);
            client.close();
        });
    });
}
