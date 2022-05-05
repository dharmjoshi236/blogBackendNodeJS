const jwt = require('jsonwebtoken')

const userModel = require('../models/user')

exports.loginRequire = async(req,res,next)=>{

    try{

        const token = req.headers.authorization
        const validate = jwt.verify(token,"secretstringhere")
        console.log('validate object',validate)
        
        const userDetails = await userModel.findOne({_id:validate.user_id})
        req.user = userDetails
        next();
    }
    catch{
        res.status(400).json({
            message:"Invalid token, Kindly Login again!!!"
        })
    }
}