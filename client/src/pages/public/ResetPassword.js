import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'
import path from '../../ultils/path'
import 'react-toastify/dist/ReactToastify.css'
import { validate } from '../../ultils/helpers'
import { Button, Checkbox } from 'antd'

const ResetPassword = () => {
    const [password, setPassword] = useState(null)
    const [invalidFields, setInvalidFields] = useState([]);
    const { token } = useParams()
    const [isShowPassword, setIsShowPassWord] = useState(false)
    const [compare, setCompare] = useState(true)
    const [conFirm, setConFirm] = useState(null)
    const [error, setError] = useState({})
    const navigate = useNavigate()
    const handleResetPassword = async () => {
        if (password && conFirm) {

            const response = await apiResetPassword({ newPassword: password, resetToken: token })
            if (response.success) {
                toast.success(response.mess)
                setTimeout(async () => {
                    await navigate(`/${path.LOGIN}`);
                }, 1000); // 3000ms
            }
            else {
                // setIsForgetPassword(false)
                toast.info(response.mess, { theme: "colored" })
            }
        } else {
            if (!password) {
                setError(prev => {
                    return {
                        ...prev,
                        password: "Vui lòng nhập mật khẩu"
                    }
                })

            }
            if (!conFirm) {

                setError(prev => {
                    return {
                        ...prev,
                        newPassword: "Vui lòng nhập lại mật khẩu"
                    }
                })
            }
        }
    }
    useEffect(() => {
        if (password && conFirm) {
            if (conFirm === password) {
                setCompare(false)
            } else {
                setCompare(true)
            }
        }
    }, [conFirm, password])

    useEffect(() => {
        if (conFirm) {
            if (conFirm === "") {
                setError(prev => {
                    return {
                        ...prev,
                        conFirm: "Vui lòng nhập lại mật khẩu"
                    }
                })
            } else if (conFirm.length < 6) {
                setError(prev => {

                    return {
                        ...prev,
                        conFirm: "Mật khẩu phải lớn hơn hoặc bằng 6 kí tự"
                    }
                })
            } else {
                setError(prev => {
                    delete prev.conFirm
                    return {
                        ...prev
                    }
                })
            }
        }
    }, [conFirm])

    useEffect(() => {
        if (password) {
            if (password === "") {
                setError(prev => {
                    return {
                        ...prev,
                        password: "Vui lòng nhập mật khẩu"
                    }
                })
            } else if (password.length < 6) {
                setError(prev => {

                    return {
                        ...prev,
                        password: "Mật khẩu phải lớn hơn hoặc bằng 6 kí tự"
                    }
                })
            } else {
                setError(prev => {
                    delete prev.password
                    return {
                        ...prev
                    }
                })
            }
        }
    }, [password])
    return (
        <div className='absolute animate-slide-right top-0 left-0 bottom-0 right-0 bg-[#f893cb] rounded flex flex-col items-center py-8 z-50 h-screen justify-center'
            style={{
                backgroundImage: 'url(https://png.pngtree.com/thumb_back/fh260/background/20231012/pngtree-artistic-stained-rectangular-frame-background-in-pink-watercolor-image_13644882.png)', // Đường dẫn tới hình ảnh
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className='p-[20px] bg-white rounded-[12px] w-[34vw]'>
                <div className='flex flex-col gap-4 '>
                    <label htmlFor="password">Enter your new password:</label>
                    <input type={isShowPassword ? "text" : "password"}
                        id="password"
                        className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                        placeholder='Type here'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <p className='text-red-500 mt-[4px]'>{error?.password}</p>
                    <input type={isShowPassword ? "text" : "password"}
                        id="confirmpassword"
                        className='w-full h-[50px] pl-2 border rounded border-main outline-none placeholder:text-sm placeholder:text-main'
                        placeholder='Type here'
                        value={conFirm}
                        onChange={e => setConFirm(e.target.value)}
                    />
                    <p className='text-red-500 mt-[4px]'>{error?.conFirm}</p>
                </div >
                <div className='mt-2 flex justify-end w-full'>
                    <Checkbox checked={isShowPassword} onChange={() => setIsShowPassWord(prev => !prev)}>
                        Show
                    </Checkbox>
                </div>
                <div className='flex items-center justify-end z-10 mt-4 w-full gap-4'>
                    <Button
                        disabled={compare}
                        onClick={handleResetPassword} >
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword