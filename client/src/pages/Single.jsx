import React from 'react'
import { Link } from 'react-router-dom'
import Menu from '../components/Menu'

const Single = () => {
  return (
    <div className='single'>
      <div className="content">
        <img src="https://images.pexels.com/photos/7008010/pexels-photo-7008010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="" />

        <div className="user">
          <img src="https://images.pexels.com/photos/7008010/pexels-photo-7008010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="" />
          <div className="info">
            <span>John</span>
            <p>posted 2 days ago</p>
          </div>
          <div className="edit">
            <Link to={`/write?edit=2`}>
                <img src="" alt="edit" />
            </Link>
            <img src="" alt="delete" />
          </div>
        </div>
        <h1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo, quod.</h1>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Velit minima consequatur nesciunt aspernatur aut, earum, itaque dolorum voluptates placeat excepturi veniam error modi quibusdam voluptatibus culpa similique ut quis. Sapiente incidunt temporibus voluptate delectus eos repudiandae, tempore facilis voluptatibus, possimus velit quidem aspernatur nihil culpa neque hic. Neque rem ad saepe sint tempore inventore architecto dolore nobis suscipit soluta eos amet molestiae quae, cumque accusamus impedit similique ab corrupti corporis ex deserunt ipsum fuga. Reprehenderit totam quos fugiat optio a voluptatem excepturi, nam error doloribus, sit ut molestias! Quidem rerum quis, natus obcaecati ducimus nemo hic libero repudiandae commodi dolor.</p>
        <br />
        <br />
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga magni quasi, ut necessitatibus numquam voluptatem, sapiente cum at qui ad est id fugiat in mollitia tempora temporibus culpa pariatur. Officia impedit, labore autem quaerat laborum, suscipit a distinctio eaque, adipisci accusantium iure molestiae nihil sed voluptates sequi dicta quasi odio dolor nulla quo fugit expedita reprehenderit vero. Odio quae ratione mollitia sapiente eum praesentium consectetur. Ab, dolor. Earum iste, quaerat reprehenderit corrupti ipsa sequi quibusdam fugiat distinctio corporis eum velit aperiam, laboriosam assumenda consectetur optio animi est. Est qui animi, alias aut fuga ullam recusandae labore debitis possimus quis assumenda.</p>
      </div>
      <div className="menu">
        <Menu />
      </div>
    </div>
  )
}

export default Single