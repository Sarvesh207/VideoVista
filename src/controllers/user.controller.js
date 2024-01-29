import { asyncHandler } from "../utils/asyncHandler.js";

const registereUser = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        message: "ok",
    });
});

export { registereUser };
