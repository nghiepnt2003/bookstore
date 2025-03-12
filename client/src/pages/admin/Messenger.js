import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Input, Image } from 'antd';
import { IoIosSend } from "react-icons/io";
import { FileImageTwoTone } from '@ant-design/icons';
import { io } from "socket.io-client";
import { apiGetAllChatSessions, apiGetRecentMessages } from '../../apis/message';

const socket = io("http://localhost:3000");

const Messenger = () => {
    const { current } = useSelector(state => state.user);
    const [sessions, setSessions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [textMessage, setTextMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [searchEmail, setSearchEmail] = useState('');

    const getSessions = async () => {
        const rs = await apiGetAllChatSessions();
        if (rs?.success) {
            const formattedSessions = rs.data.map(session => ({
                _id: session._id,
                customerUserID: {
                    _id: session.sender === current._id ? session.receiver : session.sender,
                    name: `User ${session.sender === current._id ? session.receiver : session.sender}`,
                    email: `user${session.sender === current._id ? session.receiver : session.sender}@example.com`,
                    avatar: "https://via.placeholder.com/40"
                },
                latestMessage: session.content,
                status: session.isRead ? "Read" : "Unread"
            }));
            setSessions(formattedSessions);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
    };

    const handleInputFileClick = () => {
        fileInputRef.current.click();
    };

    const handleSendMessage = () => {
        if ((!textMessage && selectedFiles.length < 1) || !activeSession) return;
    
        const messageData = {
            sender: current._id,
            receiver: activeSession.customerUserID._id,
            content: textMessage,
            images: selectedFiles,
        };
    
        // Gửi tin nhắn qua socket
        socket.emit("sendMessage", messageData, (response) => {
            if (response.success) {
                // Chỉ thêm tin nhắn vào trạng thái khi nhận được phản hồi thành công
                const messageFullInformation = { ...messageData, senderUserID: { _id: current._id, avatar: current.avatar } };
                setMessages(prev => [...prev, messageFullInformation]);
            }
        })
        setTextMessage("");
        setSelectedFiles([]);
    };

    const handleCloseSession = () => {
        if (!activeSession) return;
        socket.emit("closeSession", { sessionId: activeSession });
        setSessions(prev => prev.map(session => session._id === activeSession ? { ...session, status: "Closed" } : session));
    };

    useEffect(() => {
        getSessions();
        socket.on('newSession', getSessions);
        socket.on("receiveMessage", (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('newSession', getSessions);
            socket.off("receiveMessage");
        };
    }, []);

    const fetchRecentMessages = async () => {
        try {
            const response = await apiGetRecentMessages(activeSession.customerUserID._id);
            if (response.success) {
                setMessages(response.data.reverse());
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (activeSession) {
            socket.emit("joinConversation", { user1: current._id, user2: activeSession.customerUserID._id });

            fetchRecentMessages();
        }
    }, [activeSession]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className='flex-1 h-[600px] overflow-hidden'>
            <div className='flex gap-4'>
                <div className='flex flex-col h-screen min-w-[300px] bg-orange-300'>
                    <div className='py-4 text-center font-semibold mb-4'>Khách hàng</div>
                    <div className='flex mb-4 mx-2'>
                        <Input onChange={(e) => setSearchEmail(e.target.value)} placeholder='Tìm kiếm email' />
                    </div>
                    <div className='flex flex-col gap-4 overflow-y-auto'>
                        {sessions.filter(session => session.customerUserID?.email.includes(searchEmail)).map((session, index) => (
                            <SessionItem key={index} session={session} isActive={activeSession === session._id} setActive={setActiveSession} />
                        ))}
                    </div>
                </div>
                <div className='flex-1 flex flex-col pl-4 py-12 mx-auto max-h-screen relative'>
                    {activeSession && (
                        <Button onClick={handleCloseSession} className='self-center mr-8 absolute top-4 z-10' type='primary' danger>
                            Close Session
                        </Button>
                    )}
                    <div ref={chatContainerRef} className='flex flex-col gap-6 break-words p-4 pr-6 h-[500px] overflow-y-auto'>
                        {messages.map((message, index) => (
                            <MessageItem key={index} content={message.content} images={message.images} avatar={message.senderUserID?.avatar} isMe={message.sender === current._id} />
                        ))}
                    </div>
                    {activeSession && (
                        <div className='flex items-center gap-4 p-4 pt-2 mr-6 bg-red-100 rounded-lg'>
                            <Badge count={selectedFiles?.length}>
                                <Input
                                    className='w-[20px] p-0 bg-transparent pr-1 cursor-pointer border-0'
                                    prefix={<FileImageTwoTone onClick={handleInputFileClick} />}
                                />
                            </Badge>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className='hidden'
                                onChange={handleFileChange}
                                multiple
                                accept='image/*'
                            />
                            <Input onPressEnter={handleSendMessage} value={textMessage} onChange={(e) => setTextMessage(e.target.value)} className='bg-slate-100' placeholder='Nhập nội dung' />
                            <IoIosSend onClick={handleSendMessage} color='#ff007f' className='cursor-pointer' size={26} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SessionItem = ({ session, isActive, setActive }) => {
    return (
        <div onClick={() => setActive(session)} className={`${isActive ? 'bg-red-300' : ''} cursor-pointer p-4 rounded-lg flex items-center gap-4 text-sm hover:bg-red-200`}>
            <div className='w-[40px] h-[40px] overflow-hidden rounded-full'>
                <img src={session.customerUserID.avatar || "https://via.placeholder.com/40"} alt="Avatar" />
            </div>
            <div className='flex flex-col'>
                <div className='font-semibold'>User {session.customerUserID.name || 'Unknown'}</div>
                <div className='font-semibold'>{session.customerUserID.email}</div>
                <div className='font-xs text-slate-800 truncate max-w-[180px]'>{session.latestMessage}</div>
            </div>
        </div>
    );
};

const MessageItem = ({ content, avatar, isMe, images }) => {
    console.log("ISME " + isMe + " " + content)
    return (
        <div className={`${isMe ? 'self-end' : ''} flex gap-2 items-center`}>
            {!isMe && (
                <div className='w-[30px] h-[30px] rounded-full overflow-hidden'>
                    <img src={avatar} alt="Avatar" />
                </div>
            )}
            <div className='flex flex-col'>
                <div className='flex flex-wrap justify-end max-w-[340px] gap-1'>
                    {images?.length > 0 && images.map((img, index) => <Image key={index} width={160} src={img} />)}
                </div>
                {content && (
                    <div className={`${isMe ? 'bg-red-300' : 'bg-red-200'} max-w-[340px] break-words text-sm py-2 px-4 rounded-lg`}>
                        {content}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messenger;