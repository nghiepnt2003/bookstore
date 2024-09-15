import React, {useState, useCallback} from "react"
import {InputField, Button} from '../../components'
import { apiRegister, apiLogin } from "../../apis/user"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import path from "../../ultils/path"
import { register } from "../../store/user/userSlice"
import { useDispatch } from "react-redux"

const Login = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        username: '',
        fullname: '',
        phone: ''
    }) 
    const [isRegister, setIsRegister] = useState(false)
    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            username: '',
            fullname: '',
            phone: ''
        })
    }
    const handleSubmit = useCallback(async() => {
        const{ fullname, username, ...data } = payload
        if(isRegister) {
            const response = await apiRegister(payload)
            console.log(response)
            if(response.success) {
                Swal.fire('Congratulation', response.message,'success').then(() =>{
                    setIsRegister(false)
                    resetPayload()
                })
            } else {
                Swal.fire('Opps!', response.message.includes("An error occurred MongoServerError")? 'User has exists': response.message,'error')
            }
            
        }else {
            const result  = await apiLogin(payload)
            console.log(result)
            if(result.success) {
                dispatch(register({isLoggedIn: true, token: result.accessToken, userData: result.userData}))
                navigate(`/${path.HOME}`)
            } else {
                Swal.fire('Opps!', result.message,'error')
            }
        }
    }, [payload, isRegister])
    return (
        <div  className="w-screen h-screen relative">
            <img
                // src="https://png.pngtree.com/thumb_back/fw800/background/20240716/pngtree-a-magical-fantasy-forest-with-dense-vegetation-lighting-bugs-and-soft-image_16014529.jpg"
                src="https://png.pngtree.com/thumb_back/fw800/background/20230721/pngtree-low-poly-gaming-city-underwater-cartoon-style-3d-rendered-night-view-image_3719053.jpg"
                alt=""
                className="w-full h-full object-cover"
            />
            <div className="absolute top-0 bottom-0 left-0 right-0  flex items-center justify-center">
                <div className="p-8 bg-white rounded-md w-[360px]">
                    <h1 className="text-[28px] font-semibod text-main">{isRegister? 'Register': 'Login'}</h1>
                    <InputField
                        value={payload.username}
                        setValue={setPayload}
                        nameKey='username'
                    />
                    {isRegister &&  <InputField
                        value={payload.email}
                        setValue={setPayload}
                        nameKey='email'
                    />}
                    {isRegister &&  <InputField
                        value={payload.fullname}
                        setValue={setPayload}
                        nameKey='fullname'
                    />}
                    {isRegister &&  <InputField
                        value={payload.phone}
                        setValue={setPayload}
                        nameKey='phone'
                    />}
                    <InputField
                        value={payload.password}
                        setValue={setPayload}
                        nameKey='password'
                        type='password'
                    />
                    <Button 
                        name={isRegister? 'Register': 'Login'}
                        handleOnClick={handleSubmit}
                        fw
                    />
                    <div className="flex items-center justify-between my-2 w-full text-sm">
                        
                        {!isRegister && <span className="text-blue-500 hover:underline cursor-pointer">Forgot your account?</span>}
                        {!isRegister && <span 
                            className="text-blue-500 hover:underline cursor-pointer"
                            onClick={() =>setIsRegister(true)}
                        >
                            Create account
                        </span>}
                        {isRegister && <span 
                            className="text-blue-500 hover:underline cursor-pointer w-full text-center"
                            onClick={() =>setIsRegister(false)}
                        >
                            Go Login
                        </span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login