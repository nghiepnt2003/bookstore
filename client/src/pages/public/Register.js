import React, {useState, useCallback, useSyncExternalStore} from "react"
import {InputField, Button, SendOtp} from '../../components'
import { apiRegister, apiLogin, apiSendOTPCreateAccount} from "../../apis/user"
import Swal from "sweetalert2"
import { Link, useNavigate } from "react-router-dom"
import path from "../../ultils/path"
import { register } from "../../store/user/userSlice"
import { useDispatch } from "react-redux"

const Register = () => {
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        username: '',
        fullname: '',
        phone: '',
        address:'',
        otp: ''
    })
    const [isSendOTP, setIsSendOTP] = useState(false)
    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            username: '',
            fullname: '',
            phone: '',
            address:'',
            otp: ''
        })
    }
    const[dataChild, setDataChild] = useState('')
    const handleDataChild = (data) => {
        setDataChild(data);
    };
    payload.email= dataChild;
    const handleSubmit = useCallback(async() => {
        const{ username, password, ...data } = payload
        const response = await apiRegister(payload)
        console.log(payload)
        if(response.success) {
            Swal.fire('Congratulation', response.message,'success').then(() =>{
                setIsSendOTP(false)
                resetPayload()
            })
        } else {
            Swal.fire('Opps!', response.message,'error')
        }
            
    }, [payload])
    console.log(payload)

    const handleNext = () => {
        setIsSendOTP(true)
    }
    const handlePre = () => {
        setIsSendOTP(false)
    }
    
    return (
        <div  className="w-screen h-screen relative">           
            <img
                // src="https://png.pngtree.com/thumb_back/fw800/background/20240716/pngtree-a-magical-fantasy-forest-with-dense-vegetation-lighting-bugs-and-soft-image_16014529.jpg"
                src="https://png.pngtree.com/thumb_back/fw800/background/20230721/pngtree-low-poly-gaming-city-underwater-cartoon-style-3d-rendered-night-view-image_3719053.jpg"
                alt=""
                className="w-full h-full object-cover"
            />            
            <div className="absolute top-0 bottom-0 left-0 right-0  flex items-center justify-center gap-5">               
                <div className="p-8 bg-white rounded-md w-[360px]">
                    <h1 className="text-[28px] font-semibod text-main">Register</h1>
                    {isSendOTP &&
                        <div className="relative">
                        <SendOtp  sendData={handleDataChild}/>
                        <InputField 
                            value={payload.otp}
                            setValue={setPayload}
                            nameKey='otp'
                        />
                        <Button 
                            name='Register'
                            handleOnClick={handleSubmit}
                            style ='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 mt-3 w-full hover:bg-opacity-80 transition'
                        />
                        <Button 
                            name='Pre'
                            handleOnClick={handlePre}
                            style ='px-4 py-1 rounded-md text-white bg-main text-semibold  absolute top-[250px] left-0 hover:bg-opacity-80 transition'
                        />
                        </div>
                    }
                   {!isSendOTP &&
                        <div className="relative">
                            <div className="w-[300px]">
                                <InputField
                                value={payload.username}
                                setValue={setPayload}
                                nameKey='username'
                                />
                                <InputField
                                    value={payload.fullname}
                                    setValue={setPayload}
                                    nameKey='fullname'
                                />
                                <InputField
                                    value={payload.phone}
                                    setValue={setPayload}
                                    nameKey='phone'
                                />
                                <InputField
                                    value={payload.address}
                                    setValue={setPayload}
                                    nameKey='address'
                                />
                                <InputField
                                    value={payload.password}
                                    setValue={setPayload}
                                    nameKey='password'
                                    type='password'
                                />                
                            </div>
                                <Button 
                                name='Next'
                                handleOnClick={handleNext}
                                style ='px-3 py-1 rounded-md text-white bg-main text-semibold absolute top-[370px] right-0 hover:bg-opacity-80 transition'
                                />
                            </div>
                   }                  
                    <div className="flex items-center justify-between my-2 w-full text-sm">
                        <Link 
                            className="text-blue-500 hover:underline cursor-pointer w-full text-center "
                            to={`/${path.LOGIN}`}
                        >
                            Go Login
                        </Link>
                    </div>
                </div>
                
            </div>

        </div>
        )
    }
    
    export default Register