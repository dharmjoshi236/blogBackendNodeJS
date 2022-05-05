const express = require('express')
const app = express();
require('./connection')

const userModel = require('./models/user')
const blogModel = require('./models/blog')
app.use(express.json())

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loginRequire } = require('./middlewares/auth');
const genSalt = 10;
app.get('/',(req,res)=>{
    res.send("This is the introductory route for the Blog Website")
})

app.post('/registerUser',async(req,res)=>{
try{

        const userData = await new userModel({
            username:req.body.username,
            email:req.body.email,
        password:req.body.password
    })

    const oldUser = await userModel.findOne({email:userData.email})
    if(oldUser){
        res.status(400).json({
            message:"User Already Exist, Kindly Login To Continue"
        })
    }

    else{

        userData.password = await bcrypt.hash(userData.password,genSalt)
        await userData.save()
        .then(()=>{
            console.log("User Data Saved Succesfully")
            res.status(201).json({
                data:userData
            })
        })
        .catch((e)=>{
            console.log("Something went wrong in saving the userdata")
            res.status(400).json({
                message:"Data Saving UnSuccessful",
                error: e
            })
        })
    }

}

catch{
    console.log("Something went wrong in the try catch block")
    res.status(400).json({
        message:"Something went wrong in the try catch block"
    })
}
})


app.post('/loginUser',async(req,res)=>{

try{

    if(!req.body.email || !req.body.password){
        console.log("please provide all necessary credentials to login")
        res.status(400).json({
            message:"Please provide all necessary credentials to login"
        })
    }

    const userData = await userModel.findOne({email:req.body.email})
    if(userData){
      const verifyPass =  await bcrypt.compare(req.body.password,userData.password)
      if(verifyPass){
          console.log("user Logged in successfully")
          const token = jwt.sign({user_id:userData._id},"secretstringhere",{expiresIn:"24h"})
          console.log("token is ",token)
        //   req.headers.authorization = token
          console.log(req.headers)
          res.status(200).json({
              message:"User Logged in succesfully",
              token:token
          })
      }
      else{
          console.log("Please provide the correct passoword for login")
          res.status(401).json({
              message:"Please provide correct password"
          })
      }
    }
    else{
        console.log("please provide correct email address")
        res.status(400).json({
            message:"Please provide correct email address to login"
        })
    }

}

catch{
    console.log("Something went wrong in the try catch block")
    res.status(400).json({
        message:"Something went wrong in the try catch block"
    })
}
})

// app.get('/authroute',loginRequire,(req,res)=>{
//     res.send(req.user)
// })

app.post('/postBlog',loginRequire,async(req,res)=>{
    try{

        const blogData = await new blogModel({
            title:req.body.title,
            topic:req.body.topic,
            blog:req.body.blog
        })

        await blogData.save()
        .then(()=>{
            blogData.posted_by = req.user._id  
        })
        .catch((e)=>{
            res.status(400).json({
                message:"Not able to save the Blog, Kindly post it again with all necessary requirements"
            })
        })

        await blogData.save()
        .then(()=>{
            res.status(201).json({
                data:blogData,
                message:"Your Blog Has Been Succeesfully Posted"
            })
        })
        .catch((e)=>{
            res.status(400).json({
                message:"Unable to save the user_id",
                error:e
            })
        })
    }
    catch{
        console.log("Something went wrong in the try block")
        res.status(400).json({
            message:"Something went wrong in the try block"
        })
    }
})

app.get('/getBlogs',loginRequire,async(req,res)=>{

    try{

        const blogData = await blogModel.find({posted_by:req.user._id})
        
        if(blogData.length===0){
            res.status(200).json({
                message:"No Blogs Posted By The User"
            })
        }
        else{
            res.status(200).json({
                data:blogData,
                message:"Request Succesfull"
            })
        }
    }
    catch{
        console.log("Something went wrong in the try catch block")
        res.status(400).json({
            message:"Something went wrong in the get request"
        })
    }
})

app.put('/changeBlog/:id',loginRequire,async(req,res)=>{

    try{

    
    const {id} = req.params
    const blogDetails = await blogModel.findByIdAndUpdate(id,{blog:req.body.blog},{new:true})
    await blogDetails.save()
        .then(()=>{
            res.status(200).json({
                message:"Update on the blog succesfull",
                data:blogDetails
            })
        })
        .catch((e)=>{
            res.status(400).json({
                message:"Cannot able to update the desire updation,Try Again!!",
                error: e
            })
        })
        
    }
        catch{
            console.log("Something went wrong in the try catch block")
            res.status(400).json({
                message:"Something went wrong in the try catch block"
            })
        }
    })

    app.post('/like/:id',loginRequire,async(req,res)=>{
        try{
            
            const {id} = req.params;
            const blogdata = await blogModel.findOne({_id:id})
            console.log(blogdata)
            if(blogdata.likes.includes(req.user._id)){
                res.status(400).json({
                    message:"You have already liked this post"
                })
            }
            else{

                await blogdata.likes.push(req.user._id)
                await blogdata.save()
                    .then(()=>{
                        res.status(201).json({
                            message:"You liked this post succesfully",
                            data:blogdata
                        })
                    })
                    .catch((e)=>{
                        res.status(400).json({
                            message:"Unable to proceed something went wrong",
                            error:e
                        })
                    })
            }
        }
        catch{
            console.log("Something went wrong in the try catch block")
            res.status(400).json({
                message:"Something went wrong in the try catch block"
            })
        }
    })


app.listen('5000',()=>{
    console.log("Server is running on the port 5000")
})