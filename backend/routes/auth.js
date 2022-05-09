const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Sabmohmayahai";

//Route 1: Create a User using POST "/api/auth/createuser".(end point) No login required
router.post('/createuser',[
    body('name', 'Enter a Valid name').isLength({ min: 3 }),
    body('email', 'Enter a Valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
] , async (req, res)=>{ 
  let success = false;
   // If there are errors,return Bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    //Check whether the user with this email exists already
    try {
    
    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({success, error: "Sorry a user with this email already exists"});
    }
    const salt = await bcrypt.genSalt(10);
    secPass = await bcrypt.hash(req.body.password, salt);

    //create a new user
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
    const data = {
      user:{
        id: user.id
      } 
    }
    const authtoken = jwt.sign(data, JWT_SECRET); 
    // res.json(user);
    success = true;
    res.json({success, authtoken});


} catch (error) {
       console.error(error.message);
       res.status(500).send("Internal Server Error");
}
} )

//Route 2: Authenticate a User using POST "localhost:5000/api/auth/createuser".(end point) no login required
router.post('/login',[
  body('email', 'Enter a Valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
] , async (req, res)=>{ 
  let success = false;

    // If there are errors,return Bad request and the errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user){
        success = false;
        return res.status(400).json({error: "Please try to login with correct credentials"});
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if(!passwordCompare){
        success = false;
        return res.status(400).json({ success, error: "Please try to login with correct credentials" });
      }

      const data = {
        user:{
          id: user.id
        } 
      }
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      
      res.json({success, authtoken});

    }catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error"); 
    }
} )

//Route 3: Get logging User Details using: POST "localhost:5000/api/auth/getuser".(end point) login required
router.post('/getuser', fetchuser, async (req, res) => { 

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password"); 
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error"); 
  }
})  
  module.exports = router;
