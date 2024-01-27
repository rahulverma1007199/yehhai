import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from "jsonwebtoken";
import cors from 'cors';
import admin from 'firebase-admin';
import {getAuth} from 'firebase-admin/auth';
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";

import serviceAccountKey from './yeh-hai-14364-firebase-adminsdk-xeyjy-746e1f0b76.json' assert { type: "json" };import getS3URL from './util/aws.js';
;

const server = express();
const PORT = 3000;

admin.initializeApp({credential:admin.credential.cert(serviceAccountKey)});

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(cors());
server.use(express.json());

mongoose.connect(process.env.DB_URL,{
    autoIndex:true
}).then(()=>{
    console.log("connected")
}).catch(err => {
    console.log("failed")
});

//seting up s3 bucket
// const s3 = new aws.S3({
//     region:'ap-south-1',
//     accessKeyId:process.env.AWS_SECRET_KEY,
//     secretAccessKey:process.env.AWS_ACCESS_KEY
// });

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
    const imageName = `${nanoid()}-${Date.now()}.jpeg`;

    getS3URL(imageName).then(url => res.status(200).json({"uploadURL":url})).catch(err => {
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
            if(!user.google_auth){
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

server.post("/change-password", verifyJWT, (req,res)=>{
    const {currentPassword,newPassword} = req.body;

    if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
        return res.status(403).json({"error":"Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters"});
    }

    User.findOne({_id:req.user}).then(
        (user) => {

            if(user.google_auth){
                res.status(403).json({error:"you can't change account's password because you logged in thorugh google"});
            }

            bcrypt.compare(currentPassword,user.personal_info.password,(err, result)=> {

                if(err){
                    return res.status(500).json({"error":"Some error occured while changing the password, please try again later"});
                }

                if(!result){
                    return res.status(403).json({"error":"Incorrect Password"});
                }

                bcrypt.hash(newPassword, 10, (err, hashed_password)=>{

                    User.findOneAndUpdate({_id:req.user}, {"personal_info.password":hashed_password})
                    .then((u)=>{
                        return res.status(200).json({status:"Password Changed"});
                    })
                    .catch(err => {
                        return res.status(500).json({error: "Some error occured while saving the password, please try again later"});
                    })
                });


            });
        }
    )
    .catch(err => {
        return res.status(403).json({error:"No User Found"});
    });
});

server.post("/search-blogs",(req,res)=>{
    const {tag,query,page,author,limit,eliminate_blog} = req.body;

    let findQuery;

    if(tag){
        findQuery = {tags :tag, draft:false,blog_id:{$ne:eliminate_blog}};
    }else if(query){
        findQuery = {draft:false, title: new RegExp(query, 'i')};
    }else if(author){
        findQuery = {draft:false, author};
    }

    const maxQuery = limit ? limit : 2;

    Blog.find(findQuery)
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt" : -1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip(maxQuery * (page - 1))
    .limit(maxQuery).then((blogs)=>{
        return res.status(200).json(blogs);
    })
    .catch(err=>{
        return res.status(500).json({"error":err.message});
    })

});

server.post("/get-profile",(req,res)=>{
    const {username} = req.body;
    User.findOne({"personal_info.username":username})
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
        return res.status(200).json(user);
    }).catch((err)=>{
        return res.status(500).json({error:err.message});
    })
});

server.post("/search-users", (req,res)=>{
    const {query} = req.body;

    User.find({"personal_info.username" : new RegExp(query,"i")})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users => {
        return res.status(200).json({users});
    })
    .catch(err => {
        return res.status(500).json({err:err.message});
    })
});

server.get("/trending-blogs",(req,res)=>{
    const maxLimit = 5;

    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_read" : -1,"activity.total_likes" : -1,"publishedAt" : -1})
    .select("blog_id title publishedAt -_id")
    .limit(maxLimit).then((blogs)=>{
        return res.status(200).json(blogs);
    })
    .catch(err=>{
        return res.status(500).json({"error":err.message});
    })

});

server.post("/latest-blogs" , (req,res)=>{
    const {page} = req.body;
    const maxLimit = 1;
    Blog.find({draft:false})
    .populate("author","personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt" : -1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip(maxLimit * (page - 1))
    .limit(maxLimit).then((blogs)=>{
        return res.status(200).json(blogs);
    })
    .catch(err=>{
        return res.status(500).json({"error":err.message});
    })
});

server.post("/all-latest-blogs-count" , (req,res)=>{
    Blog.countDocuments({draft:false})
    .then(count => {
        return res.status(200).json({totalDocs : count});
    }).catch(err => {
        return res.status(500).json({"error":err.message});
    })
});

server.post("/search-blogs-count" , (req,res)=>{
    const {tag,author,query} = req.body;

    let findQuery;

    if(tag){
        findQuery = {tags :tag, draft:false};
    }else if(query){
        findQuery = {draft:false, title: new RegExp(query, 'i')};
    }else if(author){
        findQuery = {draft:false, author};
    }

    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({totalDocs : count});
    }).catch(err => {
        return res.status(500).json({"error":err.message});
    })
});

server.post("/create-blog",verifyJWT, (req,res)=>{
    const autherID = req.user;
    
    let {title,des, banner, tags, content,draft = undefined,id} = req.body;

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

    const blog_id = id || title.replace(/[^a-zA-Z0-9]/g,'').replace(/\s+/g,"-").trim() + nanoid();

    if(id){
        Blog.findOneAndUpdate({blog_id}, {title,des, banner, tags, content ,draft : draft ? draft : false})
        .then(blog => {
            return res.status(200).json({id : blog_id});
        }).catch(err => {
            return res.status(500).json({"error":err.message});
        })
    }
    else{
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
    }


});

server.post("/get-blog", (req,res)=>{
    const {blog_id,draft,mode} = req.body;

    const incrementalVal = mode !== 'edit' ? 1 : 0;

    Blog.findOneAndUpdate({blog_id}, {$inc : {"activity.total_reads": incrementalVal}})
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags")
    .then(blog => {

        User.findOneAndUpdate({"personal_info.username" :blog?.author.personal_info.username},{
            $inc : {"account_info.total_reads" : incrementalVal}
        }).catch(err => {
            return res.status(500).json({error : err.message});
        })

        if(blog.draft && !draft){
            return res.status(500).json({error : "you cann't access draft blog"});
        }

        return res.status(200).json(blog);
    })
    .catch(err => {
        return res.status(500).json({error : err.message});
    })
});

server.post("/like-blog",verifyJWT, (req,res)=>{
    const user_id = req.user;
    const {_id, isLikedByUser} = req.body;

    const incrementalVal = !isLikedByUser ? 1 : -1;

    Blog.findOneAndUpdate({_id},{$inc : {"activity.total_likes" : incrementalVal}})
    .then(blog => {

        if(!isLikedByUser){
            const like = new Notification({
                type:"like",
                blog:_id,
                notification_for:blog?.author,
                user :user_id
            });

            like.save().then(notification => {
                return res.status(200).json({liked_by_user :true});
            })
        }else{
            Notification.findOneAndDelete({user : user_id, blog: _id,type:"like"})
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

    const {_id} = req.body;

    // we will check in the notification
    Notification.exists({user:user_id,type:"like",blog:_id})
    .then(result => {
        return res.status(200).json({result});
    })
    .catch(err => {
        return res.status(500).json({"error":err.message})
    });
});

server.post("/add-comment",verifyJWT,(req,res) => {
    const user_id = req.user;

    const {_id, comment, replying_to, blog_author,notification_id} = req.body;

    if(!comment.length){
        return res.status(403).json({"error":"write something to leave a comment"});
    }

    // creating a comment doc
    const commentObj = new Comment({
        blog_id: _id, blog_author,comment, commented_by:user_id
    });

    if(replying_to){
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }

    new Comment(commentObj).save().then(async commentFile => {

        const {comment,commentedAt,children} = commentFile;
        Blog.findOneAndUpdate({_id},{$push : {"comments":commentFile._id}, $inc: {"activity.total_comments" : 1, "activity.total_parent_comments":replying_to ? 0 : 1}}).then(blog => {console.log("New comment created!")}).catch(err=>{
            console.log({error:err.message});
        })

        const notificationObj = {
            type:replying_to ? "reply":"comment",
            blog:_id,
            notification_for:blog_author,
            user:user_id,
            comment:commentFile._id
        }

        if(replying_to){
            notificationObj.replied_on_comment = replying_to;

            await Comment.findOneAndUpdate({_id:replying_to},{$push : {children : commentFile._id}}).then(replyingToCommentDoc => {
                notificationObj.notification_for = replyingToCommentDoc.commented_by;
            });

            if(notification_id){
                Notification.findOneAndUpdate({_id:notification_id},{reply:commentFile._id}).then(notificaion => console.log('notification updated'));
            }
        }

        new Notification(notificationObj).save().then(notification => console.log('new notification created'));
        return res.status(200).json({
            comment,commentedAt,_id:commentFile._id,user_id,children
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
    const {_id,skip} =req.body;

    const maxLimit = 5;

    Comment.findOne({_id}).populate({path:"children",options:{
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

const deleteComments = (_id) => {
    Comment.findOneAndDelete({_id})
    .then(comment => {

        if(comment.parent){
            Comment.findOneAndUpdate({_id:comment.parent}, {$pull:{children: _id}})
            .then(data => console.log("comment delte from parent"))
            .catch(err => {
                console.log("failed to delete comment");
            })
        }

        Notification.findOneAndDelete({comment : _id}).then(notification => console.log("Notification comment deleted"));
        Notification.findOneAndUpdate({reply : _id},{$unset:{reply:1}}).then(notification => console.log("Notification reply deleted"));


        Blog.findOneAndUpdate({_id : comment.blog},{$pull : {comments : _id},$inc : {"activity.total_comment":-1,"activity.total_parent_comments":comment.parent ? 0 : -1}})
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
    const {_id} = req.body;

    Comment.findOne({_id}).then(comment => {
        if(user_id == comment.commented_by || user_id == comment.blog_author){
            deleteComments(_id);
            return res.status(200).json({status : "done"});
        }else{
            return res.status(403).json({error: "You cann't delete this comment"})
        }
    })
});

server.post("/update-profile-url", verifyJWT, (req,res)=>{
    const { url } = req.body;

    User.findOneAndUpdate({_id:req.user},{"personal_info.profile_img":url})
    .then(()=>{
        return res.status(200).json({profile_img : url});
    }).catch(err => {
        return res.status(500).json({error : err.message});
    })
});

server.post("/update-profile", verifyJWT, (req,res)=>{
    const { username,bio, social_links } = req.body;

    const bioLimit = 150;

    if(username.length < 3) {
        return toast.error("Username should be at-least 3 letters long");
    }

    if(bio.length > bioLimit){
        return toast.error(`Bio should not be more than ${bioLimit}`);
    }

    const socialLinksArr =  Object.keys(social_links);

    try {
        
        for(let i = 0; i < socialLinksArr.length ; i ++) {
            if(social_links[socialLinksArr[i]].length){
                const hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if(!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== 'website'){
                    return res.status(403).json({error : `${socialLinksArr[i]} link is invalid. You must enter a full link`});
                }
            }
        }

    } catch (error) {
        return res.status(500).json({error : "You must provide full social links with http(s) included "});
    }

    const updateObj = {
        "personal_info.username" : username,
        "personal_info.bio" : bio,
        social_links
    }


    User.findOneAndUpdate({_id:req.user},updateObj , {
        runValidators:true
    })
    .then(()=>{
        return res.status(200).json({username});
    }).catch(err => {
        if(err.code = 11000){
            return res.status(409).json({error: 'username is already taken'});
        }
        return res.status(500).json({error : err.message});
    })
});

server.get("/new-notification",verifyJWT,(req,res)=>{

    const user_id = req.user;

    Notification.exists({notification_for:user_id,seen:false, user:{$ne:user_id}}).then(result => {
        let newNotification = false;
        if(result){
            newNotification = true;
        }

        return res.status(200).json({new_notification_available:newNotification});
    }).catch(err => {
        console.log(err.message);
        return res.status(500).json({"error":err.message});
    })

});

server.post('/notifications',verifyJWT,(req,res)=>{

    const user_id = req.user;
    const {page, filter, deletedDocCount} = req.body;

    const maxLimit = 10;

    const findQuery = {notification_for:user_id,user:{$ne:user_id}};

    let skipDocs = ( page - 1 ) * maxLimit;

    if(filter !== 'all'){
        findQuery.type = filter;
    }

    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate('blog','title blog_id')
    .populate('user','personal_info.fullname personal_info.username personal_info.profile_img')
    .populate('comment','comment')
    .populate('replied_on_comment','comment')
    .populate('reply','comment')
    .sort({createdAt:-1})
    .select("createdAt type seen reply")
    .then(notifications => {

        Notification.updateMany(findQuery,{seen:true}) .skip(skipDocs)
        .limit(maxLimit).then(() => {console.log('notification seen')});

        return res.status(200).json({notifications});
    }).catch(err=>{
        return res.status(500).json({error:err.message});
    })

});


server.post('/all-notifications-count',verifyJWT,(req,res)=>{

    const user_id = req.user;

    const {filter} = req.body;

    const findQuery = {notification_for:user_id,user:{$ne:user_id}};

    if(filter !== 'all'){
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({totalDocs : count});
    })
    .catch(err => {
        return res.status(500).json({'error':err.message});
    })


});
server.listen(PORT,()=>{
    console.log('Listening to port --> '+ PORT);
});