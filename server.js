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

const url = 'mongodb://localhost:27017';

function sendMessage(msg) {
    MongoClient.connect(url, function(err, client) {
        // Use the admin database for the operation
        const db = client.db('CHAT_HISTORY');
        const collection = db.collection("ANON_HISTORY");
        collection.insertOne(msg, function(err){
            if(err){
                return console.log(err);
            }
            client.close();
        });
    });
}

function getMessages(res) {
    MongoClient.connect(url, function(err, client) {
        // Use the admin database for the operation
        const db = client.db('CHAT_HISTORY');
        const collection = db.collection("ANON_HISTORY");
        let returnedValue;
        collection.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            res.send(docs);
            client.close();
        });
        return returnedValue;
    });
}
