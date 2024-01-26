import dotenv from "dotenv"
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`⚙️  Server is running on port : ${PORT}`)
    })
})
.catch( (err) => {
    console.log('MONGODB connection failed !!!', err)
}
    
)




























/** 
const app = express()
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error("Error :",error)
        })

        app.listen(process.env.PORT, () => {
            console.log("App is listening")
        })
    } catch (error) {
        console.error("Error: ",error)
        throw error;
    }
})()

*/