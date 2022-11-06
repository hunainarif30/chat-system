const express = require("express");
const amqp = require('amqplib/callback_api');
const http = require("http");
const path = require("path");
const mongoose = require('mongoose');
const Message = require('./models/message');

const app = express();
const server = http.createServer(app);


//set static folder
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://Localhost:27017/mydb", {
    useNewUrlParser: true, useUnifiedtopology: true,
}).then(console.log("DB connection Successful"));

async function saveContentInDB(queueContent) {
    const message = new Message({
        msg: queueContent.msg, username: queueContent.username, room: queueContent.room
    });
    try {
        const result = await message.save();
        console.log(result);

    } catch (error) {
        throw error;
    }
}


amqp.connect('amqp://localhost', function (error, connection) {
    if (error) {
        throw error;
    }
    connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        var queue = 'Message Queue';

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        //TODO : Consuming...
        channel.consume(queue, function (msg) {
            // console.log(" [x] Received %s", msg.content.toString());
            console.log('consumed msg: ', msg.content.toString());
            //TODO : saving in data base..

            const queueContent = JSON.parse(msg.content.toString());

            saveContentInDB(queueContent).then(() => {
                console.log('Saved in DB');
            }).catch((error) => {
                console.log('Error while saving', error);
            });

        }, {
            noAck: true
        });
    });

});

// try {
//     await mongoose.connect('mongodb://localhost:27017/mydb');
//     console.log('Connected to Db');
// } catch (e) {
//     console.error.bind(console, 'MongoDB connection error:');
// }


const PORT = 4000 || process.env.PORT;

server.listen(PORT, () => {
    console.log(`server is up on port ${PORT}`);
});
