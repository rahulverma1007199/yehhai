import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { getDay } from '../common/date';
import BlogInteraction from '../components/blog-interaction.component';
import BlogPostCard from '../components/blog-post.component';
import BlogContent from '../components/blog-content.component';
import CommentsContainer, { fetchComments } from '../components/comments.component';

export const blogStructure = {
    title:'',
    des:'',
    content:{
        blocks:[]
    },
    user:{
    },
    activity:{},
    banner : '',
    createdAt:''
}

export const BlogContext = createContext({});

const BlogPage = () => {

    const {blog_id} = useParams();

    const [blog,setBlog] = useState(blogStructure);
    const [similarBlogs,setSimilarBlogs] = useState(null);
    const [loading,setLoading] = useState(true);
    const [isLikedByUser,setIsLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(true);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const {title,content,banner,user:{profile_img,fullname, username:author_username},createdAt} = blog;
    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog",{blog_id})
      .then(async ({ data }) => {
          // data.comments = await fetchComments({blog_id:data.id,setParentCommentCountFun:setTotalParentCommentsLoaded});
        data.comments ={};
        setBlog(data);
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",{tag:data?.tags[0],limit: 6, eliminate_blog : blog_id})
        .then(({data}) => {
            setSimilarBlogs(data);
        }).catch((err) => {
            setLoading(false);
            console.log(err.message);
          });

        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err.message);
      });
    }

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    }

    useEffect(() => {
        resetStates();
        fetchBlog();
    }, [blog_id]);

  return (
    <AnimationWrapper>
        {
            loading ? <Loader/> :
            <BlogContext.Provider value={{blog,setBlog,isLikedByUser,setIsLikedByUser,commentsWrapper,setCommentsWrapper,totalParentCommentsLoaded,setTotalParentCommentsLoaded}}>
                {/* <CommentsContainer /> */}
                <div className='max-w-[900px] center py-10 max-lg:px-[5vw]'>
                    <img src={banner} className='aspect-video' alt="" />

                    <div className='mt-12'>
                        <h2>{title}</h2>

                        <div className='flex max-sm:flex-col justify-between my-8'>
                            <div className='flex gap-5 items-start'>
                                <img src={profile_img} className='w-12 h-12 rounded-full' alt="" />
                                <p className=''>
                                    {fullname}
                                    <br />
                                    @
                                    <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                                </p>
                            </div>
                            <p className='text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5'>Published on {getDay(createdAt)}</p>
                        </div>
                    </div>

                    <BlogInteraction />

                    <div className='my-12 font-gelasio blog-page-content'>
                        {
                            content?.blocks.map((block,i)=>{
                                return <div key={i} className='my-4 md:my-8'>
                                    <BlogContent block={block}/>
                                </div>
                            })
                        }
                    </div>

                    <BlogInteraction />

                    {
                        similarBlogs !== null && similarBlogs.length ?
                            <>
                                <h1 className='text-2xl mt-14 mb-10 font-medium'>Similar Blogs</h1>
                                {
                                    similarBlogs.map((blog,i)=>{
                                        const {author:{personal_info}} =blog;
                                        return (
                                        <AnimationWrapper key={i} transition={{duration:1, delay:i * 0.08}}>
                                            <BlogPostCard content={blog} author={personal_info} />
                                        </AnimationWrapper>)
                                    })
                                }
                            </>
                        : ""
                    }

                </div>
            </BlogContext.Provider>
        }
    </AnimationWrapper>
  )
}

export default BlogPage