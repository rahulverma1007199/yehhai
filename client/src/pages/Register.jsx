import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {useAlert} from 'react-alert';
import axios from 'axios';
const Register = () => {

  const alert = useAlert();
 

  const [inputs,setInputs] = useState({
    username:"",
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = e => {
    setInputs(prev=>({...prev,[e.target.name]:e.target.value}));
  }

  const handleSubmit =async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://yeh-hai.com/api/auth/register",inputs); 
      alert.show("Your profile has been sent for verification");
      navigate("/login");
    } catch (error) {
      setError(error.response.data);
    }

  }
  return (
    <div className='auth'>
      <h1>Register</h1>
      <form>
        <input required type="text" placeholder='username' name='username' onChange={handleChange}/>
        <input required type="email" placeholder='email' name='email' onChange={handleChange}/>
        <input required type="password" placeholder='password' name='password' onChange={handleChange}/>
        <button onClick={handleSubmit}>Register</button>
        {error &&
        <p>{error}</p>
        }
        <span>Do you have an account ?  <Link to ="/login" >Login</Link></span>
      </form>
    </div>
  )
}

export default Register