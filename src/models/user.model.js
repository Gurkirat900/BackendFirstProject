import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema= new Schema(
    {
        username:{
            type:String,
            unique: true,
            required:true,
            lowercase:true,
            trim:true,
            index:true,     // for enabling searching field(easier)
        },
        email:{
            type:String,
            unique: true,
            required:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,      // cloudnary url
            required:true,
        },
        coverImage:{
            type:String,      // cloudnary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video",
            }
        ],
        password:{
            type: String,        // we use bycript to hash password
            required:[true,"Pasword is required"]
        },
        refreshToken:{
            type:String,
        }
    },{timestamps:true})


    userSchema.pre("save", async function(next){   // pre middleware that run whenever something is saved
        if(!this.isModified("password")){      // isModified => built in method which accepts string as argument
            next()
        }
        this.password= await bcrypt.hash(this.password,10)   // saltrounds can be 8 or 10 or default
        next()
    })


    userSchema.methods.isPasswordCorrect= async function(password){   // custom method 
      await  bcrypt.compare(password,this.password)     // compare compares original pass and encrypted pass
    }


    userSchema.methods.genrateAcessToken= function(){     // syntax from documentation of jwt
        jwt.sign(
            {
                _id: this._id,
                email: this.email,                       
                username: this.username,
                fullname: this.fullname,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            })
    }

    userSchema.methods.genrateRefreshToken= function(){
        jwt.sign(
            {
                _id: this._id,
                email: this.email,
                username: this.username,
                fullname: this.fullname,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            })
    }



export const User= mongoose.model("User",userSchema);