// import React, { useState } from 'react';
// import { apiSendOTPCreateAccount } from '../apis/user';
// import Button from './Button';

// const SendOtp = ({ sendData}) => {
//     const [email, setEmail] = useState('');
//     const [message, setMessage] = useState('');


//     const handleSendOtp = async () => {
//         try {
//             const response = await apiSendOTPCreateAccount( {
//                 email: email,
//             });
//             console.log(response)
//             setMessage('OTP đã được gửi!');
//             sendData(email)
//         } catch (error) {
//             console.error('Có lỗi xảy ra:', error);
//             setMessage('Gửi OTP không thành công.');
//         }
//     };

//     return (
//         <div>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Email"
//                 className='animate-slide-top-sm block bg-white p-1 px-4 py-2 rounded-sm border w-full my-4'
//             />
//             {/* <button onClick={handleSendOtp}>Gửi OTP</button> */}
//             <Button 
//                 name='Send OTP'
//                 handleOnClick={handleSendOtp}
//             />
//             {message && <p>{message}</p>}
//         </div>
//     );
// };

// export default SendOtp;

import React, { useState } from 'react';
import { apiSendOTPCreateAccount } from '../apis/user';
import Button from './Button';

const SendOtp = () => {


    return (
        <div className='bg-main'>
            SENDOTP
            HELLLO
        </div>
    );
};

export default SendOtp;