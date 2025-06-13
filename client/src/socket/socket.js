// import io from 'socket.io-client';

// const getToken = () => {
//     let localStorageData = window.localStorage.getItem('persist:shop/user');
//     if (localStorageData) {
//         localStorageData = JSON.parse(localStorageData);
//         const accessToken = JSON.parse(localStorageData?.token);
//         return accessToken;
//     }
//     return null;
// };

// let socket = io('http://localhost:3000', {
//     auth: {
//         token: `Bearer ${getToken()}`
//     },
// });

// export default socket;

// export const initiateSocketConnection = () => {
//     const token = getToken();
//     socket = io(import.meta.env.VITE_APP_API_URI, {
//         auth: {
//             token: `Bearer ${token}`
//         },
//     });
//     console.log('Connecting socket...');
//     return socket;
// };

// export const disconnectSocket = () => {
//     console.log('Disconnecting socket...');
//     if (socket) socket.disconnect();
// };

// export const joinRoom = (user1, user2) => {
//     if (socket) {
//         const roomId = `room_${Math.min(user1, user2)}_${Math.max(user1, user2)}`;
//         socket.emit('joinConversation', { user1, user2 });
//     }
// };

// export const subscribeToChat = (cb) => {
//     if (!socket) return true;

//     socket.on('receiveMessage', (msg) => {
//         console.log('New message received!');
//         cb(msg);
//     });
// };

// export const sendMessage = (sender, receiver, content) => {
//     if (socket) {
//         socket.emit('sendMessage', { sender, receiver, content });
//     }
// };

// export const deleteMessage = (messageId, sender) => {
//     if (socket) {
//         socket.emit('deleteMessage', { messageId, sender });
//     }
// };

// export const markAsRead = (messageId, receiver) => {
//     if (socket) {
//         socket.emit('markAsRead', { messageId, receiver });
//     }
// };

// src/socket/socket.js
import { io } from "socket.io-client";

const URL_SERVER = process.env.REACT_APP_API_URI;
const socket = io(URL_SERVER); // Thay đổi URL này nếu cần

export default socket;
