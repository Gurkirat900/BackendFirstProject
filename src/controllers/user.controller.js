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




   if(username=="" || email=="" || fullname=="" || password==""){
    console.log("All fields are required");
    throw new ApiError(400,"All fields are required")              // validation
   }


  

   const existingUsername= await User.findOne({username})
   if(existingUsername){     
    console.log("username already exists");                       // check if user already exists
    throw new ApiError(409,"userName already exists")                                                   
   }
                                                          
   const existingEmail= await User.findOne({email})
    if(existingEmail){
        console.log("email already exists");
        throw new ApiError(409,"email already exists")
    }

    
    
    // path of files in local syatem/server
    const avatarLocalFilePath= req.files?.avatar?.[0]?.path;   // ?. => optional chaining to prevent error in case of null object
    const coverImageLocalFilePath = req.files?.coverImage?.[0]?.path;

    // we could use this logic as well for both avatar and coverimage local file path =>
    // let coverImageLocalFilePath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    //     coverImageLocalFilePath= req.files.coverImage[0].path;
    // }
    
    if(!avatarLocalFilePath){
        console.log("avatar file is required")
        throw new ApiError(400, "avatar file is required")

    }

    const avatar= await uploadOnCloudinary(avatarLocalFilePath)     // upload on cloudinary
    const coverImage= await uploadOnCloudinary(coverImageLocalFilePath)  // cloudinary returns empty string if no file path

    if(!avatar){
        console.log("avatar file is required")
        throw new ApiError(400, "avatar file is required")
    }

   
   
    try {
        const user= await User.create({                            // creates a entry in db for user
            username: username.toLowerCase(),
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",    // if coverImage is not there keep it empty in db
            email,
            password,
        })
 
       

        // remove password and token by using select()=> takes argument to include
       // _id is created by mongoDb for each entry
       const userCreated = await User.findById(user._id).select('username fullname email avatar coverImage');
 
    
     if(!userCreated){
        console.log("Something went wrong while registering the user");
        throw new ApiError(500, "Something went wrong while registering the user")
     }



     return res.status(201).json(
        new ApiResponse(200, userCreated, "registeration succesful")
      )

    }
    catch (error) { 
       console.log("user wasnt registered",error)
              } 

})

export {registerUser}