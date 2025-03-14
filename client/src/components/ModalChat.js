import { Badge, Input, Image } from 'antd';
import { IoMdClose, IoIosSend } from "react-icons/io";
import { useEffect, useRef, useState } from 'react';
import { RiUserFollowFill } from "react-icons/ri";
import { useSelector } from 'react-redux';
import { FileImageTwoTone } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const ModalChat = ({ props }) => {
    const { open, setOpen, messages, setMessages, fetchRecentMessages } = props;
    const { current: currentUser } = useSelector(state => state.user);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        console.log("Selected files:", files); // Log các tệp đã chọn
    };

    const handleInputFileClick = () => {
        fileInputRef.current.click();
    };

    const handleSendMessage = () => {
        if (!message && selectedFiles.length < 1) {
            console.log("No content to send"); // Log nếu không có nội dung
            return;
        }

        const messageData = {
            sender: currentUser._id,
            receiver: 1,
            content: message,
            images: selectedFiles, // Đổi tên từ 'image' thành 'images'
        };

        console.log("Sending message data:", messageData); // Log dữ liệu tin nhắn

        // Gửi tin nhắn qua socket
        socket.emit("sendMessage", messageData, (response) => {
            console.log("Response from server:", response); // Log phản hồi từ server
            if (response.success) {
                setMessages(prevMessages => [...prevMessages, messageData]);
                console.log("Message sent successfully"); // Log thông báo thành công

                fetchRecentMessages(); // Gọi lại hàm để lấy tin nhắn gần đây
            } else {
                console.log("Message sending failed"); // Log nếu gửi không thành công
            }
        });

        setMessage("");
        setSelectedFiles([]);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={`${open ? 'opacity-100 bottom-[40px]' : 'opacity-0 bottom-[-100%]'} fixed flex flex-col w-[320px] h-[450px] bg-red-100 text-black rounded-lg right-[30px] z-[101] shadow-lg transition-all duration-300`}>
            <div className='flex justify-between bg-[#ff007f] rounded-t-lg text-white font-medium text-md min-h-[60px] px-4 py-2'>
                {"Chat với nhân viên tư vấn"}
                <IoMdClose onClick={() => setOpen(false)} size={22} className='hover:opacity-80 cursor-pointer' />
            </div>
            <div className='flex flex-col flex-1 px-4 pt-2 pb-4'>
                <div ref={chatContainerRef} className='flex flex-col gap-4 overflow-y-auto max-h-[320px] chat__session__content'>
                    {messages.length > 0 ? (
                        messages.map((e, i) => (
                            e.sender !== currentUser._id ? (
                                <div key={i} className='flex gap-2 items-center'>
                                    <RiUserFollowFill color='#ff007f' size={24} />
                                    <div className='flex flex-col gap-2 justify-center'>
                                        <div className='flex flex-wrap max-w-[180px] gap-1'>
                                            {e.images?.length > 0 && e.images.map((img, index) => (
                                                <Image key={index} width={80} src={img} />
                                            ))}
                                        </div>
                                        {e.content && <p className='text-sm font-medium break-words max-w-[180px] bg-red-200 py-2 px-4 rounded-lg'>{e.content}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className='flex flex-col gap-2 items-end justify-center'>
                                    <div className='flex flex-wrap justify-end max-w-[180px] gap-1'>
                                        {e.images?.length > 0 && e.images.map((img, index) => (
                                            <Image key={index} width={80} src={img} />
                                        ))}
                                    </div>
                                    {e.content && <p className='text-sm font-medium break-words max-w-[180px] bg-red-300 py-2 px-4 rounded-lg'>{e.content}</p>}
                                </div>
                            )
                        ))
                    ) : (
                        <p className='text-center text-gray-500'>Chưa có tin nhắn nào.</p>
                    )}
                </div>
            </div>
            <div className='flex items-center gap-4 p-4 pt-2 bg-red-100 rounded-b-lg'>
                <Badge count={selectedFiles.length}>
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
                <div className='flex flex-wrap gap-2 max-w-[180px]'>
                    {selectedFiles.map((file, index) => (
                        <Image key={index} width={40} src={URL.createObjectURL(file)} />
                    ))}
                </div>
                <Input 
                    onPressEnter={handleSendMessage} 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    className='bg-slate-100' 
                    placeholder='Nhập nội dung' 
                />
                <IoIosSend onClick={handleSendMessage} color='#ff007f' className='cursor-pointer' size={26} />
            </div>
        </div>
    );
}

export default ModalChat;