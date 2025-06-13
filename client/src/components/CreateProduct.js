// components/CreateProduct.js
import React, { memo, useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { apiGetAuthors, apiCreateProduct, apiGetPublishers } from "../apis";
import { toast } from "react-toastify";
import { Spin } from "antd";
import icons from "../ultils/icons";
import CategorySelect from "./CategorySelect"; // Giả định bạn có component này
import AuthorSelect from "./AuthorSelect"; // Giả định bạn có component này
// import compressImage from './compressImage'; // Bạn có thể không cần hàm này nếu không muốn nén ảnh trước khi gửi

const { TiCameraOutline } = icons; // Biểu tượng camera

const CreateProduct = ({ onClose, onRefresh }) => {
  const { categories } = useSelector((state) => state.app); // Lấy danh mục từ Redux store

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    pageNumber: "",
    author: [], // Sẽ được xử lý bởi AuthorSelect
    publisher: "",
    categories: [], // Sẽ được xử lý bởi CategorySelect
    description: "",
    soldCount: 0, // Mặc định số lượng đã bán là 0
    // Không còn lưu 'image' (Base64) trực tiếp trong formData nữa
  });
  const [avatar, setAvatar] = useState(""); // Dùng để hiển thị ảnh preview (vẫn là Base64)
  const [selectedFile, setSelectedFile] = useState(null); // Lưu trữ đối tượng File thực tế
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);

  // --- Fetch Authors và Publishers ---
  const fetchAuthors = async () => {
    try {
      const response = await apiGetAuthors();
      if (response.success && Array.isArray(response.authors)) {
        setAuthors(response.authors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await apiGetPublishers();
      if (response.success && Array.isArray(response.publishers)) {
        setPublishers(response.publishers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuthors();
    fetchPublishers();
  }, []);

  // --- Xử lý thay đổi file ảnh ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Lưu trữ file thực tế để gửi đi
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Chuyển đổi thành Base64 để hiển thị preview
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Xử lý thêm sản phẩm ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, price, pageNumber, publisher, description, soldCount } =
      formData;

    // Kiểm tra các trường bắt buộc
    if (
      !name ||
      !price ||
      !pageNumber ||
      selectedCategories.length === 0 ||
      selectedAuthors.length === 0 ||
      !publisher ||
      !selectedFile
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin và chọn ảnh sản phẩm.");
      setLoading(false);
      return;
    }

    // Tạo đối tượng FormData để gửi file và các trường khác
    const productFormData = new FormData();
    productFormData.append("name", name);
    productFormData.append("price", price);
    productFormData.append("pageNumber", pageNumber);
    productFormData.append("publisher", publisher);
    productFormData.append("description", description);
    productFormData.append("soldCount", soldCount);

    // Thêm từng ID của category và author vào FormData
    selectedCategories.forEach((cat) =>
      productFormData.append("categories[]", cat._id)
    );
    selectedAuthors.forEach((auth) =>
      productFormData.append("author[]", auth._id)
    );

    productFormData.append("image", selectedFile); // Thêm file ảnh thực tế vào FormData

    try {
      const response = await apiCreateProduct(productFormData); // Gửi FormData
      if (response.success) {
        toast.success("Thêm sản phẩm thành công");
        onRefresh(); // Gọi hàm refresh danh sách sản phẩm
        onClose(); // Đóng modal
      } else {
        toast.error(response?.message || "Có lỗi xảy ra khi tạo sản phẩm.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClick = (e) => {
    e.stopPropagation(); // Ngăn chặn modal đóng khi click vào form
  };

  // --- Xử lý Category và Author Select ---
  const removeCategory = useCallback((categoryId) => {
    setSelectedCategories((prev) =>
      prev.filter((cat) => cat._id !== categoryId)
    );
  }, []);

  const handleSelectChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "category" && value) {
        const selectedCategory = JSON.parse(value);
        if (
          !selectedCategories.some((cat) => cat._id === selectedCategory._id)
        ) {
          setSelectedCategories((prev) => [...prev, selectedCategory]);
        }
      }
    },
    [selectedCategories]
  );

  const handleSelectChangeAuthor = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "author" && value) {
        const selectedAuthor = JSON.parse(value);
        if (!selectedAuthors.some((auth) => auth._id === selectedAuthor._id)) {
          setSelectedAuthors((prev) => [...prev, selectedAuthor]);
        }
      }
    },
    [selectedAuthors]
  );

  const removeAuthor = useCallback((authId) => {
    setSelectedAuthors((prev) => prev.filter((auth) => auth._id !== authId));
  }, []);

  // --- Hàm cập nhật formData khi nhập các trường text/number ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (
      (name === "price" || name === "pageNumber" || name === "soldCount") &&
      Number(value) < 0
    ) {
      return; // Ngăn không cho cập nhật giá trị âm
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Spin size="large" spinning={loading}>
      <div className="w-[900px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto">
        <form
          onClick={handleFormClick}
          onSubmit={handleAddProduct}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Cột Avatar */}
          <div className="flex flex-col items-center w-full md:w-1/4 relative border border-gray-300 rounded-md h-80">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 cursor-pointer opacity-0 z-10"
            />
            {avatar ? (
              <div className="relative">
                <img
                  src={avatar} // Hiển thị preview Base64
                  alt="Avatar Preview"
                  className="w-50 h-80 object-cover p-4"
                />
                <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
              </div>
            ) : (
              <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
                <TiCameraOutline className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Cột Thông Tin Sản Phẩm */}
          <div className="flex flex-col w-full md:w-3/4 border border-gray-300 rounded-md p-4">
            {/* Tên Sản Phẩm */}
            <div className="flex flex-col w-full mb-4">
              <label htmlFor="name" className="font-semibold mb-1">
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md text-lg"
                required
              />
            </div>

            {/* Giá, Số Trang, và Số Lượng Đã Bán */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex flex-col flex-1">
                <label htmlFor="price" className="font-semibold mb-1">
                  Giá
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  min="0"
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              <div className="flex flex-col flex-1">
                <label htmlFor="pageNumber" className="font-semibold mb-1">
                  Số trang
                </label>
                <input
                  type="number"
                  name="pageNumber"
                  min="0"
                  value={formData.pageNumber}
                  onChange={handleInputChange}
                  className="p-2 border border-gray-300 rounded-md text-lg"
                  required
                />
              </div>
              {/* <div className="flex flex-col flex-1">
                                <label htmlFor="soldCount" className="font-semibold mb-1">Đã bán</label>
                                <input
                                    type='number'
                                    name='soldCount'
                                    value={formData.soldCount || 0}
                                    readOnly
                                    className="p-2 border border-gray-300 bg-slate-100 rounded-md text-lg"
                                />
                            </div> */}
            </div>

            {/* Mô Tả */}
            <div className="flex flex-col mb-4">
              <label htmlFor="description" className="font-semibold mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3} // Tăng số hàng để dễ nhập liệu hơn
                className="p-2 border border-gray-300 rounded-md text-lg"
              />
            </div>

            {/* Component Chọn Danh Mục */}
            <CategorySelect
              categories={categories}
              selectedCategories={selectedCategories}
              onChange={handleSelectChange}
              onRemove={removeCategory}
            />

            {/* Component Chọn Tác Giả */}
            <AuthorSelect
              authors={authors}
              selectedAuthors={selectedAuthors}
              onChange={handleSelectChangeAuthor}
              onRemove={removeAuthor}
            />

            {/* Nhà Xuất Bản */}
            <div className="flex flex-col mb-4">
              <label htmlFor="publisher" className="font-semibold mb-1">
                Nhà xuất bản
              </label>
              <select
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                className="p-2 border border-gray-300 rounded-md text-lg"
                required
              >
                <option value="">Chọn nhà xuất bản</option>
                {publishers.map((publisher) => (
                  <option key={publisher._id} value={publisher._id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Nút Thêm và Đóng */}
        <div className="flex justify-between mt-4">
          <button
            type="submit"
            onClick={handleAddProduct}
            className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition"
          >
            Thêm sản phẩm
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </Spin>
  );
};

export default memo(CreateProduct);
