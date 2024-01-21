import React, { useContext, useRef } from 'react'
import AnimationWrapper from '../common/page-animation'
import InputBox from '../components/input.component'
import { Toaster, toast } from 'react-hot-toast';
import { UserContext } from '../App';
import axios from 'axios';

const ChangePassword = () => {

    const {userAuth:{access_token}} = useContext(UserContext);

    const changePasswordForm = useRef();
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = new FormData(changePasswordForm.current);
        const formData = {};

        for (const [key,value] of form.entries()){
            formData[key] = value;
        }

        const {currentPassword,newPassword} = formData;

        if(!currentPassword.length || !newPassword.length){
            return toast.error("Fill all the inputs")
        }

        if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        e.target.setAttribute("disabled",true);

        const loadingToast = toast.loading("Updating...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password",formData,{
            headers:{
                'Authorization':`Bearer ${access_token}`
            }
        }).then(()=>{
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.success("Password Updated");
        }).catch(({response})=>{
            toast.dismiss(loadingToast);
            e.target.removeAttribute("disabled");
            return toast.error(response.data.error);
        })

    }

  return (
    <AnimationWrapper>
        <Toaster />
        <form ref={changePasswordForm}>
            <h1 className='max-md:hidden'>Change Password</h1>

            <div className='p-10 w-full md:max-w-[400px]'>
                <InputBox name="currentPassword" type="password" className="profile-edit-input" placeholder="Current Password" icon="fi-rr-unlock"/>
                <InputBox name="newPassword" type="password" className="profile-edit-input" placeholder="New Password" icon="fi-rr-unlock"/>

                <button onClick={handleSubmit} type='submit' className='btn-dark px-10'>Change Password</button>
            </div>
        </form>
    </AnimationWrapper>
  )
}

export default ChangePassword