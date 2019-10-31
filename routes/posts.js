const router = require('express').Router();
const verify = require('./verify_token');

router.get('/', verify ,(req, res) => {
    res.json({posts: {title: 'my first post', description: 'secret access!', user: req.user}});
    //User.findbyOne({_id: req.user});
});

module.exports = router;