import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';


const Menu = ({cat}) => {

  const [posts,setPosts] = useState([]);


  useEffect(()=>{
    const fetchData = async () => {
      try {
        const res = await axios.get(`https://yeh-hai.com/api/posts/?cat=${cat}`);
        setPosts(res.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  },[cat]);


  return (
    <div className='menu'>
        <h1>Others posts you may like</h1>
        {posts.map(post=>(
            <div className="post" key={post.id}>
              <Link className="link" to={`/post/${post.id}`}>

                <img src={`https://yeh-hai.com/api/images/${post.img}`} alt="" />
                <h2>{post.title}</h2>
                <button>Read More</button>
              </Link>  
            </div>
        ))}
    </div>
  )
}

export default Menu