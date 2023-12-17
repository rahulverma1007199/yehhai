import { CatchAsyncError } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { nanoid } from 'nanoid';
import {v2 as cloudinary} from 'cloudinary';
import {Blogs,Users} from "../db/models/index.model.js"
import { Op, cast, col, fn, literal } from "sequelize";

export const sampleTest = CatchAsyncError(async (req,res,next)=>{
    try {

    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const createBlog = CatchAsyncError(async (req,res,next)=>{
    try {
        const autherID = req.user.id;

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
    
        if(banner && !banner?.startsWith("https")){
            const myCloud = await cloudinary.uploader.upload(banner,{folder:"blog",});
            banner = myCloud.secure_url;
        }
    
        if(id){
            await Blogs.update({title,des, banner, tags, content ,draft : draft ? draft : false},{where:{blog_id}})
            return res.status(200).json({id : blog_id});
    
        }
        else{
            const blog = await Blogs.create({title,des,content,banner,tags,author:autherID,blog_id,draft:Boolean(draft)});
    
            const incrementalVal = draft ? 0 : 1;
            
            await Users.increment('total_posts',{by:incrementalVal, where: { id: autherID }});

            return res.status(200).json({id : blog.id});
        }
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const trendingBlogs = CatchAsyncError(async (req,res,next)=>{
    try {
    const maxLimit = 5;
    const blogs = await Blogs.findAll({
        where: { draft: false },
        include: [
          {
            model: Users,
            attributes: ['profile_img', 'username', 'fullname'],
          },
        ],
        order: [
          ['total_reads', 'DESC'],
          ['total_likes', 'DESC'],
          ['createdAt', 'DESC'],
        ],
        attributes: ['blog_id', 'title', 'createdAt'],
        limit: maxLimit,
      });

      return res.status(200).json(blogs);
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const latestBlogs = CatchAsyncError(async (req,res,next)=>{
    try {
        const {page} = req.body;
        const maxLimit = 5;

        const blogs = await Blogs.findAll({
            where: { draft: false },
            include: [
              {
                model: Users,
                attributes: ['profile_img', 'username', 'fullname'],
              },
            ],
            order: [['createdAt', 'DESC']],
            attributes: ['blog_id', 'title', 'des', 'banner', 'total_likes','total_comments','total_reads','total_parent_comments', 'tags', 'createdAt'],
            offset: maxLimit * (page - 1),
            limit: maxLimit,
          });
        return res.status(200).json(blogs);

    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const allLatestBlogsCount = CatchAsyncError(async (req,res,next)=>{
    try {
        const count=await Blogs.count({ where: { draft: false }, });
        return res.status(200).json({totalDocs : count});
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const getBlog = CatchAsyncError(async (req,res,next)=>{
    try {
        const {blog_id,draft,mode} = req.body;
        const incrementalVal = mode !== 'edit' ? 1 : 0;

        const blog = await Blogs.findOne({
            where: { blog_id},
            include: [ {   model: Users,   attributes: ['fullname', 'username', 'profile_img'], },],
            attributes: ['title', 'des', 'content', 'banner',  'total_likes','total_comments','total_reads','total_parent_comments', 'createdAt', 'blog_id', 'tags'],
          });

        if(blog.draft && !draft){
            return res.status(500).json({error : "you cann't access draft blog"});
        }
        await Blogs.increment('total_reads',{by:incrementalVal, where: { blog_id}});
        await Users.increment('total_reads',{by:incrementalVal, where: { username: blog.user.username }});

        return res.status(200).json(blog);

    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const searchBlogs = CatchAsyncError(async (req,res,next)=>{
    try {
        const {tag,query,page,author,limit,eliminate_blog} = req.body;

        let findQuery = {};
    
        if (tag) {
          if(eliminate_blog){
            findQuery = literal(`JSON_CONTAINS(tags, '["${tag}"]') AND draft = false AND blog_id != ${eliminate_blog}`);
          }else{
            findQuery = literal(`JSON_CONTAINS(tags, '["${tag}"]') AND draft = false `);
          }
        } else if (query) {
          findQuery = {
            draft: false,
            title: { [Op.like]: `%${query}%` },
          };
        } else if (author) {
          findQuery = {
            draft: false,
            author: author,
          };
        }
        
        const maxQuery = limit ? limit : 5;
        
        const blogs = await Blogs.findAll({
          where: findQuery,
          include: [
            {
              model: Users,
              attributes: ['profile_img', 'username', 'fullname'],
            }
          ],
          attributes: ['blog_id', 'title', 'des', 'banner','total_likes','total_comments','total_reads','total_parent_comments', 'tags', 'createdAt'],
          order: [['createdAt', 'DESC']],
          offset: maxQuery * (page - 1),
          limit: maxQuery,
        });
    
        return res.status(200).json(blogs);
    
    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});

export const searchBlogsCount = CatchAsyncError(async (req,res,next)=>{
    try {
        const {tag,author,query} = req.body;

        let findQuery = {
            where: {
              draft: false,
            },
          };

        if (tag) {
            findQuery.where.tags = tag;
          } else if (query) {
            findQuery.where.title = { [Op.like]: `%${query}%` };
          } else if (author) {
            findQuery.where.author = author;
          }

        const count = await Blogs.count(findQuery);
        return res.status(200).json({totalDocs : count});

    }
    catch (error) {
        return next(new ErrorHandler(error.message,404));
    }
});