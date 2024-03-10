import mongoose, {Schema} from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content:{
            type:Stirng,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },{
        timestamps:true
    }
)

export const Tweet = mongoose.model("Tweet",tweetSchema)