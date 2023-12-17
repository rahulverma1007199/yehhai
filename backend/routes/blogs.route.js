import express from "express";
import { allLatestBlogsCount, createBlog, getBlog, latestBlogs, searchBlogs, searchBlogsCount, trendingBlogs } from "../controllers/blog.controller.js";
import { verifyJWT } from "../middleware/auth.js";

const blogsRouter = express.Router();

blogsRouter.post("/create-blog",verifyJWT,createBlog);
blogsRouter.get("/trending-blogs",trendingBlogs);
blogsRouter.post("/latest-blogs",latestBlogs);
blogsRouter.post("/all-latest-blogs-count",allLatestBlogsCount);
blogsRouter.post("/get-blog",getBlog);
blogsRouter.post("/search-blogs",searchBlogs);
blogsRouter.post("/search-blogs-count",searchBlogsCount);

export default blogsRouter;
