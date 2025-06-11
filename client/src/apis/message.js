import axios from '../axios';

// Lấy tin nhắn gần đây giữa người dùng hiện tại và một người khác
export const apiGetRecentMessages = (userId) => axios.get(`/message/recent/${userId}`);

// Gửi tin nhắn
export const apiSendMessage = (messageData) => axios.post('/message/send', messageData);

// Xóa tin nhắn
export const apiDeleteMessage = (messageId) => axios.delete(`/message/${messageId}`);

// Đánh dấu tin nhắn là đã đọc
export const apiSeenMessages = (receiverId) => axios.put(`/message/seen/all/${receiverId}`);

export const apiGetInbox = (userId) => axios.get(`/message/inbox`);
export const apiGetAllChatSessions = () => axios.get(`/message/admin/conversations`);
export const apiGetSendRecent = (userId) => axios.get(`/message/admin/send/recent/${userId}`);