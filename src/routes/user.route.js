import { Router } from "express";
import { registereUser } from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(registereUser);

export default router;

