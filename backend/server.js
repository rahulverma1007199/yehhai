import express from 'express';
import 'dotenv/config';
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from 'cors';
import admin from 'firebase-admin';
import {v2 as cloudinary} from 'cloudinary';
import User from "./Schema/User.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";
import sequelize from './db/config/db_config.js';
import blogsRouter from './routes/blogs.route.js';
import usersRouter from './routes/users.route.js';
import { ErrorMiddleware } from './middleware/error.js';

// import serviceAccountKey from './yeh-hai-14364-firebase-adminsdk-xeyjy-746e1f0b76.json' assert { type: "json" };;

const server = express();
const PORT = 5000;

admin.initializeApp({credential:admin.credential.cert({
    "type": "service_account",
    "project_id": "yeh-hai-14364",
    "private_key_id": "746e1f0b766669b1514a7f34cab0fc53a1da40dd",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6NlOIFyAgXUK4\n95EhOfGs+A363bCfc08wCHO/Tfyh/uWSo16T1VDBcQYa5msi+n/beMbB7rKrXZ0i\n72nX6oU5WRGiQ5ZqLXD+WhZdzDQ9RSJykMd4YMFIVU+YLr2nlsGdd4UPALCaJGVs\nPoL/ljhOm2ZLIW3YJXoj2sd6Dr22N304l3qPrKFtS5WPZ9lVia6ntNW+0Ga2upk5\nma8v3o8BiCu+EqaRlf9h+2MJhu9cvqCNyal3jOd27mZjQD8oXt+eFtIZE6IfushE\nrXXpmEqZPCJcXd5qYJmyQA5a8OWqajFt+Vln1vW9MaJFwOA+9pqxHI8UCLDGbcL4\nGVNmod3xAgMBAAECggEAOzknBPvx5Ek0/NYECvC+W/hCnfxe/b9zOoAdrATWKgGD\nK0mZPWRVPEjBm9GX1nacLoWxlSFhIt5xqRhC7gBxIaWh1Z0wXBGaw9KMFYXqQWhZ\nBd3lCvSe1G4JlAmdmQz6BCZso7Jg+I1F0pDpIfe5bcq/1HpL0LhOqdOdqMTCco6U\npbpgg3JBX14cH4pe5NtM3Y2COB6Nt1plSdbVK7SdvI6XvTejwv2amQV8e3rG0pHT\nrJ8xPWQwqN0B9plq7A3XQKXMnbkfE9rzVVP04W5sSt+S1ooAzdu6DwKSub0SlVSD\n2S/Wdu7Fw2M3O+Ij/2UCHSmWbhKIBhqjwhFVrwbdPwKBgQDzo9rcwNYkU980WTA/\nd0d+f0WMMIrp5Wmrqt0MZTD/Oomq5C3BBLZBOUhs5TgE5UHmxIPL9rv2jUhwpHrK\n8BPfjcHzVTZ2WPyH6zD8g0wEcVu5UkEGIS7vLq0LtWxugveZrYqrVSjb/aT8GmDR\nKg7xX4hdb+ORMw/BNyDwkuntnwKBgQDDqKhr/otDe5/V1wHUy2KGHxurB8L+RvuF\n9kwYg6dcJEJ5da/NRGS0698UEtDFE3kWVoFd+/ZrQl2EQ6hubFKMx2Tp0yPNFqfb\n5EA8C9TC4DstibZfMwZMoJ0KtkXHv/O8Yu1ZPOJgZHKorHqlEB1oSIlvCXdFNlKn\nYVdnFzBqbwKBgF8R8CQ15xmz1KQTrV0GiVJWDWhfxMTyLSK8gJcGoXDmgbO6aBQq\nZ4fZ92Xup8ZZQzbuNdOQCtZxWPQDaprnxYl1QlpWRPM3VAshfjL6dN5C8ZzF+POQ\nXUUdvI6WE6Kn3kAMVND4YQI+3nM1Q9Q6iiwrsAVt1Kni9+HYRjU5zqhXAoGAOGeN\nrhxib2DbMh1alMrRK1MaedKx/vXdmr/nLgX+IEz/sN4hgS5fTdzVoYbPEpFLjgoA\nH2T8o+0s4m1SyAqIPbdZuyK4Jm6Kk5SYg/bxLgDQbo9NuOIPxdVjkGv9b9lBXaSz\nQc+QfzNV7pRSgvVDVQXcQNtcu+IuL7ybIsgHmBcCgYAFADacHxyPdYFA8TPZtfFm\niqlfh13gvsZyA6YVrL0gApWzTOTCYVTf14Kip/vl32NyBalChugrLpC5NF/CrjWS\nnYvsSQ0IcuQzWIKX1EDKFMCtKbZeOnSDECmUvOgtzdQgmCwibRWqhHtx8K9hqSk9\n9LQJDXvAhQNsslxtv8Oozg==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-xeyjy@yeh-hai-14364.iam.gserviceaccount.com",
    "client_id": "113547181977491993853",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xeyjy%40yeh-hai-14364.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  })});


server.use(cors());
server.use(express.json({ limit: "50mb" }));

//cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_SECRET_KEY,
});

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

server.use("/api/v1",blogsRouter,usersRouter);

server.post("/like-blog",verifyJWT, (req,res)=>{
    const user_id = req.user;
    const {id, isLikedByUser} = req.body;

    const incrementalVal = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({id},{$inc : {"activity.total_likes" : incrementalVal}})
    .then(blog => {

        if(!isLikedByUser){
            const like = new Notification({
                type:"like",
                blog:id,
                notification_for:blog.author,
                user :user_id
            });

            like.save().then(notification => {
                return res.status(200).json({liked_by_user :true});
            })
        }else{
            Notification.findOneAndDelete({user : user_id, blog: id,type:"like"})
            .then(data => {
                return res.status(200).json({liked_by_user : false})
            })
            .catch(err => {
                return res.status(500).json({"error":err.message});
            })
        }

    })

});

server.post("/isliked-by-user", verifyJWT , (req,res) => {
    const user_id = req.user;

    const {id} = req.body;

    // we will check in the notification
    Notification.exists({user:user_id,type:"like",blog:id})
    .then(result => {
        return res.status(200).json({result});
    })
    .catch(err => {
        return res.status(500).json({"error":err.message})
    });
});

server.post("/add-comment",verifyJWT,(req,res) => {
    const user_id = req.user;

    const {id, comment, replying_to, blog_author} = req.body;

    if(!comment.length){
        return res.status(403).json({"error":"write something to leave a comment"});
    }

    // creating a comment doc
    const commentObj =new Comment({
        blog_id: id, blog_author,comment, commented_by:user_id
    });

    if(replying_to){
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async commentFile => {

        const {comment,commentedAt,children} = commentFile;
        Blog.findOneAndUpdate({id},{$push : {"comment":commentFileid}, $inc: {"activity.total_comments" : 1, "activity.total_parent_comments":replying_to ? 0 : 1}}).then(blog => {console.log("New comment created!")})

        const notificationObj = {
            type:replying_to ? "reply":"comment",
            blog:id,
            notification_for:blog_author,
            user:user_id,
            comment:commentFileid
        }

        if(replying_to){
            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate({id:replying_to},{$push : {children : commentFileid}}).then(replyingToCommentDoc => {
                notificationObj.notification_for = replyingToCommentDoc.commented_by;
            });
        }

        new Notification(notificationObj).save().then(notification => console.log('new notification created'));
        return res.status(200).json({
            comment,commentedAt,id:commentFileid,user_id,children
        });


    }).catch(err => {
        return res.status(500).json({error:err.message});
    })


});

server.post("/get-blog-comments",(req,res) => {
    const {blog_id,skip} = req.body;

    const maxLimit = 5;

    Comment.find({blog_id,isReply:false}).populate("commented_by","personal_info.username personal_info.fullname personal_info.profile_img").skip(skip).limit(maxLimit).sort({'commentedAt':-1}).then(comment => {
        return res.status(200).json(comment);
    }).catch(err => {
        return res.status(500).json({error: err.message});
    })
});

server.post("/get-replies",(req,res)=>{
    const {id,skip} =req.body;

    const maxLimit = 5;

    Comment.findOne({id}).populate({path:"children",option:{
        limit:maxLimit,
        skip:skip,
        sort:{'commentedAt' : -1}
    },populate:{
        path:"commented_by",
        select:"personal_info.profile_img personal_info.fullname personal_info.username"
    },
    select:"-blog_id -updatedAt"
    }).select("children").then(doc => {
        return res.status(200).json({replies:doc.children});
    }).catch((err)=>{
        return res.status(500).json({error:err.message});
    })
});

const deleteComments = (id) => {
    Comment.findOneAndDelete({id})
    .then(comment => {

        if(comment.parent){
            Comment.findOneAndUpdate({id:comment.parent}, {$pull:{children: id}})
            .then(data => console.log("comment delte from parent"))
            .catch(err => {
                console.log("failed to delete comment");
            })
        }

        Notification.findOneAndDelete({comment : id}).then(notification => console.log("Notification comment deleted"));
        Notification.findOneAndDelete({reply : id}).then(notification => console.log("Notification reply deleted"));


        Blog.findOneAndUpdate({id : comment.blog},{$pull : {comments : id},$inc : {"activity.total_comment":-1,"activity.total_parent_comments":comment.parent ? 0 : -1}})
        .then(blog => {
            if(comment.children.length){
                comment.children.map(replies => {
                    deleteComments(replies);
                })
            }
        })
    }).catch(err => console.log(err.message));
}

server.post("/delete-comment",verifyJWT ,(req,res)=>{
    const user_id = req.user;
    const {id} = req.body;

    Comment.findOne({id}).then(comment => {
        if(user_id == comment.commented_by || user_id == comment.blog_author){
            deleteComments(id);
            return res.status(200).json({status : "done"});
        }else{
            return res.status(403).json({error: "You cann't delete this comment"})
        }
    })
});

server.get("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
  });

server.use(ErrorMiddleware)

server.listen(PORT,()=>{
    console.log('Listening to port --> '+ PORT);

    // connect mysql db
    sequelize.authenticate().then(()=>{
        console.log("Sequelize Authenticated");
    }).catch( (err )=>{
        console.log(`Error = ${err}`);
    });
});