var mongoose = require("mongoose");

var messageSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
        },
        username: String,
        avatar: String
    }
})

module.exports = mongoose.model("Message", messageSchema);