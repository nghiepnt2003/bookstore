import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Badge, Button, Input, Image, Spin } from "antd";
import { IoIosSend } from "react-icons/io";
import { FileImageTwoTone } from "@ant-design/icons";
import { io } from "socket.io-client";
import {
  apiGetAllChatSessions,
  apiGetRecentMessages,
  apiGetSendRecent,
} from "../../apis/message";
import { toast } from "react-toastify";

const socket = io("http://localhost:3000");

const Messenger = () => {
  const { current } = useSelector((state) => state.user);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [textMessage, setTextMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [searchEmail, setSearchEmail] = useState("");

  const [isSending, setIsSending] = useState(false); // Trạng thái đang gửi

  const getSessions = async () => {
    const rs = await apiGetAllChatSessions();
    if (rs?.success) {
      const formattedSessions = rs.data.map((session) => ({
        _id: session._id,
        customerUserID: {
          _id:
            session.sender === current._id ? session.receiver : session.sender,
          name: session?.userInfo?.username,
          email: session?.userInfo?.email,
          avatar: session?.userInfo?.image,
        },
        latestMessage: session.content,
        status: session.isRead ? "Read" : "Unread",
      }));
      formattedSessions.sort((a, b) => b._id - a._id);
      setSessions(formattedSessions);
    }
  };

  const fetchMessRecent = async (userId) => {
    const rs = await apiGetSendRecent(userId);
    console.log("AAA " + JSON.stringify(rs));
    if (rs?.success) {
      const data = {
        _id: rs.data._id, // Giả sử rs.data có trường _id
        customerUserID: {
          _id:
            rs.data.sender === current._id ? rs.data.receiver : rs.data.sender,
          name: rs.data?.userInfo?.username,
          email: rs.data?.userInfo?.email,
          avatar: rs.data?.userInfo?.image,
        },
        latestMessage: rs.data.content,
        status: rs.data.isRead ? "Read" : "Unread",
      };

      // Nếu bạn muốn thiết lập activeSession
      setActiveSession(data);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFormats = ["image/jpeg", "image/png"]; // Định dạng cho phép
    const filteredFiles = files.filter((file) =>
      validFormats.includes(file.type)
    );

    if (filteredFiles.length === 0) {
      // Thông báo lỗi hoặc xử lý nếu không có tệp hợp lệ
      toast.error("Only JPG and PNG formats are allowed.");
      return;
    }

    setSelectedFiles(filteredFiles);
  };

  const handleInputFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSendMessage = () => {
    if ((!textMessage && selectedFiles.length < 1) || !activeSession) return;

    const messageData = {
      sender: current._id,
      receiver: activeSession?.customerUserID?._id,
      content: textMessage,
      images: selectedFiles,
    };
    const tam = activeSession?.customerUserID?._id;
    setIsSending(true);
    // Gửi tin nhắn qua socket
    socket.emit("sendMessage", messageData, (response) => {
      setIsSending(false);
      if (response.success) {
        // Chỉ thêm tin nhắn vào trạng thái khi nhận được phản hồi thành công
        const messageFullInformation = {
          ...messageData,
          senderUserID: { _id: current._id, avatar: current.avatar },
        };
        setMessages((prev) => [...prev, messageFullInformation]);
        setTextMessage("");
        setSelectedFiles([]);
        console.log("HEHE " + tam);
        fetchMessRecent(tam);
        getSessions();
      }
    });
    setTextMessage("");
    setSelectedFiles([]);
  };

  // const handleCloseSession = () => {
  //     if (!activeSession) return;
  //     socket.emit("closeSession", { sessionId: activeSession });
  //     setSessions(prev => prev.map(session => session._id === activeSession ? { ...session, status: "Closed" } : session));
  // };

  useEffect(() => {
    getSessions();
    socket.on("newSession", getSessions);
    socket.on("receiveMessage", (message) => {
      // setMessages(prev => [...prev, message]);
      // console.log("MSS " + JSON.stringify(message) + "AC " + JSON.stringify(activeSession))
      if (
        message?.sender === current?._id ||
        activeSession?.customerUserID?._id === message?.sender
      ) {
        setMessages((prev) => [...prev, message]); // Nếu cần, bạn có thể quản lý trạng thái này khác
      }
      getSessions();
    });

    return () => {
      socket.off("newSession", getSessions);
      socket.off("receiveMessage");
    };
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const response = await apiGetRecentMessages(
        activeSession.customerUserID._id
      );
      if (response.success) {
        setMessages(response.data.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeSession) {
      console.log(" activeSession " + JSON.stringify(activeSession));
      socket.emit("joinConversation", {
        user1: current._id,
        user2: activeSession.customerUserID._id,
      });

      fetchRecentMessages();
    }
  }, [activeSession]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  console.log("MS " + JSON.stringify(messages));

  return (
    <div className="flex-1 h-[600px] overflow-hidden">
      <div className="flex gap-4">
        <div className="flex flex-col h-screen min-w-[300px] bg-orange-300">
          <div className="py-4 text-center font-semibold mb-4">Khách hàng</div>
          <div className="flex mb-4 mx-2">
            <Input
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Tìm kiếm email"
            />
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto">
            {/* {sessions.filter(session => session.customerUserID?.email.includes(searchEmail)).map((session, index) => (
                            <SessionItem key={index} session={session} isActive={activeSession === session._id} setActive={setActiveSession} />
                        ))} */}
            {sessions
              .filter((session) =>
                session.customerUserID?.email.includes(searchEmail)
              )
              .map((session, index) => {
                // Log giá trị activeSession và session._id
                console.log(
                  "Active Session:",
                  activeSession,
                  "Current Session ID:",
                  session._id
                );
                return (
                  <SessionItem
                    key={index}
                    session={session}
                    isActive={activeSession?._id === session?._id}
                    setActive={setActiveSession}
                  />
                );
              })}
          </div>
        </div>
        <div className="flex-1 flex flex-col pl-4 py-12 mx-auto max-h-screen relative">
          {/* {activeSession && (
                        <Button onClick={handleCloseSession} className='self-center mr-8 absolute top-4 z-10' type='primary' danger>
                            Close Session
                        </Button>
                    )} */}
          <div
            ref={chatContainerRef}
            className="flex flex-col gap-6 break-words p-4 pr-6 h-[500px] overflow-y-auto"
          >
            {messages?.map((message, index) => (
              <MessageItem
                key={index}
                content={message.content}
                images={message.images}
                avatar={activeSession?.customerUserID?.avatar}
                isMe={message.sender === current._id}
              />
            ))}
            {isSending && <Spin tip="Đang gửi..." />}
          </div>
          {activeSession && (
            <div className="flex items-center gap-4 p-4 pt-2 mr-6 bg-red-100 rounded-lg">
              <Badge count={selectedFiles?.length}>
                <Input
                  className="w-[20px] p-0 bg-transparent pr-1 cursor-pointer border-0"
                  prefix={<FileImageTwoTone onClick={handleInputFileClick} />}
                />
              </Badge>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                multiple
                accept="image/*"
              />
              <Input
                onPressEnter={handleSendMessage}
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                className="bg-slate-100"
                placeholder="Nhập nội dung"
              />
              <IoIosSend
                onClick={handleSendMessage}
                color="#ff007f"
                className="cursor-pointer"
                size={26}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionItem = ({ session, isActive, setActive }) => {
  return (
    <div
      onClick={() => setActive(session)}
      className={`${
        isActive ? "bg-red-300" : ""
      } cursor-pointer p-4 rounded-lg flex items-center gap-4 text-sm hover:bg-red-200`}
    >
      <div className="w-[40px] h-[40px] overflow-hidden rounded-full">
        <img
          src={
            session.customerUserID.avatar ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSINXNEQJywAfpZczCKNkezv0KH4HwH-Z3S6QxxZ2sfbsYkz4oa-qZl4_U240wL8KHvS74&usqp=CAU"
          }
          alt="Avatar"
        />
      </div>
      <div className="flex flex-col">
        <div className="font-semibold">
          {session.customerUserID.name || "Unknown"}
        </div>
        <div className="font-semibold">{session.customerUserID.email}</div>
        <div className="font-xs text-slate-800 truncate max-w-[180px]">
          {session.latestMessage}
        </div>
      </div>
    </div>
  );
};

const MessageItem = ({ content, avatar, isMe, images }) => {
  return (
    <div className={`${isMe ? "self-end" : ""} flex gap-2 items-center`}>
      {!isMe && (
        <div className="w-[30px] h-[30px] rounded-full overflow-hidden">
          <img src={avatar} alt="Avatar" />
        </div>
      )}
      <div className="flex flex-col">
        <div className="flex flex-wrap justify-end max-w-[340px] gap-1">
          {images?.length > 0 &&
            images.map((img, index) => (
              <Image key={index} width={160} src={img} />
            ))}
        </div>
        {content && (
          <div
            className={`${
              isMe ? "bg-red-300" : "bg-red-200"
            } max-w-[340px] break-words text-sm py-2 px-4 rounded-lg`}
          >
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
