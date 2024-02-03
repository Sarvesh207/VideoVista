import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;

        await user.save();

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh token"
        );
    }
};

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

    console.log(req.body);

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
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registerd Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    // get data from req body
    // get email , username and passworrd
    // find user in db
    // check for password
    // genrate accessToken token refreshToken
    // return into cookie
    // send response

    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "email or username is required");
    }

    const user = await User.findOne({
        $or: [{ username, email }],
    });

    if (!user) {
        throw new ApiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password, -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .send(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },

        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
});

export { registereUser, loginUser, logoutUser };
