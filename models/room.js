var mongoose = require("mongoose");

var roomSchema = new mongoose.Schema({
    title: String,
    image: String,
    description: String,
    password: String,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});

module.exports = mongoose.model("Room", roomSchema);