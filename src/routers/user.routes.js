import { Router } from "express";
import { changePassword, getCurrentuser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCovetImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router= Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",     // upload middleware that will upload avatar and coverimage file field
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)  


    router.route("/login").post(loginUser)    

    // secured routes
    router.route("/logout").post(verifyJWT,logoutUser)     // first middleware is executed then loginuser
    router.route("/refresh-Token").post(refreshAccessToken)

    router.route("/change-Password").post(verifyJWT,changePassword)
    router.route("/current-user").get(verifyJWT,getCurrentuser)
    router.route("/update-account").patch(verifyJWT,updateAccountDetails)
    router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)
    router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCovetImage)

    router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
    router.route("/history").get(verifyJWT,getWatchHistory)  

export default router