import React, { useState, useCallback, useRef } from "react";
import { InputField, Button , GoogleLoginButton, GoogleAuth} from '../../components';
import { apiSendOTPCreateAccount, apiRegister, apiLogin, apiForgotPassword } from "../../apis/user"; 
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
    
    const [errors, setErrors] = useState({}); // Trạng thái lưu lỗi
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false); // Thêm trạng thái quên mật khẩu
    const [payload, setPayload] = useState({
        email: '',
        password: '',
        confirmPassword: '', // Trường mới cho xác nhận mật khẩu
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

    const handleForgotPasswordSubmit = async () => {
        const { email } = payload;
        if (!email) {
            toast.error('Vui lòng nhập địa chỉ email.');
            return;
        }
    
        setLoading(true);
        loadingBarRef.current.continuousStart();
    
        try {
            const response = await apiForgotPassword(email); // Gọi API quên mật khẩu
            setLoading(false);
            loadingBarRef.current.complete();
    
            if (response?.success) {
                toast.success('Hãy kiểm tra email của bạn!');
                setIsForgotPassword(false); // Đóng modal quên mật khẩu
            } else {
                toast.error(response?.message);
            }
        } catch (error) {
            console.error("LOI " + error)
            setLoading(false);
            loadingBarRef.current.complete();
            toast.error('Đã xảy ra lỗi, vui lòng thử lại sau.');
        }
    };

    const validateInputs = () => {
        const newErrors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        const phonePattern = /^[0-9]{10,15}$/; 
        const passwordComplexityPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/; 

        if (!payload.email) newErrors.email = 'Vui lòng nhập địa chỉ email.';
        else if (!emailPattern.test(payload.email)) newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ.';

        if (!payload.password) newErrors.password = 'Vui lòng nhập mật khẩu.';
        else if (!passwordComplexityPattern.test(payload.password)) newErrors.password = 'Mật khẩu không hợp lệ';

        if (isRegister && payload.password !== payload.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp.';
        }

        if (!payload.username) newErrors.username = 'Vui lòng nhập tên đăng nhập.';
        if (!payload.fullname) newErrors.fullname = 'Vui lòng nhập họ tên.';
        if (!payload.phone || !phonePattern.test(payload.phone)) newErrors.phone = 'Số điện thoại không hợp lệ.';
        if (!payload.address) newErrors.address = 'Vui lòng nhập địa chỉ.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
    };

    const handleSubmit = async () => {
         
        if (isRegister) {
            if (!validateInputs()) return; // Kiểm tra lỗi
            const { email, password, confirmPassword, username, fullname, phone, address } = payload;           

            setLoading(true);
            loadingBarRef.current.continuousStart();
            const response = await apiSendOTPCreateAccount({ email });
            setLoading(false);
            loadingBarRef.current.complete();

            if (response.success) {
                toast.success('Hãy kiểm tra email của bạn!');
                setIsSendOTP(true);
            } else {
                toast.error('Email đăng ký đã tồn tại. Vui lòng thử lại.');
            }
        } else {
            const { username, password } = payload;
            const response = await apiLogin({ username, password });
            if (response.success) {
                dispatch(register({ isLoggedIn: true, token: response.accessToken, userData: response.userData }));
                // if(+response.userData.role === 2)
                //     navigate(`/${path.HOME}`);
                // else
                //     navigate(`/${path.ADMIN}/${path.DASHBOARD}`)
                // Đặt timeout ngắn để đảm bảo Redux đã cập nhật
                setTimeout(() => {
                    if (+response.userData.role === 2) {
                        navigate(`/${path.HOME}`);
                        // window.location.reload()
                    } else {
                        navigate(`/${path.ADMIN}/${path.DASHBOARD}`);
                        // window.location.reload()
                    }
                }, 100); // Thay đổi thời gian nếu cần
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
                <div className="p-8 bg-white rounded-md">
                    <h1 className="text-[28px] font-semibold text-main">{isRegister ? 'Đăng Ký' : 'Đăng Nhập'}</h1>
                    {!isRegister && (
                        <GoogleLoginButton />
                    )}
                    {!isRegister && (
                       <>
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
                       </>
                     )}
                    {isRegister && (
                        <>
                            <div className="flex gap-4">
                                <div>
                                    <InputField
                                        value={payload.fullname}
                                        setValue={setPayload}
                                        nameKey='fullname'
                                    />
                                    {errors.fullname && <p className="text-red-500 text-sm">{errors.fullname}</p>}
                                </div>
                                <div>
                                    <InputField
                                        value={payload.phone}
                                        setValue={setPayload}
                                        nameKey='phone'
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                </div>
                            </div>
                            <div className="flex gap-4">                               
                                <div>
                                    <InputField
                                        value={payload.email}
                                        setValue={setPayload}
                                        nameKey='email'
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>
                                <div>
                                    <InputField
                                        value={payload.password}
                                        setValue={setPayload}
                                        nameKey='password'
                                        type='password'
                                    />
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <InputField
                                            value={payload.username}
                                            setValue={setPayload}
                                            nameKey='username'
                                    />
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                                </div>
                                <div>
                                <InputField
                                    value={payload.confirmPassword}
                                    setValue={setPayload}
                                    nameKey='confirmPassword'
                                    type='password'
                                    placeholder="Xác nhận mật khẩu"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                            <div>
                                    <InputField
                                            value={payload.address}
                                            setValue={setPayload}
                                            nameKey='address'
                                    />
                                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                            </div>
                            <span className="text-[10px] text-[#595656]">Note: Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.</span>
                            {/* <span  className="text-sm text-[#595656]">bao gồm chữ hoa, số và ký tự đặc biệt.</span> */}
                        </>
                    )}
                    {isRegister && (
                        <Button
                            name="Đăng ký"
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
                    {/* {loading && (
                        <div className="flex justify-center mt-2">
                            <ClipLoader color="#36d7b7" loading={loading} size={30} />
                        </div>
                    )} */}
                    {!isRegister && (
                        <span 
                         onClick={() => setIsForgotPassword(true)} 
                         className="flex justify-center text-sm hover:underline cursor-pointer"
                        >
                            Quên mật khẩu?
                        </span>
                        )
                    }
                    
                    <div className="flex items-center justify-between my-2 w-full text-sm">
                        <span onClick={() => setIsRegister(!isRegister)} className="hover:underline cursor-pointer">
                            {isRegister ? 'Đăng Nhập' : 'Đăng Ký'}
                        </span>
                        <Link className='text-sm hover:underline cursor-pointer' to={`/${path.HOME}`}>Về trang chủ?</Link>
                    </div>                    
                </div>
            </div>

            {/* Modal OTP */}
            {isSendOTP && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="p-4 bg-white rounded-md w-[350px]">
                        <h2 className="text-lg font-semibold">Nhập OTP</h2>
                        <form onSubmit={handleOtpSubmit} className="flex flex-col">
                            <InputField
                                value={payload.otp}
                                setValue={setPayload}
                                nameKey='otp'
                                placeholder="Nhập OTP"
                            />
                            <div className="flex justify-between">
                                <Button
                                    name="Xác Nhận OTP"
                                    handleOnClick={handleOtpSubmit}
                                    style='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 hover:bg-opacity-80 transition'
                                    disabled={loading}
                                />
                                 <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-semibold my-2 hover:bg-opacity-80 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                            
                            {/* {loading && (
                                <div className="flex justify-center mt-2">
                                    <ClipLoader color="#36d7b7" loading={loading} size={30} />
                                </div>
                            )} */}
                        </form>
                    </div>
                </div>
            )}

             {/* Modal quên mật khẩu */}
             {isForgotPassword && (
                <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="p-4 bg-white rounded-md w-[350px]">
                        <h2 className="text-lg font-semibold">Quên mật khẩu</h2>
                        <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col">
                            <InputField
                                value={payload.email}
                                setValue={setPayload}
                                nameKey='email'
                                placeholder="Nhập email của bạn"
                            />
                            <div className="flex justify-between">
                                <Button
                                    name="Đặt lại mật khẩu"
                                    handleOnClick={handleForgotPasswordSubmit}
                                    style='px-4 py-2 rounded-md text-white bg-main text-semibold my-2 hover:bg-opacity-80 transition'
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => setIsForgotPassword(false)}
                                    className="px-4 py-2 rounded-md bg-gray-200 text-semibold my-2 hover:bg-opacity-80 transition"
                                >
                                    Hủy
                                </button>
                            </div>
                           
                            {/* {loading && (
                                <div className="flex justify-center mt-2">
                                    <ClipLoader color="#36d7b7" loading={loading} size={30} />
                                </div>
                            )} */}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
