import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app= express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,    // allows app to accept requests from all platforms
    credentials:true
}))

app.use(express.json({limit:"20kb"}))       // allows app to accept data in json format and limits the data so as server doesnt crash
app.use(express.urlencoded({extended:true}))            // allows server to accept url links
app.use(express.static("public"))              // allows app to accept files/folders=> in this case "public" folder
app.use(cookieParser())                            // allows app to use and store cookies entered by user

export {app}