import React, { useEffect, useState } from "react";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation, { activeTabLineRef, activeTabRef } from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBannerPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";

const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingBlogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");

  const categories = [
    "programming",
    "hollywood",
    "film making",
    "social media",
    "cooking",
    "technology",
    "finances",
    "travel",
  ];

  const fetchLatestBlogs = ({page = 1}) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs",{page })
      .then(async({ data }) => {
        const formatData = await filterPaginationData({
          state:blogs,
          data:data,
          page,
          countRoute:"/all-latest-blogs-count",

        })
        setBlogs(formatData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const fetchTrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const fetchBlogsByCategory = ({page = 1} ) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs",{tag:pageState,page})
      .then(async({ data }) => {
        const formatData = await filterPaginationData({
          state:blogs,
          data:data,
          page,
          countRoute:"/search-blogs-count",
          data_to_send :{tag:pageState}
        })
        setBlogs(formatData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  const loadBlogByCategory = (e) => {
    const category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if(pageState == category){
        setPageState("home");
        return;
    }

    setPageState(category);
  }

  useEffect(() => {
    activeTabRef.current.click();
    activeTabLineRef.current.click();
    
    if(pageState == 'home'){
        fetchLatestBlogs({page:1});
    }else{
        fetchBlogsByCategory({page:1});
    }

    if(!trendingBlogs){
        fetchTrendingBlogs();
    }
  }, [pageState]);
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blogs */}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "Trending Blogs"]}
            defaultHidden={["Trending Blogs"]}
          >
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
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                }) : <NoDataMessage message="No Blog Published" />
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState == 'home'? fetchLatestBlogs :fetchBlogsByCategory)}/>
            </>

            {trendingBlogs == null ? (
              <Loader />
            ) : (
              trendingBlogs.length ? 
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimalBannerPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              }) : <NoDataMessage message="No Trending Blog Published" />
            )}
          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>
              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button className={"tag " + (pageState == category ? "bg-black text-white ":"" )} key={i} onClick={loadBlogByCategory}>
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending<i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : (
                trendingBlogs.length ? 
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <MinimalBannerPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                }) : <NoDataMessage message="No Trending Blog Published" />
              )}
            </div>
          </div>
        </div>
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
