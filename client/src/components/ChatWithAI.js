import { FloatButton, Input, Image, Badge } from "antd";
import { RobotFilled } from "@ant-design/icons";
import { IoMdClose, IoIosSend } from "react-icons/io";
import { useEffect, useRef, useState } from "react";
import { FileImageTwoTone } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { apiSendMessageToAI } from "../apis/ai";

const ChatWithAI = () => {
  const productList = null;
  const { current } = useSelector((state) => state.user);
  const isLoggedIn = current !== null;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const handleOpenChatModal = () => {
    if (!isLoggedIn) {
      toast.warning("Vui lòng đăng nhập để sử dụng chat AI");
      return;
    }
    setOpen(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleInputFileClick = () => {
    fileInputRef.current.click();
  };
  const handleSendMessage = async () => {
    if (!message && selectedFiles.length < 1) return;

    // Show user message immediately
    const userMessage = {
      sender: "user",
      content: message,
      images: selectedFiles.map((file) => URL.createObjectURL(file)),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Store current message and clear input
    const currentMessage = message;
    setMessage("");
    setSelectedFiles([]);

    // Show loading state
    const loadingMessage = {
      sender: "ai",
      content: "Đang suy nghĩ...",
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      if (!isLoggedIn) {
        throw new Error("Vui lòng đăng nhập để sử dụng chat AI");
      }

      // Call API to get AI response
      const response = await apiSendMessageToAI({ message: currentMessage });

      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));
      console.log(response);
      if (response?.success) {
        // Add AI response to message list
        setMessages((prev) => [
          ...prev,
          { sender: "ai", content: response.message, images: [] },
        ]);
      } else {
        throw new Error(response?.message || "AI không phản hồi");
      }
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading));

      console.error("Chat AI error:", error);
      toast.error(
        error?.response?.message || error.message || "AI không phản hồi"
      );
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <FloatButton
        shape="circle"
        type="primary"
        className={`${
          open ? "invisible opacity-0" : "visible opacity-100"
        } right-[120px] cursor-pointer transition-all duration-1000`}
        tooltip="Chat với AI"
        onClick={handleOpenChatModal}
        icon={
          <img
            src="/ai-bot-icon.svg"
            alt="AI Bot"
            style={{ width: 28, height: 28 }}
          />
        }
      />
      <div
        className={`${
          open ? "opacity-100 bottom-[40px]" : "opacity-0 bottom-[-100%]"
        } fixed flex flex-col w-[320px] h-[450px] bg-blue-100 text-black rounded-lg right-[90px] z-[101] shadow-lg transition-all duration-300`}
      >
        <div className="flex justify-between bg-blue-600 rounded-t-lg text-white font-medium text-md min-h-[60px] px-4 py-2">
          {"Chat với AI"}
          <IoMdClose
            onClick={() => setOpen(false)}
            size={22}
            className="hover:opacity-80 cursor-pointer"
          />
        </div>
        <div className="flex flex-col flex-1 px-4 pt-2 pb-4">
          <div
            ref={chatContainerRef}
            className="flex flex-col gap-4 overflow-y-auto max-h-[320px] chat__session__content"
          >
            {messages.length > 0 ? (
              messages.map((e, i) =>
                e.sender === "ai" ? (
                  <div key={i} className="flex gap-2 items-center">
                    <Image
                      width={24}
                      src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                      preview={false}
                    />
                    <div className="flex flex-col gap-2 justify-center">
                      <div className="flex flex-wrap max-w-[180px] gap-1">
                        {e.images?.length > 0 &&
                          e.images.map((img, index) => (
                            <Image key={index} width={80} src={img} />
                          ))}
                      </div>
                      {e.content && (
                        <p className="text-sm font-medium break-words max-w-[180px] bg-blue-200 py-2 px-4 rounded-lg">
                          {e.content}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex flex-col gap-2 items-end justify-center"
                  >
                    <div className="flex flex-wrap justify-end max-w-[180px] gap-1">
                      {e.images?.length > 0 &&
                        e.images.map((img, index) => (
                          <Image key={index} width={80} src={img} />
                        ))}
                    </div>
                    {e.content && (
                      <p className="text-sm font-medium break-words max-w-[180px] bg-blue-300 py-2 px-4 rounded-lg">
                        {e.content}
                      </p>
                    )}
                  </div>
                )
              )
            ) : (
              <p className="text-center text-gray-500">Chưa có tin nhắn nào.</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 pt-2 bg-blue-100 rounded-b-lg">
          <Badge count={selectedFiles.length}>
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
          <div className="flex flex-wrap gap-2 max-w-[180px]">
            {selectedFiles.map((file, index) => (
              <Image key={index} width={40} src={URL.createObjectURL(file)} />
            ))}
          </div>
          <Input
            onPressEnter={handleSendMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-slate-100"
            placeholder="Nhập nội dung"
          />
          <IoIosSend
            onClick={handleSendMessage}
            color="#2563eb"
            className="cursor-pointer"
            size={26}
          />
        </div>
      </div>
    </>
  );
};

export default ChatWithAI;
