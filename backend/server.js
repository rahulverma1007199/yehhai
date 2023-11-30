import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from 'cors';
import admin from 'firebase-admin';
import {getAuth} from 'firebase-admin/auth';
import aws from "aws-sdk";

import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import serviceAccountKey from './yeh-hai-14364-firebase-adminsdk-xeyjy-746e1f0b76.json' assert { type: "json" };;

const server = express();
const PORT = 3000;

admin.initializeApp({credential:admin.credential.cert(serviceAccountKey)});

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(cors());
server.use(express.json());

mongoose.connect(process.env.DB_URL,{
    autoIndex:true
});

//seting up s3 bucket
const s3 = new aws.S3({
    region:'ap-south-1',
    accessKeyId:process.env.AWS_SECRET_KEY,
    secretAccessKey:process.env.AWS_ACCESS_KEY
});

const generateUploadURL =async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject',{
        Bucket:'bucketname',
        Key:imageName,
        Expires:1000,
        ContentType : "image/jpeg"
    })
}

const formatDataToSend = (user) => {
    const access_token = jwt.sign({id : user._id}, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname : user.personal_info.fullname
    }
}

const generateUsername = async (email) => {
    let username = email.split("@")[0];

    const isUserNameUnique = await User.exists({"personal_info.username":username}).then((result)=> result);
    isUserNameUnique ? username += nanoid().substring(0,5) : "";
    return username;
}

const verifyJWT = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(token == null){
        return res.status(401).json({"error":"No access token"});
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY , (err,user)=>{
        if(err){
            return res.status(403).json({"error":"Invalid access token"});
        }

        req.user = user.id;
        next();
    });
}

//upload image url route
server.get("/get-upload-url",(req,res) => {
    generateUploadURL().then(url => res.status(200).json({"uploadURL":url})).catch(err => {
        res.status(500).json({'error':err.message});
    });
});

server.post("/signup",(req,res)=>{
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

        const user = new User({personal_info:{fullname,email,password:hashed_password,username}});

        user.save().then((u)=>{
            return res.status(200).json(formatDataToSend(u));
        }).catch(err => {

            if(err.code == 11000){
                return res.status(500).json('Email already exists!');
            }

            return res.status(500).json(err.message);
        });
    });


});

server.post("/signin",(req,res)=>{
    const {email,password} = req.body;

    User.findOne({"personal_info.email" : email})
    .then((user)=>{
        if(!user){
            return res.status(403).json({"error":"Email not found"});
        }

        if(user.google_auth){
            return res.status(403).json({"error":"Account needs google login"});
        }

        bcrypt.compare(password, user.personal_info.password,(err,result)=>{
            if(err){
                return res.status(403).json({"error":"Error occured while login please try again"});
            }

            if(!result){
                return res.status(403).json({"error":"Incorrect Passowrd"});
            }else{
                return res.status(200).json(formatDataToSend(user));
            }
        });
    })
    .catch(err => {
        return res.status(500).json({"error":err.message});
    });
});

server.post("/google-auth",async (req,res)=>{
    let {access_token} = req.body;

    getAuth().verifyIdToken(access_token).then(async (decodedUser)=> {
        let {email,name,picture} = decodedUser;
        picture = picture.replace("s96-c","s384-c");

        let user = await User.findOne({"personal_info.email" :email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => { return u || null}).catch(err => {return res.status(500).json({"error":err.message})});

        if(user){ //login
            if(!user.google_user){
                return res.status(403).json({"error": "This email was signed up without google. Please Login in with password to access the account"});
            }
        }
        else{ //sign up
            const username = await generateUsername(email);
            user = new User({
                personal_info : {fullname : name, email,profile_img:picture,username},google_auth:true
            })

            await user.save().then((u)=>{
                user = u;
            }).catch(err => {
                return res.status(500).json({"error": err.message});
            });
        }

        return res.status(200).json(formatDataToSend(user));
    }).catch(err => {
        return res.status(500).json({"error": "Failed to authenticate with google"});
    });
});

server.post("/create-blog",verifyJWT, (req,res)=>{
    const autherID = req.user;
    
    let {title,des, banner, tags, content,draft = undefined} = req.body;

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({"error":"You must provide desc under 200 words"});
        }
    
        if(!banner.length){
            return res.status(403).json({"error":"You must provide banner"});
        }
    
        if(!content.blocks.length){
            return res.status(403).json({"error":"You must provide some block content"});
        }
    
        if(!tags.length || tags.length > 10 ){
            return res.status(403).json({"error":"You must provide tags under 10 length"});
        }
    }

    if(!title.length){
        return res.status(403).json({"error":"Please provide title"});
    }

 

    tags = tags.map(tag => tag.toLowerCase());

    const blog_id = title.replace(/[^a-zA-Z0-9]/g,'').replace(/\s+/g,"-").trim() + nanoid();

    const blog = new Blog({
        title,des,content,banner,tags,author:autherID,blog_id,draft:Boolean(draft)
    });

    blog.save().then(blog => {
        const incrementalVal = draft ? 0 : 1;

        User.findOneAndUpdate({_id : autherID} , {$inc : {"account_info.total_posts":incrementalVal}, $push :{"blogs":blog._id}}).then(user => {
            return res.status(200).json({id : user._blog_id});
        }).catch((err)=>{
            return res.status(500).json({"error":"Failed to uplaod"});

        });

    }).catch(err => {
        return res.status(500).json({"error":err.message});
    })


});

server.listen(PORT,()=>{
    console.log('Listening to port --> '+ PORT);
});