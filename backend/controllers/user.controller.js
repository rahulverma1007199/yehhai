import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import {Users,Blogs} from "../db/models/index.model.js";
import { Op } from "sequelize";
import {getAuth} from 'firebase-admin/auth';
import { nanoid } from 'nanoid';


const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    const isUserNameUnique = await Users.findOne({username});
    isUserNameUnique ? username += nanoid().substring(0,5) : "";
    return username;
}

const formatDataToSend = (user) => {
    const access_token = jwt.sign({id : user.id}, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img : user.profile_img,
        username : user.username,
        fullname : user.fullname
    }
}

export const signUp = CatchAsyncError(async (req,res,next)=>{
    try {
        const {fullname, email, password} = req.body;

        if(fullname.length < 3){
            return res.status(403).json({"error":"Fullname must be at least 3 letters long"});
        }
    
        if(!email.length){
            return res.status(403).json({"error":"Enter Email"});
        }
    
        if(!emailRegex.test(email)){
            return res.status(403).json({"error":"Email is invalid"});
        }
    
        if(!passwordRegex.test(password)){
            return res.status(403).json({"error":"Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"});
        }
    
        bcrypt.hash(password,10,async (err,hashed_password)=>{
            const username = await generateUsername(email);
    
            const user = await Users.create({fullname,email,password:hashed_password,username});
    
            return res.status(200).json(formatDataToSend(user));
    
        });
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const signIn = CatchAsyncError(async (req,res,next)=>{
    try {
        const {email,password} = req.body;

        const user = await Users.findOne({where:{email}});
            if(!user){
                return res.status(403).json({"error":"Email not found"});
            }
    
            if(user.google_auth){
                return res.status(403).json({"error":"Account needs google login"});
            }
    
            bcrypt.compare(password, user.password,(err,result)=>{
                if(err){
                    return res.status(403).json({"error":"Error occured while login please try again"});
                }
    
                if(!result){
                    return res.status(403).json({"error":"Incorrect Passowrd"});
                }else{
                    return res.status(200).json(formatDataToSend(user));
                }
            });
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const googleAuth = CatchAsyncError(async (req,res,next)=>{
    try {
        let {access_token} = req.body;

        getAuth().verifyIdToken(access_token).then(async (decodedUser)=> {
            let {email,name,picture} = decodedUser;
            picture = picture.replace("s96-c","s384-c");
    
            let user = await Users.findOne({where:{email}});
    
            if(!user){ //sign up
                const username = await generateUsername(email);
                user = await Users.create({fullname : name, email,profile_img:picture,username,google_auth:1})
            }
    
            return res.status(200).json(formatDataToSend(user));
        }).catch(err => {
            return res.status(500).json({"error": "Failed to authenticate with google"});
        });
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const searchUsers = CatchAsyncError(async (req,res,next)=>{
    try {
        const {query} = req.body;

        const findQuery = {
            where: {
              'username': {
                [Op.like]: `%${query}%`,
              },
            },
            attributes: [
              'fullname',
              'username',
              'profile_img',
            ],
            limit: 50,
          };

        const users =await Users.findAll(findQuery);
        return res.status(200).json({users});
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const getProfile = CatchAsyncError(async (req,res,next)=>{
    try {
        const {username} = req.body;

        const findQuery = {
            where: {
              'username': username,
            },
            attributes: {
              exclude: ['password', 'google_auth', 'updatedAt'],
            },
          };

        const user = await Users.findOne(findQuery);
        return res.status(200).json(user);

    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});
