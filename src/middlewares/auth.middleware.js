import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"


export const verifyJWT= asyncHandler(async (req,res,next)=>{
   try {
     const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
     if(!token){
         console.log("Unauthorised request")
         throw new ApiError(401,"Unauthorised request")
     }
 
     const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     const user= await User.findById(decodedToken?._id).select('username fullname email avatar coverImage')
    
     if(!user){
         console.log("Invalid Access Token")
         throw new ApiError(401,"Invalid Access Token")
     }
 
     req.user= user
     next()
   } catch (error) {

    console.log("error occured");
    console.log(error.message)
    throw new ApiError(401,"inavlid access token")
   }
})