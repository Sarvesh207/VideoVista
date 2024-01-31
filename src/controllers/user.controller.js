import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registereUser = asyncHandler(async (req, res, next) => {
    // get user user deatils from frontend
    // check validation
    // check if user already exists
    // chek for images and avatar
    // upload them on cloudinary
    // create user obj - create entry in db
    // remove password and refresh from response
    // check user creation
    // send response

    const { fullName, email, password, username } = req.body;
    console.log(fullName, username, email, password)
        

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Please fill all the fields");
    }

    const exitedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (exitedUser) {
        throw new ApiError(409, "User already exists");
    }

    console.log(req.body)
    
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
        .status(201).json(new ApiResponse(200, createdUser, "User registerd Successfully"));
 
});

export { registereUser };
