import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../App';
import { filterPaginationData } from '../common/filter-pagination-data';
import { Toaster } from 'react-hot-toast';
import InPageNavigation from '../components/inpage-navigation.component';
import Loader from '../components/loader.component';
import NoDataMessage from '../components/nodata.component';
import AnimationWrapper from '../common/page-animation';
import { ManageDraftBlogCard, ManagePublishedBlogCard } from '../components/manage-blogcard.component';
import LoadMoreDataBtn from '../components/load-more.component';
import { useSearchParams } from 'react-router-dom';

const ManageBlogs = () => {

    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState("");

    const activeSearchParam = useSearchParams()[0].get("tab");
    const {userAuth,setUserAuth,userAuth:{access_token}} = useContext(UserContext);

    const getBlogs = ({page,draft, deletedDocCount  = 0}) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",{page,draft,query,deletedDocCount},{
            headers:{
                'Authorization':`Bearer ${access_token}`
            }
        }).then(async ({data}) =>{

            const formatedData =await filterPaginationData({state:draft ? drafts : blogs , data:data.blogs, page, user:access_token,countRoute:"/user-written-blogs-count",data_to_send:{draft,query}});

            if(draft){
                setDrafts(formatedData);
            }else{
                setBlogs(formatedData);
            }

        }).catch((err)=>{
            console.log(err.message);
        })

    }

    useEffect(()=>{

        if(access_token){

            if(blogs == null){

                getBlogs({page:1,draft:false});
            
            }
            if(drafts == null){

                getBlogs({page:1,draft:true});

            }

        }

    },[access_token,blogs,drafts,query]);

    const handleChange = (e) => {

        if(!e.taget.value.length){
            setBlogs(null);
            setDrafts(null);
            setQuery("");
        }else{

        }

    }

    const handleSearch = (e) => {

        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if(e.keyCode == 13 && searchQuery.length){
            setBlogs(null);
            setDrafts(null);
        }
    }

  return (
    <>
        
        <h1 className='max-md:hidden'>Manage Blogs</h1>

        <Toaster />

        <div className='relative max-md:mt-5 md:mt-8 mb-10'>

            <input 
                type="text" 
                className='w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey'
                placeholder='Search Blogs'
                onChange={handleChange}
                onKeyDown={handleSearch}
            />

            <i
                className='fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey'
            ></i>

        </div>

        <InPageNavigation routes={["Published Blogs", "Drafts"]} defaultActiveIndex={activeSearchParam !== 'draft' ? 0 : 1}>

            {//Published Blogs

                blogs == null ? <Loader /> :
                blogs.results.length ?
                    
                    <>
                        {
                            blogs.results.map((blog,i)=>{
                                return <AnimationWrapper key={i} transition={{delay: i * 0.04}}>
                                    <ManagePublishedBlogCard blog={{...blog,index:i,setStateFun:setBlogs }} />
                                </AnimationWrapper>
                            })
                        }

                        <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} additionalParam={{drafts:false,deletedDocCount:blogs.deletedDocCount}} />
                    </>

                : <NoDataMessage message="No published blogs" />

            }

            {//Draft Blogs

            drafts == null ? <Loader /> :
            drafts.results.length ?
                
                <>
                    {
                        drafts.results.map((blog,i)=>{
                            return <AnimationWrapper key={i} transition={{delay: i * 0.04}}>
                                <ManageDraftBlogCard blog={{...blog,index:i,setStateFun:setDrafts }} />
                            </AnimationWrapper>
                        })
                    }

                    <LoadMoreDataBtn state={drafts} fetchDataFun={getBlogs} additionalParam={{drafts:true,deletedDocCount:drafts.deletedDocCount}} />
                </>

            : <NoDataMessage message="No draft blogs" />

            }

        </InPageNavigation>

    </>
  )
}

export default ManageBlogs