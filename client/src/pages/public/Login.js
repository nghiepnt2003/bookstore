import React, { useState, useCallback, useRef } from "react";
import { InputField, Button } from '../../components';
import { apiSendOTPCreateAccount, apiRegister, apiLogin } from "../../apis/user"; 
import { ToastContainer, toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners"; 
import LoadingBar from 'react-top-loading-bar'; 
import path from "../../ultils/path";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { register } from "../../store/user/userSlice";

const Login = () => {
    const loadingBarRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [isRegister, setIsRegister] = useState(false);
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        username: '',
        fullname: '',
        phone: '',
        address: '',
        otp: '',
    });
    const [loading, setLoading] = useState(false);
    const [isSendOTP, setIsSendOTP] = useState(false);

    const resetPayload = () => {
        setPayload({
            email: '',
            password: '',
            username: '',
            fullname: '',
            phone: '',
            address: '',
            otp: '',
        });
    };
    const handleSubmit = async () => {
        if (isRegister) {
            const { email, password, username, fullname, phone, address } = payload;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
            const phonePattern = /^[0-9]{10,15}$/; 
        
            if (!email || !emailPattern.test(email)) {
                toast.error('Vui lòng nhập địa chỉ email hợp lệ.');
                return;
            }
            if (!password || password.length < 6) {
                toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
                return;
            }
            if (!username) {
                toast.error('Vui lòng nhập tên đăng nhập.');
                return;
            }
            if (!fullname) {
                toast.error('Vui lòng nhập họ tên.');
                return;
            }
            if (!phone || !phonePattern.test(phone)) {
                toast.error('Số điện thoại không hợp lệ.');
                return;
            }
            if (!address) {
                toast.error('Vui lòng nhập địa chỉ.');
                return;
            }
            

            setLoading(true);
            loadingBarRef.current.continuousStart();
            const response = await apiSendOTPCreateAccount({ email });
            setLoading(false);
            loadingBarRef.current.complete();

            if (response.success) {
                toast.success('OTP đã được gửi đến email của bạn!');
                setIsSendOTP(true);
            } else {
                toast.error('Gửi OTP không thành công, email đã tồn tại. Vui lòng thử lại.');
            }
        } else {
            const { username, password } = payload;
            const response = await apiLogin({ username, password });
            if (response.success) {
                dispatch(register({ isLoggedIn: true, token: response.accessToken, userData: response.userData }));
                if(+response.userData.role === 2)
                    navigate(`/${path.HOME}`);
                else
                    navigate(`/${path.ADMIN}/${path.DASHBOARD}`)
            } else {
                Swal.fire('Opps!', response.message, 'error');
            }
        }
    };

    const handleOtpSubmit = async (e) => {
        const { otp } = payload;
        if (!otp) {
            toast.error('Vui lòng nhập OTP.');
            return;
        }

        setLoading(true);
        loadingBarRef.current.continuousStart();
        const response = await apiRegister({ ...payload, otp });
        setLoading(false);
        loadingBarRef.current.complete();

        if (response.success) {
            toast.success('Đăng ký thành công!');
            resetPayload();
            setIsSendOTP(false);
            setIsRegister(false)
        } else {
            toast.error('OTP không hợp lệ. Vui lòng thử lại.');
        }
    };

    const handleCloseModal = () => {
        setIsSendOTP(false);
        resetPayload();
    };

    return (
        <div className="w-screen h-screen relative">
            <LoadingBar color="#36d7b7" ref={loadingBarRef} />
            <img
                src="https://png.pngtree.com/thumb_back/fw800/background/20230721/pngtree-low-poly-gaming-city-underwater-cartoon-style-3d-rendered-night-view-image_3719053.jpg"
                alt=""
                className="w-full h-full object-cover"
            />
            <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center gap-5">
                <div className="p-8 bg-white rounded-md w-[360px]">
                    <h1 className="text-[28px] font-semibold text-main">{isRegister ? 'Đăng Ký' : 'Đăng Nhập'}</h1>
                    <InputField
                                value={payload.username}
                                setValue={setPayload}
                                nameKey='username'
                            />
                    {isRegister && (
                        <>
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
                                value={payload.email}
                                setValue={setPayload}
                                nameKey='email'
                            />
                        </>
                    )}
                    <InputField
                        value={payload.password}
                        setValue={setPayload}
                        nameKey='password'
                        type='password'
                    />
                    {isRegister && (
                        <Button
                            name="Gửi OTP"
                            handleOnClick={handleSubmit}
                            style='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 mt-3 w-full hover:bg-opacity-80 transition'
                            disabled={loading}
                        />
                    )}
                    {!isRegister && (
                        <Button
                            name="Đăng Nhập"
                            handleOnClick={handleSubmit}
                            style='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 mt-3 w-full hover:bg-opacity-80 transition'
                            disabled={loading}
                        />
                    )}
                    {loading && (
                        <div className="flex justify-center mt-2">
                            <ClipLoader color="#36d7b7" loading={loading} size={30} />
                        </div>
                    )}
                    <div className="flex items-center justify-between my-2 w-full text-sm">
                        <span onClick={() => setIsRegister(!isRegister)} className="text-blue-500 hover:underline cursor-pointer">
                            {isRegister ? 'Đã có tài khoản? Đăng Nhập' : 'Chưa có tài khoản? Đăng Ký'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal OTP */}
            {isSendOTP && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="p-4 bg-white rounded-md w-[300px]">
                        <h2 className="text-lg font-semibold">Nhập OTP</h2>
                        <form onSubmit={handleOtpSubmit} className="flex flex-col">
                            <InputField
                                value={payload.otp}
                                setValue={setPayload}
                                nameKey='otp'
                                placeholder="Nhập OTP"
                            />
                            <Button
                                name="Xác Nhận OTP"
                                handleOnClick={handleOtpSubmit}
                                style='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 w-full hover:bg-opacity-80 transition'
                                disabled={loading}
                            />
                            {loading && (
                                <div className="flex justify-center mt-2">
                                    <ClipLoader color="#36d7b7" loading={loading} size={30} />
                                </div>
                            )}
                        </form>
                        <button
                            onClick={handleCloseModal}
                            className="mt-2 text-blue-500 underline"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Login;