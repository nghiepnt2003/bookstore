const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
require("dotenv").config();

// Initialize cache
let booksDataCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Sửa model name

// Lưu lịch sử chat theo người dùng
const userChatHistories = new Map();

// System prompt
const SYSTEM_PROMPT = `
You are a friendly AI assistant, SPECIALIZED in book consultation and book-related matters.
You will help users with:
- Finding and recommending books based on their preferences
- Providing information about authors and book genres
- Advising on topics related to books, bookstores, and reading
- A book always has a title, author, and genre, description, page_number, publisher. If you mention a book, always include these details.

STRICT RULES:
1. ALWAYS refuse to answer any questions not related to books.
2. For questions about programming, mathematics, or other fields, suggest books on those topics instead of answering directly.
3. NEVER provide code or algorithms, instead recommend appropriate programming books.
4. DO NOT answer questions about politics, religion, or sensitive topics.
5. Always response politely and encourage users to explore books for more information.
6. Always response with vietnamese language.
7. Always response briefly and concisely, focusing on book recommendations.
8. Do not use markdown or any formatting in responses.
9. Each book information is a bullet point, and a line break.
10. If the user asks about a book not in the database, suggest similar books from the database.
When receiving a non-book-related question, respond with:
"I apologize, but I can only provide advice about books and book-related matters. Instead of answering your question directly, would you like me to recommend some excellent books on this topic?"
;`;

// Tin nhắn chào khi bắt đầu
const INITIAL_GREETING =
  "Xin chào! Tôi rất vui được giúp đỡ bạn. Tôi là trợ lý AI chuyên về sách. Bạn cần tôi tư vấn gì về sách không?";

class AIChatController {
  constructor() {
    this.handleChat = this.handleChat.bind(this);
  }

  // Lấy hoặc khởi tạo lịch sử chat
  getChatHistory(userId) {
    if (!userChatHistories.has(userId)) {
      const initialHistory = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: INITIAL_GREETING }] },
      ];
      userChatHistories.set(userId, initialHistory);
    }
    return userChatHistories.get(userId);
  }

  // Cập nhật lịch sử chat
  updateChatHistory(userId, userMessage, aiResponse) {
    const history = this.getChatHistory(userId);

    // Thêm tin nhắn mới
    const updatedHistory = [
      ...history,
      { role: "user", parts: [{ text: userMessage }] },
      { role: "model", parts: [{ text: aiResponse }] },
    ];

    // Giới hạn độ dài lịch sử
    const maxLength = 10;
    let finalHistory;
    if (updatedHistory.length > maxLength) {
      const systemPrompt = updatedHistory[0];
      const greeting = updatedHistory[1];
      const recentMessages = updatedHistory.slice(-6); // Giữ 3 cặp tin nhắn gần nhất
      finalHistory = [systemPrompt, greeting, ...recentMessages];
    } else {
      finalHistory = updatedHistory;
    }

    userChatHistories.set(userId, finalHistory);
    return finalHistory;
  }

  // Xây dựng context string từ lịch sử
  buildContextString(history) {
    const recentMessages = history.slice(2); // Bỏ qua system prompt và greeting
    if (recentMessages.length === 0) return "";

    let context = "\nCONTEXT CUỘC TRÒ CHUYỆN TRƯỚC ĐÓ:\n";
    for (let i = 0; i < recentMessages.length; i += 2) {
      const userMsg = recentMessages[i];
      const aiMsg = recentMessages[i + 1];
      if (userMsg && aiMsg) {
        context += `Người dùng hỏi: ${userMsg.parts[0].text}\n`;
        context += `Tôi đã trả lời: ${aiMsg.parts[0].text}\n\n`;
      }
    }
    return context;
  }

  // Fetch books data từ database với cache
  async getBookData() {
    const now = Date.now();

    // Kiểm tra cache
    if (
      booksDataCache &&
      lastFetchTime &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      console.log("Sử dụng cached book data");
      return booksDataCache;
    }

    try {
      console.log("Fetching fresh book data from database");
      const books = await Product.find()
        .populate("author", "name")
        .populate("publisher", "name")
        .populate("categories", "name")
        .select(
          "name author publisher categories description pageNumber price"
        );
      // Format data thành string cho AI
      let booksInfo = "THÔNG TIN SÁCH TRONG CỬA HÀNG:\n\n";
      books.forEach((book, index) => {
        booksInfo += `${index + 1}. Sách: ${book.name}\n`;
        booksInfo += `   - Tác giả: ${
          book.author?.map((c) => c.name).join(", ") || "Không có thông tin"
        }\n`;
        booksInfo += `   - Nhà xuất bản: ${
          book.publisher?.name || "Không có thông tin"
        }\n`;
        booksInfo += `   - Thể loại: ${
          book.categories?.map((c) => c.name).join(", ") || "Không có thông tin"
        }\n`;
        booksInfo += `   - Số trang: ${
          book.pageNumber || "Không có thông tin"
        }\n`;
        booksInfo += `   - Giá: ${book.price?.toLocaleString("vi-VN")}đ\n`;
        booksInfo += `   - Mô tả: ${book.description || "Không có mô tả"}\n\n`;
      });

      // Cập nhật cache
      booksDataCache = booksInfo;
      lastFetchTime = now;

      return booksInfo;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sách:", error);
      // Nếu có lỗi nhưng có cache cũ, sử dụng cache
      if (booksDataCache) {
        console.log("Sử dụng cached data do lỗi fetch");
        return booksDataCache;
      }
      return "";
    }
  }

  // Khởi tạo cache khi start server
  async initCache() {
    await this.getBookData();
    console.log("Đã khởi tạo book data cache");
  }

  // Xử lý yêu cầu chat từ người dùng
  async handleChat(req, res) {
    const { message } = req.body;
    const userId = req.user?.id || "default-user";

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    try {
      // Fetch dữ liệu sách từ database
      const booksData = await this.getBookData();

      const history = this.getChatHistory(userId);
      const contextString = this.buildContextString(history);

      // Thêm thông tin sách vào system prompt
      const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n${booksData}\n\nLưu ý: Hãy sử dụng thông tin sách ở trên để trả lời câu hỏi của người dùng. Nếu được hỏi về sách không có trong danh sách, hãy giới thiệu các sách tương tự từ danh sách trên.`; // Tạo chat mới với context đầy đủ
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: `${enhancedSystemPrompt}\n${contextString}` }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Đã hiểu. Tôi sẽ trả lời dựa trên context cuộc trò chuyện.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topP: 0.8,
          topK: 40,
        },
      });

      // Gửi tin nhắn và đợi phản hồi
      const result = await chat.sendMessage([{ text: message }]);
      const aiResponse = await result.response.text();

      // Cập nhật lịch sử
      const updatedHistory = this.updateChatHistory(
        userId,
        message,
        aiResponse
      );

      return res.status(200).json({
        success: true,
        message: aiResponse,
        debug: {
          historyLength: updatedHistory.length,
          contextIncluded: contextString !== "",
          lastUserMessage: message,
        },
      });
    } catch (error) {
      console.error("Lỗi khi xử lý Gemini chat:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xử lý tin nhắn AI. Vui lòng thử lại sau.",
        error: error.message,
      });
    }
  }
}

// Khởi tạo cache khi start server
const aiChatController = new AIChatController();
aiChatController.initCache();

module.exports = aiChatController;
