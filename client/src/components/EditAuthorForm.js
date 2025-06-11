// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';
// import icons from '../ultils/icons';

// const { TiCameraOutline } = icons;

// const EditAuthorForm = ({ author, onUpdate, onCancel, fetchAuthors }) => {
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         image: ''
//     });
//     const [errors, setErrors] = useState({});
//     const [avatar, setAvatar] = useState('');

//     useEffect(() => {
//         if (author) {
//             setFormData({
//                 name: author.name,
//                 description: author.description,
//                 image: author.image
//             });
//             setAvatar(author.image); // Cập nhật avatar từ thông tin tác giả
//         }
//     }, [author]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setAvatar(reader.result);
//                 setFormData(prev => ({ ...prev, image: reader?.result }));
//             };
//             reader.readAsDataURL(file);
//         }
//     };
    

//     const validateForm = () => {
//         const newErrors = {};
//         if (!formData.name) newErrors.name = 'Yêu cầu nhập tên tác giả';
//         if (!formData.description) newErrors.description = 'Yêu cầu nhập mô tả';
//         if (!formData.image) newErrors.image = 'Yêu cầu nhập đường dẫn hình ảnh';
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         const response = await onUpdate(formData, author._id);
//         if (response?.success) {
//             onCancel();
//             fetchAuthors(); // Gọi lại danh sách tác giả
//             toast.success('Cập nhật thành công')
//             // showToast('Cập nhật tác giả thành công', 'success'); // Gọi showToast từ cha
//         } else {
//             toast.error(response?.message);
//         }
//     };

//     const handleFormClick = (e) => {
//         e.stopPropagation(); // Ngăn chặn modal đóng
//     };

//     return (
//         <div className='w-[600px] flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
//             <form onClick={handleFormClick} onSubmit={handleSubmit} className="flex flex-col gap-4">
//                 {/* Cột Avatar */}
//                 <div className="flex flex-col items-center w-full relative border border-gray-300 rounded-md h-40">
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleFileChange}
//                         // className="cursor-pointer opacity-0 absolute h-32 w-32"
//                         className='absolute inset-0 cursor-pointer opacity-0 z-10'
//                     />
//                     {avatar ? (
//                         <div className="relative">
//                             <img
//                                 src={avatar}
//                                 alt="Avatar Preview"
//                                 className="w-32 h-32 object-cover border border-gray-300 rounded-md p-2"
//                             />
//                             <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
//                         </div>
//                     ) : (
//                         <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
//                             <TiCameraOutline className="h-8 w-8 text-gray-400" />
//                         </div>
//                     )}
//                 </div>

//                 {/* Tên Tác Giả */}
//                 <div className="flex flex-col">
//                     <label htmlFor="name" className="font-semibold mb-1">Tên tác giả</label>
//                     <input
//                         type="text"
//                         id="name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleChange}
//                         placeholder="Tên tác giả"
//                         className="p-2 border border-gray-300 rounded-md text-lg"
//                     />
//                     {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
//                 </div>

//                 {/* Mô Tả */}
//                 <div className="flex flex-col">
//                     <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
//                     <textarea
//                         id="description"
//                         name="description"
//                         value={formData.description}
//                         onChange={handleChange}
//                         placeholder="Mô tả"
//                         className="p-2 border border-gray-300 rounded-md text-lg"
//                     />
//                     {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
//                 </div>
//                 {/* Nút Cập Nhật và Hủy */}
//                 <div className="flex justify-between mt-4">
//                     <button type="submit" className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
//                         Cập nhật
//                     </button>
//                     <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
//                         Hủy
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditAuthorForm;


import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import icons from '../ultils/icons';

const { TiCameraOutline } = icons;

const EditAuthorForm = ({ author, onUpdate, onCancel, fetchAuthors }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        // Không còn lưu 'image' (Base64) trực tiếp trong formData nữa, chỉ dùng cho preview
    });
    const [errors, setErrors] = useState({});
    const [avatar, setAvatar] = useState(''); // Dùng để hiển thị ảnh preview (Base64 hoặc URL)
    const [selectedFile, setSelectedFile] = useState(null); // **MỚI**: Lưu trữ đối tượng File thực tế

    useEffect(() => {
        if (author) {
            setFormData({
                name: author.name,
                description: author.description,
            });
            setAvatar(author.image); // Cập nhật avatar từ URL ảnh của tác giả hiện tại
            setSelectedFile(null); // Đảm bảo không có file nào được chọn sẵn khi form mở
        }
    }, [author]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- Xử lý thay đổi file ảnh (đã cập nhật) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // **Lưu trữ file thực tế**
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Chuyển đổi thành Base64 để hiển thị preview
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null); // Nếu người dùng bỏ chọn file
            setAvatar(author.image); // Quay lại ảnh gốc nếu có, hoặc để trống
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Yêu cầu nhập tên tác giả';
        if (!formData.description) newErrors.description = 'Yêu cầu nhập mô tả';
        
        // Kiểm tra xem có ảnh hiện tại hay đã chọn ảnh mới chưa
        if (!avatar && !selectedFile) { 
            newErrors.image = 'Yêu cầu nhập đường dẫn hình ảnh hoặc chọn ảnh mới';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Tạo đối tượng FormData
        const authorFormData = new FormData();
        authorFormData.append('name', formData.name);
        authorFormData.append('description', formData.description);

        // Chỉ thêm 'image' vào FormData nếu có file mới được chọn
        if (selectedFile) {
            authorFormData.append('image', selectedFile);
        } 
        // else {
        //     // Nếu không có file mới được chọn, bạn có thể cân nhắc gửi lại URL ảnh cũ
        //     // hoặc không gửi trường 'image' nếu API của bạn xử lý tốt việc không nhận được file ảnh mới
        //     // Tuy nhiên, nếu API của bạn yêu cầu trường 'image' luôn phải có, 
        //     // và bạn muốn giữ ảnh cũ, bạn có thể gửi lại author.image (là URL)
        //     // nhưng điều này có thể không hoạt động tốt với multipart/form-data
        //     // Cách an toàn hơn là để backend tự xử lý nếu không nhận được file ảnh mới.
        //     // authorFormData.append('image_url', author.image); // Ví dụ: gửi URL ảnh cũ nếu cần
        // }


        const response = await onUpdate(authorFormData, author._id); // Truyền FormData và ID
        if (response?.success) {
            onCancel();
            fetchAuthors();
            toast.success('Cập nhật thành công');
        } else {
            toast.error(response?.message || 'Có lỗi xảy ra khi cập nhật.');
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
    };

    return (
        <div className='w-[600px] flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
            <form onClick={handleFormClick} onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Cột Avatar */}
                <div className="flex flex-col items-center w-full relative border border-gray-300 rounded-md h-40">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className='absolute inset-0 cursor-pointer opacity-0 z-10'
                    />
                    {avatar ? (
                        <div className="relative">
                            <img
                                src={avatar} // Hiển thị preview Base64 hoặc URL ảnh gốc
                                alt="Avatar Preview"
                                className="w-32 h-32 object-cover border border-gray-300 rounded-md p-2"
                            />
                            <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
                            <TiCameraOutline className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    {errors.image && <span className="text-red-500 text-sm mt-1">{errors.image}</span>}
                </div>

                {/* Tên Tác Giả */}
                <div className="flex flex-col">
                    <label htmlFor="name" className="font-semibold mb-1">Tên tác giả</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tên tác giả"
                        className="p-2 border border-gray-300 rounded-md text-lg"
                    />
                    {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                </div>

                {/* Mô Tả */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả"
                        rows={3} // Tăng số hàng để dễ nhập liệu hơn
                        className="p-2 border border-gray-300 rounded-md text-lg"
                    />
                    {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
                </div>
                
                {/* Nút Cập Nhật và Hủy */}
                <div className="flex justify-between mt-4">
                    <button type="submit" className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
                        Cập nhật
                    </button>
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAuthorForm;