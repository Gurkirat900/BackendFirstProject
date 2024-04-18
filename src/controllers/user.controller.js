import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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


const genrateAccessAndRefreshToken= async (userId)=> {
    try {
        const user= await User.findById(userId)
        const accessToken= user.genrateAccessToken()
        const refreshToken= user.genrateRefreshToken()
        user.refreshToken= refreshToken                 // add refreshToken field to user
        await user.save({validateBeforeSave: false})         // if validation is true then db will also ask for password to validate which we dont want 

        return {accessToken,refreshToken}

    } catch (error) {
        console.log("something went wrong while genrating acess and refresh token",error.message)
        throw new ApiError(500, "something went wrong while genrating acess and refresh token")
    }
}



const loginUser= asyncHandler(async (req,res)=>{
    // get users email/username and password for login => req.body
    // check if users email/username exist in database
    // if email/username exist check if password entered is correct
    // genrate access and refresh token and give them to user(in form of cookies)
    // send res=> user logined


    const {username,email,password}= req.body
   
    if(!username && !email){
        console.log("Username or email is required")
        throw new ApiError(400, "Username or email is required");   
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
   

    if(!user){
        console.log("Username or email doesnt exist") 
        throw new ApiError(404, "Username or email doesnt exist") 
    }

    if(!password){
        console.log("Password is required");
        throw new ApiError(400, "Password is required")  
    }

    const passValidate= await user.isPasswordCorrect(password)
    console.log(passValidate)
    if(!passValidate){
        console.log("password is incorect");
        throw new ApiError(401, "password is incorect")
    }

    const {accessToken,refreshToken}= await genrateAccessAndRefreshToken(user._id)
    
    

    let loggedInUser;
    try {  // data that u need to send to user(optional)
        loggedInUser= await User.findById(user._id).select("-password -refreshToken") 
    } catch (error) {
        console.log("Logged in user was not created",error.message)   
    } 

    const options= {      // some options need to be set before sending cookies to user
        httpOnly: true,     
        secure: true
    }

    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)   // cookie()=> from cookie-parser dependency
    .json(
        new ApiResponse(200,{user: loggedInUser,accessToken,refreshToken},"User loggedIn successfully!")
    )

})




const logoutUser= asyncHandler(async (req,res)=>{
    // delete the refresh token stored within users db
    // clear cookie data
    await User.findByIdAndUpdate(req.user._id,
        {
            $set:{refreshToken:undefined}
        })                                    // we needed users data thatswhy we used auth middleware and stored it in req.user


        const options= {     
            httpOnly: true,     
            secure: true
        }
    
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(
         new ApiResponse(200,{},"User logged Out")
    )    
})



const refreshAccessToken= asyncHandler(async (req,res)=>{
    // when users acces token expires it gives us encoded refresh token
    // we check if the incoming token matches with the refresh token kept in db
    // if matches it is confirmed this is user and hence we genrate new access token for user

    const incomingToken= req.cookies.refreshToken || req.body.refreshToken

    if(!incomingToken){
        console.log("Token not found")
        throw new ApiError(401,"Unauthorized request")
    }

    const decodedToken= jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
    const user= await User.findById(decodedToken?._id)   // we gave decoded token _id in genrateRfreshToken()

    if(!user){
        console.log("Invalid refresh token")
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingToken !== user?.refreshToken){
        console.log("Refresh token is expired")
        throw new ApiError(401,"Refresh token is expired")
    }

    const {accessToken,NewrefreshToken}= await genrateAccessAndRefreshToken(user._id)  

    const options={
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .cookie("accesToken",accessToken,options)
    .cookie("refreshToken",NewrefreshToken,options).json(
        new ApiResponse(200,{accessToken,refreshToken:NewrefreshToken},"Access token refreshed")
    )
})

export {registerUser,loginUser,logoutUser,refreshAccessToken} 