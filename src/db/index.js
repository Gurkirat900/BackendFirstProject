import mongoose from "mongoose"
import { DB_name } from "../constants.js"

const connectDB= async ()=>{
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`MongoDb connection sucessful at HOST- ${connectionInstance.connection.host}`)  // there are seprate database for deployment and devleopment hence multiple host
    } catch (error) {
        console.log("ERROR MongoDB connection failed",error)
    }
}

export default connectDB