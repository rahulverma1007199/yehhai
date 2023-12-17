import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from '../components/inpage-navigation.component';
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import Loader from "../components/loader.component";
import axios from 'axios';
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import UserCard from '../components/usercard.component';


const SearchPage = () => {

    const {query} = useParams();
    const [blogs,setBlogs] = useState(null);
    const [users,setUsers] = useState(null);

    const searchBlogs = ({page = 1 , create_new_arr = false}) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",{query,page })
        .then(async({ data }) => {
            const formatData = await filterPaginationData({
                state:blogs,
                data:data,
                page,
                countRoute:"/search-blogs-count",
                data_to_send:{ query },
                create_new_arr
            })
            setBlogs(formatData);
        })
        .catch((err) => {
            console.log(err.message);
        });
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users",{query })
        .then(({ data:{users }}) => {
            setUsers(users);
        })
        .catch((err) => {
            console.log(err.message);
        });
    }

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }

    useEffect(() => {
        resetState();
        fetchUsers();
        searchBlogs({page:1, create_new_arr : true})
      }, [query]);

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                    users.length ? users.map((user,i)=>(
                        <AnimationWrapper key={i} transition={{duration:1,delay:i*0.08}}>
                            <UserCard user={user} />
                        </AnimationWrapper>
                    )) :  <NoDataMessage message="No user found!"/> 
                }
            </>
        )
    }

  return (
    <section className='h-cover flex justify-center gap-10'>
        <div className='w-full'>
            <InPageNavigation routes={[`Search Results for "${query}"`,"Accounts Matches"]} defaultHidden={['Accounts Matches']}>
                <>
                {blogs == null ? (
                <Loader />
              ) : (
                blogs.results.length ? 
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper transition={{ duration: 1, delay: i * 0.1 }} >
                      <BlogPostCard
                        key={i}
                        content={blog}
                        author={blog.user}
                      />
                    </AnimationWrapper>
                  );
                }) : <NoDataMessage message="No Blog Published" />
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs}/>
                </>

                <UserCardWrapper />

            </InPageNavigation>
        </div>

        <div className='min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden'>
                <h1 className='font-medium text-xl mb-8'>User related to search <i className='fi fi-rr-user mt-1'></i></h1>
                <UserCardWrapper />

        </div>
    </section>
  )
}

export default SearchPage