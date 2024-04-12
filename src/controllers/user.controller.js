import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser= asyncHandler( async (req,res)=>{
   // get user details => from postman
   // validation => not empty
   // check if user already exist (check through username and email)
   // check for images and upload it to cloudinary(avatar,coverImage)
   // create user object => entry in db
   // remove password(hashed) and refresh token field from response
   // check for user creation => return response if true


   const {username,email,fullname,password}= req.body   // req from client to http server
   console.log("email: ",email);



   if(username=="" || email=="" || fullname=="" || password==""){
    throw new ApiError(400,"All fields are required")              // validation
   }



   const existingUsername= User.findOne({username})
   if(existingUsername){                                      
    throw new ApiError(409,"userName already exists")                                                   
   }
                                                           // check if user already exists
   const existingEmail= User.findOne({email})
    if(existingEmail){
        throw new ApiError(409,"email already exists")
    }

    
    // path of files in local syatem/server
    const avatarLocalFilePath= req.files?.avatar[0]?.path;   // ?. => optional chaining to prevent error in case of null object
    const coverImageLocalFilePath= req.files?.coverImage[0]?.path;
    
    if(!avatarLocalFilePath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar= await uploadOnCloudinary(avatarLocalFilePath)     // upload on cloudinary
    const coverImage= await uploadOnCloudinary(coverImageLocalFilePath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    const user= await User.create({                            // creates a entry in db for user
        username: username.toLowercase(),
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",    // if coverImage is not there keep it empty in db
        email,
        password
    })


    // remove password and token by using select()=> takes argument with - i.e which not to include
    // _id is created by mongoDb for each entry
    const userCreated= User.findById(user._id).select("-password -refreshToken")  
    
    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering the user")
    }



    return new ApiResponse(200, userCreated, "User registered successfully")

})

export {registerUser}