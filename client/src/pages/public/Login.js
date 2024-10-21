import React, {useState, useCallback, useSyncExternalStore} from "react"
import {InputField, Button} from '../../components'
import { apiRegister, apiLogin, apiSendOTPCreateAccount} from "../../apis/user"
import Swal from "sweetalert2"
import { useNavigate} from "react-router-dom"
import path from "../../ultils/path"
import { register } from "../../store/user/userSlice"
import { useDispatch } from "react-redux"
import {Link} from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [payload, setPayload] = useState({
        password: '',
        username: ''
    })
    const resetPayload = () => {
        setPayload({
            password: '',
            username: ''
        })
    }
    const handleSubmit = useCallback(async() => {
        const{ username, password } = payload        
        const result  = await apiLogin(payload)
        if(result.success) {
            dispatch(register({isLoggedIn: true, token: result.accessToken, userData: result.userData}))
            navigate(`/${path.HOME}`)
        } else {
            Swal.fire('Opps!', result.message,'error')
        }
    }, [payload])
    console.log(payload)
    
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
                    <h1 className="text-[28px] font-semibod text-main">Login</h1>
                    <InputField
                        value={payload.username}
                        setValue={setPayload}
                        nameKey='username'
                    />
                    <InputField
                        value={payload.password}
                        setValue={setPayload}
                        nameKey='password'
                        type='password'
                    />
                    <Button 
                        name='Login'
                        handleOnClick={handleSubmit}
                        fw
                    />
                    <div className="flex items-center justify-between my-2 w-full text-sm">
                        
                        <span className="text-blue-500 hover:underline cursor-pointer">Forgot your account?</span>
                        <Link 
                            className="text-blue-500 hover:underline cursor-pointer"
                            to={`/${path.REGISTER}`}
                        >
                            Create account
                        </Link>
                    </div>
                    <Link className="text-blue-500 hover:underline cursor-pointer" to={`/${path.HOME}`}>Go home?</Link>
                </div>                
            </div>
        </div>
        )
    }
    
    export default Login