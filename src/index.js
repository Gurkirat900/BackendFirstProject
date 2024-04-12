import 'dotenv/config'
import connectDB from './db/index.js'
import {app} from './app.js'

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed",err)
})

// routes
import userRouter from './routers/user.routes.js'

app.use("/api/v1/users",userRouter)     // will take the rest to router folder
                                        // http://localhost:8000/api/v1/users