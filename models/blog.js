const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    topic:{
        type:String,
        required:true
    },
    blog:{
        type:String,
        required:true
    },
    posted_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]
},
    {timestamp:true}
)

const blogModel = mongoose.model('blog',blogSchema)
module.exports = blogModel