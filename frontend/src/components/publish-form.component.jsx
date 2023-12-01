import React, { useContext } from 'react'
import AnimationWrapper from '../common/page-animation'
import { Toaster, toast } from 'react-hot-toast'
import { EditorContext } from '../pages/editor.pages'
import Tag from './tags.component'
import axios from 'axios'
import { UserContext } from '../App'
import { useNavigate, useParams } from 'react-router-dom'

const PublishForm = () => {
  const characterLimit = 200;
  const tagLimit = 10;

  const {blog_id} = useParams();

  let {blog,blog:{banner,title,tags,des,content},setBlog,setEditorState} = useContext(EditorContext);
  const {userAuth:{access_token } } = useContext(UserContext);

  const navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState('editor');
  }

  const handleBlogTitleChange = (e) => {
    let input = e.target;

    setBlog({...blog,title:input.value})

  }

  const handleTagInput = (e) => {
    if(e.keyCode == 13 || e.keyCode == 188){
      e.preventDefault();
      const tag = e.target.value;

      if(tags.length < tagLimit){
        if(!tags.includes(tag) && tag.length){
          setBlog({...blog,tags:[...tags,tag]});
        }
      }else{
        toast.error(`You can add maximum of ${tagLimit}`);
      }

      e.target.value = "";
    }
  }

  const handleTitleKeyDown = (e) => {
    if(e.keyCode == 13){
      e.preventDefault();
    }
  }

  const handleBlogDesChange = (e) => {
    let input = e.target;
    setBlog({...blog,des:input.value})
  }

  const handlePublishBlog = (e) => {

    if(e.target.className.includes("disable")){
      return;
    }


    if(!title.length){
      return toast.error("Fill Title");
    }

    if(!des.length || des.length > characterLimit){
      return toast.error("Fill Desc");
    }

    if(!tags.length){
      return toast.error("Enter alteast one title")
    }

    let loadingToast = toast.loading("Publishing ...");

    e.target.classList.add('disable');
    const blogObj = {title,banner,des,content,tags,draft:false};

    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", {...blogObj, id :blog_id},{
      headers:{
        'Authorization' : `Bearer ${access_token}`
      }
    }).then(()=>{
    e.target.classList.remove('disable');
    toast.dismiss(loadingToast);
    toast.success("Published");

    setTimeout(() => {
      navigate("/");
    }, 500);
    }).catch(({response})=>{
      e.target.classList.remove('disable');
      toast.dismiss(loadingToast);
      toast.error(response.data.error);
    });

  }

  return (
    <AnimationWrapper>
      <section className='w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4'>
        <Toaster/>
        <button className='w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]' onClick={handleCloseEvent}>
          <i className='fi fi-br-cross'></i>
        </button>

        <div className='max-w-[550px] center'>
          <p className='text-dark-grey mb-1'>Preview</p>
          <div className='w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4'>
            <img src={banner} alt="" />
          </div>

          <h1 className='text-4xl font-medium mt-2 leading-tight line-clamp-2'>{title}</h1>
          <p className='line-clamp-2 font-gelasio text-xl leading-7 mt-4'>{des}</p>
        </div>

        <div className='border-grey lg:border-1 lg:pl-8'>
          
            <p className='text-dark-grey mb-2 mt-9'>Blog Title</p>
            <input type="text" placeholder='Blog title' defaultValue={title} className='input-box pl-4' onChange={handleBlogTitleChange}/>

            <p className='text-dark-grey mb-2 mt-9'>Short description about you blog</p>
            <textarea maxLength={characterLimit} defaultValue={des} onKeyDown={handleTitleKeyDown} className='h-20 resize-none leading-7 input-box pl-4' onChange={handleBlogDesChange}></textarea>
            <p className='mt-1 text-dark-grey text-sm text-right'>{characterLimit - des.length} character left</p>

            <p className='text-dark-grey mb-2 mt-9'>Topics - (Helps in searching and ranking your blog post)</p>
            <div className='relative input-box pl-2 py-2 pb-2'>
              <input type="text" placeholder='Topic' className='sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white' onKeyDown={handleTagInput}/>

              {tags.map((tag,i) => {
                return <Tag tag={tag} tagIndex={i} key={i}/>
              })}

            </div>
            <p className='mt-1 mb-4 text-dark-grey text-sm text-right'>{tagLimit - tags.length} Tags left</p>


              <button className='btn-dark px-8' onClick={handlePublishBlog}>
                Publish
              </button>
        </div>

      </section>
    </AnimationWrapper>
  )
}

export default PublishForm