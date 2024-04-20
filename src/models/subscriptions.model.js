import mongoose, { Schema } from "mongoose";

const subscriptionSchema= new Schema(
    {
        subscriber:{                        // the one who subscribes a channel
            type: Schema.Types.ObjectId,
            ref: User,
        },
        channel:{
            type: Schema.Types.ObjectId,     // the one who is being subscribed to
            ref: User,
        }
    },{timestamps:true});


export const subscription= mongoose.model("subscription",subscriptionSchema);