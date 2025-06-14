import axios from "../axios";

export const apiSendMessageToAI = (data) =>
  axios({
    url: "/ai-chat/chat",
    method: "post",
    data,
  });
