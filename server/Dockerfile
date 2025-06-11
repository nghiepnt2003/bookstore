# Sử dụng image Node.js phiên bản 20.15.1
FROM node:20.15.1

# Thiết lập thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install --production

# Sao chép toàn bộ mã nguồn từ thư mục src vào thư mục làm việc
COPY src ./src 

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "src/server.js"]  