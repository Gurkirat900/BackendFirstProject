import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";       // file system (in built in node.js)
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary= async (localFilePath)=>{
    if(!localFilePath){
        console.log("local file not found")
        return null;
    }
    try {
        const response= await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})  // upload local file to cloudinary
        console.log("File has been uploaded on cloudinary. URL= ",response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)     // remove file from server as upload to cloudinary failed 
        return null;
    }
}


  export {uploadOnCloudinary}