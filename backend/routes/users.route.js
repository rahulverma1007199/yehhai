import express from "express";
import { getProfile, googleAuth, searchUsers, signIn, signUp } from "../controllers/user.controller.js";

const usersRouter = express.Router();

usersRouter.post("/signup",signUp);
usersRouter.post("/signin",signIn);
usersRouter.post("/google-auth",googleAuth);
usersRouter.post("/search-users",searchUsers);
usersRouter.post("/get-profile",getProfile);

export default usersRouter;
