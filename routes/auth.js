const router = require('express').Router();
const User = require('../model/user');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require('./validation');

//REGISTER

router.post('/register', async(req, res)=>{

    const validation = registerValidation(req.body);
    if(validation.error){
        res.status(400).send(validation.error.message);
    }

    else{
         //check if email already exists
        const emailExist = await User.findOne({email: req.body.email});
        if(emailExist) res.status(400).send('Email already exists');


        else{

            //hash password
            const salt = await Bcrypt.genSalt();
            const hashedPassword = await Bcrypt.hash(req.body.password, salt);

            //create new user
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword
            });
            
            //save to database
            try{
                const savedUser = await user.save();
                res.send({user: savedUser.id});
            }catch(err){
                res.status(400).send(err);
            }
        }

    }
}); 

//LOGIN

router.post('/login', async(req, res)=>{
    const validation = loginValidation(req.body);
    if(validation.error){
        res.status(400).send(validation.error.message);
    }
    else{
        //check if email exists
        const user = await User.findOne({email: req.body.email});
        if(!user) res.status(400).send('Email not found');

        else{
            //check if password matches
            const validPass = await Bcrypt.compare(req.body.password, user.password);
            if(!validPass) res.status(400).send('password does not match');
            else{

                //create and assign json web token
                const token = jwt.sign({_id: user._id}, process.env.TOKEN_PRIVATE_KEY);
                res.header('auth-token', token ).send(token);
            }
        }
    }
});

module.exports = router;