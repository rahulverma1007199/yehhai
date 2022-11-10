import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Menu from '../components/Menu'
import moment from 'moment';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import DOMPurify from "dompurify";
import Delete from "../images/delete.png";
import Edit from "../images/edit.png";
const Single = () => {

  const [post,setPost] = useState([]);

  const location = useLocation();
  const navigate = useNavigate ();

  const postID = location.pathname.split("/")[2];

  const {currentUser} = useContext(AuthContext);

  const handleDelete = async () => {
    try {
      await axios.post(`https://yeh-hai.com/api/posts/delete/${postID}`,{token:currentUser.access_token, post : "delete"
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://yeh-hai.com/api/posts/${postID}`);
        setPost(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  },[postID]);
  // const getText = (html) => {
  //   const doc = new DOMParser().parseFromString(html, 'text/html');
  //   return doc.body.textContent;
  // }

  return (
    <div className='single'>
      <div className="content">
        <img src={`https://yeh-hai.com/static/images/${post?.img}`} alt="" />

        <div className="user">
          {post.userImg !==undefined && 
          <img src={`https://yeh-hai.com/static/images/${post.userImg}`} alt="" />}
          <div className="info">
            <span>{post.username}</span>
            <p>posted {moment(post.date).fromNow()}</p>
          </div>
          {currentUser.username === post.username && <div className="edit">
            <Link to={`/write?edit=2`} state={post}>
                <img src={Edit} alt="edit" />
            </Link>
            <img onClick={handleDelete} src={Delete} alt="delete" />
          </div>}
        </div>
        <h1>{post.title}</h1>
        {/* {getText(post.desc)}
         */}
         <p  dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.desc),
          }}></p>
      </div>
      <div className="menu">
        <Menu cat={post.cat}/>
      </div>
    </div>
  )
}

export default Single