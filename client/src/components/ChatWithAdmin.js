// import { Badge, FloatButton, Input } from 'antd';
// import { MessageOutlined } from '@ant-design/icons';
// import { useEffect, useState } from 'react';
// import { io } from "socket.io-client";
// import { toast } from 'react-toastify';
// import { useSelector } from 'react-redux';
// import ModalChat from './ModalChat'; // Nhập ModalChat từ file khác
// import { apiGetRecentMessages } from '../apis/message';

// const title = "Chat với nhân viên tư vấn";
// const socket = io("http://localhost:3000");

// const ChatWithAdmin = () => {
//     const { current: currentUser } = useSelector(state => state.user);
//     const [open, setOpen] = useState(false);
//     const [messages, setMessages] = useState([]);

//     const fetchRecentMessages = async () => {
//         try {
//             const response = await apiGetRecentMessages(1); 
//             console.log("MESS " + JSON.stringify(response.data));
//             if (response.success) {
//                 setMessages(response.data.reverse());
//             }
//         } catch (error) {
//             toast.error('Không thể lấy tin nhắn gần đây');
//         }
//     };

//     const handleOpenChatModal = async () => {
//         if (!currentUser) {
//             toast.error('Vui lòng đăng nhập');
//             return;
//         }
//         setOpen(true);
//         socket.emit("joinConversation", { user1: currentUser._id, user2: 1 });

//         // Gọi hàm lấy tin nhắn gần đây
//         await fetchRecentMessages();
//     };

//     useEffect(() => {
//         const handleReceiveMessage = (message) => {
//             console.log("Received message:", message);
//             setMessages(prev => [...prev, message]);
//             fetchRecentMessages();
//         };
    
//         socket.on("receiveMessage", handleReceiveMessage);
    
//         return () => {
//             socket.off("receiveMessage", handleReceiveMessage);
//         };
//     }, []);

//     return (
//         <>
//             <FloatButton
//                 shape="circle"
//                 type="primary"
//                 className={`${open ? 'invisible opacity-0' : 'visible opacity-100'} right-[60px] cursor-pointer transition-all duration-1000`}
//                 tooltip={title}
//                 onClick={handleOpenChatModal}
//                 icon={<MessageOutlined />}
//             />
//             <ModalChat 
//                 props={{ open, setOpen, messages, setMessages, fetchRecentMessages }} 
//             />
//         </>
//     );
// }

// export default ChatWithAdmin;


import { Badge, FloatButton, Input, Button } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import ModalChat from './ModalChat'; // Nhập ModalChat từ file khác
import { apiGetRecentMessages } from '../apis/message';

const title = "Chat với nhân viên tư vấn";
const socket = io("http://localhost:3000");

const ChatWithAdmin = () => {
    const { current: currentUser } = useSelector(state => state.user);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [textMessage, setTextMessage] = useState("");
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const fetchRecentMessages = async () => {
        try {
            const response = await apiGetRecentMessages(1); 
            console.log("MESS " + JSON.stringify(response.data));
            if (response.success) {
                setMessages(response.data.reverse());
            }
        } catch (error) {
            toast.error('Không thể lấy tin nhắn gần đây');
        }
    };

    const handleOpenChatModal = async () => {
        if (!currentUser) {
            toast.error('Vui lòng đăng nhập');
            return;
        }
        setOpen(true);
        socket.emit("joinConversation", { user1: currentUser._id, user2: 1 });

        // Gọi hàm lấy tin nhắn gần đây
        await fetchRecentMessages();
    };

    const handleSendMessage = () => {
        if (!textMessage && selectedFiles.length < 1) return;

        const messageData = {
            sender: currentUser._id,
            receiver: 1, // ID của admin
            content: textMessage,
            images: selectedFiles
        };

        // Gửi tin nhắn qua socket
        socket.emit("sendMessage", messageData, (response) => {
            if (response.success) {
                const messageFullInformation = { ...messageData, senderUserID: { _id: currentUser._id, avatar: currentUser.avatar } };
                setMessages(prev => [...prev, messageFullInformation]);
                setTextMessage("");
                setSelectedFiles([]);
            }
        });
    };

    useEffect(() => {
        const handleReceiveMessage = (message) => {
            console.log("Received message:", message);
            setMessages(prev => [...prev, message]);
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, []);

    return (
        <>
            <FloatButton
                shape="circle"
                type="primary"
                className={`${open ? 'invisible opacity-0' : 'visible opacity-100'} right-[60px] cursor-pointer transition-all duration-1000`}
                tooltip={title}
                onClick={handleOpenChatModal}
                icon={<MessageOutlined />}
            />
            <ModalChat 
                props={{ open, setOpen, messages, setMessages, fetchRecentMessages }} 
            />
            {open && (
                <div className='flex items-center gap-4 p-4'>
                    <Input 
                        onPressEnter={handleSendMessage} 
                        value={textMessage} 
                        onChange={(e) => setTextMessage(e.target.value)} 
                        placeholder='Nhập nội dung' 
                    />
                    <Button onClick={handleSendMessage} type='primary'>Gửi</Button>
                </div>
            )}
        </>
    );
}

export default ChatWithAdmin;