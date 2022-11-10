import axios from 'axios';
import React, { useEffect, useState } from 'react'


const Menu = ({cat}) => {

  const [posts,setPosts] = useState([]);


  useEffect(()=>{
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8800/api/posts/?cat=${cat}`);
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
                <img src={`http://localhost:8800/static/images/${post.img}`} alt="" />
                <h2>{post.title}</h2>
                <button>Read More</button>
            </div>
        ))}
    </div>
  )
}

export default Menu