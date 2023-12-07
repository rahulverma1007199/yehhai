import React, { useContext, useState } from 'react'
import { getDay } from '../common/date';
import { UserContext } from '../App';
import { toast } from 'react-hot-toast';
import CommentField from './comment-field.component';
import axios from 'axios';

const CommentCard = ({index,leftVal,commentData}) => {

    const {commented_by: {personal_info : {profile_img, fullname, username:commented_by_username}}, commendtedAt,comment,_id,children} = commentData;
    const {blog,blog:{comments,activity,activity:{total_parents_comments},comments:{results:commentsArr},author:{personal_info:{username:blog_author}}},setBlog,setTotalParentCommentsLoaded} = useContext(BlogContext);

    const {userAuth:{access_token,username}} = useContext(UserContext);
    const [isReplying,setIsReplying] = useState(false);

    const handleReplyClick = () => {
        if(!access_token){
            return toast.error("Login first to leave a reply!!!");
        }

        setIsReplying(preVal => !preVal);
    }

    const getParentIndex = () => {
        let startingPoint = index - 1;

        try{
            while(commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel){
                startingPoint --;
            }
        }catch{
            startingPoint = undefined;
        }
        return startingPoint;
    }

    const removeCommentsCards = (startingPoint,isDelete = false) => {
        if(commentsArr[startingPoint]){

            while(commentsArr[startingPoint].childrenLevel > commentData.childrenLevel){
                commentsArr.splice(startingPoint,1);

                if(!commentsArr[startingPoint]){
                    break;
                }
            }

        }

        if(isDelete){
            const parentIndex = getParentIndex();

            if(parentIndex !== undefined){
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child !== _id);

                if(commentsArr[parentIndex.children.length]){
                    commentsArr[parentIndex].isReplyLoaded = true;
                }
            }
            commentsArr.splice(index,1);
        }

        if(commentData.childrenLevel == 0 && isDelete){
            setTotalParentCommentsLoaded(prev => prev -1);
        }

        setBlog({...blog, comments:{results:commentsArr},activity:{...activity,total_parents_comments: total_parents_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0)}});
    }

    const hideReplyFun = () => {
        commentData.isReplyLoaded = false;
        removeCommentsCards(index + 1);
    }

    const showReplies = ({skip = 0}) => {
        if(children.length){

            hideReplyFun();

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies",{_id,skip}).then(({data:{replies}})=>{
                commentData.isReplyLoaded = true;

                for(let i = 0; i < replies.length ; i++){
                    replies[i].childrenLevel = commentData.childrenLevel + 1;

                    commentsArr.splice(index + 1 + i + skip,0,replies[i]);
                }

                setBlog({...blog,comments:{...comments, results:commentsArr}});

            }).catch(err => {
                console.log(err);
            })
        }
    }

    const deleteComment = (e) => {
        e.target.setArrtibute("disable",true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN+ "/delete-comment",{_id}),{
            headers:{
                'Authorization':`Bearer ${access_token}`
            }
        }
        .then(() => {
            e.target.removeAttribute("disable");
            removeCommentsCards(index + 1,true);
        })
        .catch(err => {
            console.log(err);
        })
    }

  return (
    <div className='w-full' style={{paddingLeft:`${leftVal * 10}px`}}>
        <div className='my-5 p-6 rounded-md border border-grey'>
            <div className='flex gap-3 items-center mb-8'>
                <img src={profile_img} className='w-6 h-6 rounded-full' alt="" />

                <p className='line-clamp-1'>{fullname} @{commented_by_username}</p>
                <p className='min-w-fil'>{getDay(commendtedAt)}</p>
            </div>
            <p className='text-xl font-gelasio ml-3'> {comment}</p>

            <div onClick={handleReplyClick} className='flex gap-5 items-center mt-5'>
                {
                    commentData.isReplyLoaded ? 
                    <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2'>
                        <i className='fi fi-rs-comment-dots' onClick={hideReplyFun}></i>
                        Hide Reply
                    </button> :
                     <button className='text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2' onClick={showReplies}>
                     <i className='fi fi-rs-comment-dots' ></i>
                     {children.length} Reply
                 </button> 
                }
                <button className='underline' onClick={handleReplyClick}>Reply</button>
                {
                    username == commented_by_username || username == blog_author ? 
                    <button className='p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center'
                        onClick={deleteComment}
                    >
                        <i className='fi fi-rr-trash pointer-events-none'></i>
                    </button>
                    : ""
                }
            </div>

            {
                isReplying ?
                <div className='mt-8'>
                    <CommentField action="Reply" index={index} replyingTo={_id} setReplying={setIsReplying} />
                </div> : ""
            }
        </div>
    </div>
  )
}

export default CommentCard