import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../App';
import axios from 'axios';
import { profileDataStructure } from './profile.page';
import AnimationWrapper from '../common/page-animation';
import Loader from '../components/loader.component';
import { Toaster, toast } from 'react-hot-toast';
import InputBox from '../components/input.component';
import { uploadImage } from '../common/aws';
import { storeInSession } from '../common/session';

const EditProfile = () => {

    const profileImgRef = useRef();
    const editProfileForm = useRef();

    const {userAuth,userAuth:{access_token},setUserAuth} = useContext(UserContext);
    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [ updatedProfileImg, setUpdatedProfileImg] = useState(null);

    const bioLimit = 150;

    const [charactersLeft, setCharactersLeft] = useState(bioLimit);


    const {personal_info : {fullname,username:profile_username,profile_img, email,bio},social_links} = profile;

    const handleCharacterChange = (e) => {

        setCharactersLeft(bioLimit - e.target.value.length);
    }

    useEffect(()=>{

        if(access_token){
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile",{username:userAuth.username},{
                headers:{
                    'Authorization':`Bearer ${access_token}`
                }
            }).then(({data})=>{
                setProfile(data);
                setLoading(false);
            }).catch(()=>{
                setLoading(false);
            })
        }

    },[access_token]);

    const handleImagePreview = (e) => {
        const img = e.target.files[0];

        profileImgRef.current.src = URL.createObjectURL(img);

        setUpdatedProfileImg(img);
    }

    const handleImageUpload = (e) => {
        e.preventDefault();

        if(updatedProfileImg){

            const loadingToast = toast.loading("Uploading...");

            e.target.setAttribute("disabled", true);

            uploadImage(updatedProfileImg).then(url => {

                if(url){
                    axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-url",{url},{
                        headers:{
                            'Authorization':`Bearer ${access_token}`
                        }
                    }).then(({data}) => {
                        const newUserAuth = {...userAuth, profile_img : data.profile_img};

                        storeInSession("user",JSON.stringify(newUserAuth));
                        setUserAuth(newUserAuth);

                        setUpdatedProfileImg(null);
                        toast.dismiss(loadingToast);

                        e.target.removeAttribute("disabled");
                        toast.success("Uploaded");

                    }).catch(({response}) => {
                        toast.dismiss(loadingToast);

                        e.target.removeAttribute("disabled");
                        toast.error("Failed to upload");
                    })
                }

            }).catch(err => {
                console.log(err);
            });


        }
    }

    const handleClick = (e) => {
        e.preventDefault();

        const form = new FormData(editProfileForm.current);
        const formData = {};

        for (let [key,value] of form.entries()){
            formData[key] = value;
        }

        const {username, bio, youtube, facebook, twitter, github, instagram, webiste } = formData;

        if(username.length < 3) {
            return toast.error("Username should be at-least 3 letters long");
        }

        if(bio.length > bioLimit){
            return toast.error(`Bio should not be more than ${bioLimit}`);
        }

        const loadingToast = toast.loading("updating...");

        e.target.setAttribute("disabled", true);

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",{username, bio, social_links:{youtube,facebook,twitter,github,instagram,webiste}},{
                    headers:{
                        'Authorization':`Bearer ${access_token}`
                    }
                }).then(({data}) => {

                    if(userAuth.username !== data.username){
                        const newUserAuth = {...userAuth, username : data.username};
                        storeInSession("user",JSON.stringify(newUserAuth));
                        setUserAuth(newUserAuth);
                    }

                    toast.dismiss(loadingToast);

                    e.target.removeAttribute("disabled");
                    toast.success("Updated");

                }).catch(({response}) => {
                    toast.dismiss(loadingToast);

                    e.target.removeAttribute("disabled");
                    toast.error(response.data.error);
                })

    }

  return (
    <AnimationWrapper>
        {
            loading ? <Loader /> :

            <form ref={editProfileForm}>
                <Toaster/>

                <h1 className='max-md:hidden'>Edit Profile</h1>

                <div className='flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10'>

                    <div className='mb-5 max-lg:center'>
                        <label htmlFor="uploadImg" id='profileImgLabel' className='relative block w-48 h-48 bg-grey rounded-full overflow-hidden'>
                           <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">Upload Image</div>
                           
                            <img ref={profileImgRef} src={profile_img} alt="" />
                        </label>
                        <input type="file" id="uploadImg" accept='.jpeg, .png, .jpg' hidden onChange={handleImagePreview}/>
                        <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload}> Upload </button>
                    </div>

                    <div className='w-full'>
                        <div className='grid grid-cols-1 md:grid-cols-2 md:gap-5'>
                            <div>
                                <InputBox disable={true} name="fullname" type="text" value={fullname} placeholder="Full Name" icon="fi-rr-user" />
                            </div>
                            <div>
                                <InputBox disable={true} name="email" type="email" value={email} placeholder="Email" icon="fi-rr-envelope" />
                            </div>
                        </div>

                            <InputBox name="username" type="text" value={profile_username} placeholder="Username" icon="fi-rr-at" />
                            <p className='text-dark-grey -mt-3'>Username will use to search and will be visible to all users </p>

                            <textarea name='bio' maxLength={bioLimit} defaultValue={bio} className='input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5' placeholder='Bio' onChange={handleCharacterChange}></textarea>

                            <p className='mt-1 text-dark-grey'>{charactersLeft} characters left</p>

                            <p className='my-6 text-dark-grey'>Add your social handles below</p>
                            
                            <div className='md:grid md:grid-cols-2 gap-x-6'>

                                {
                                    Object.keys(social_links).map((key,i) => {
                                        const link = social_links[key];

                                        return <InputBox key={i} name={key} type="text" value={link} placeholder="https://"
                                            icon={'fi '+ (key !== 'website' ? 'fi-brands-'+key : ' fi-rr-globe ')}
                                        />
                                    })
                                }

                            </div>

                            <button className='btn-dark w-auto px-10' type='submit' onClick={handleClick}>Update</button>
                    </div>
                </div>

            </form>

        }
    </AnimationWrapper>
  )
}

export default EditProfile