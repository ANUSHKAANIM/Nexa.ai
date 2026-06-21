const User = require("../models/user");

const userDetails = async (req, res) => {
    user_id = req.body.user_token;
    console.log(user_id)

    User.find({ user_token: user_id }, async function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send(docs[0]);
        }
    });
};



module.exports = {
    userDetails,
};
