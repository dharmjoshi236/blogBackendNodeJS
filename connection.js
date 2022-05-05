const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/blogwebsite')
.then(()=>{
    console.log("Database connected succesfully to the backend")
})
.catch(()=>{
    console.log("Something went wrong in connecting the database to the backend")
})