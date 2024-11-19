// import React, { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// const EditAuthorForm = ({ author, onUpdate, onCancel, fetchAuthors }) => {
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         image: ''
//     });
//     const [errors, setErrors] = useState({});

//     useEffect(() => {
//         if (author) {
//             setFormData({
//                 name: author.name,
//                 description: author.description,
//                 image: author.image
//             });
//         }
//     }, [author]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
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
//         if (response.success) {
//             toast.success(response.message);
//             onCancel();
//             fetchAuthors(); // Đảm bảo rằng bạn gọi fetchAuthors ở đây
//         } else {
//             toast.error(response.message);
//         }
//     };

//     const handleFormClick = (e) => {
//         e.stopPropagation(); // Ngăn chặn cú nhấp chuột đóng modal
//     };

//     return (
//         <form
//             onClick={handleFormClick}
//             onSubmit={handleSubmit}
//             className="flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white w-96 mx-auto"
//         >
//             <div className="flex flex-col">
//                 <label htmlFor="name" className="font-semibold mb-1">Tên tác giả</label>
//                 <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Tên tác giả"
//                     className="p-2 border border-gray-300 rounded-md text-lg"
//                 />
//                 {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
//             </div>
//             <div className="flex flex-col">
//                 <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
//                 <textarea
//                     id="description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Mô tả"
//                     className="p-2 border border-gray-300 rounded-md text-lg"
//                 />
//                 {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
//             </div>
//             <div className="flex flex-col">
//                 <label htmlFor="image" className="font-semibold mb-1">Đường dẫn hình ảnh</label>
//                 <input
//                     type="text"
//                     id="image"
//                     name="image"
//                     value={formData.image}
//                     onChange={handleChange}
//                     placeholder="Đường dẫn hình ảnh"
//                     className="p-2 border border-gray-300 rounded-md text-lg"
//                 />
//                 {errors.image && <span className="text-red-500 text-sm mt-1">{errors.image}</span>}
//             </div>
//             <div className="flex justify-between">
//                 <button type="submit" className="px-4 py-2 bg-main text-white rounded-md hover:bg-main transition">
//                     Cập nhật
//                 </button>
//                 <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
//                     Hủy
//                 </button>
//             </div>
//         </form>
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
        image: ''
    });
    const [errors, setErrors] = useState({});
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        if (author) {
            setFormData({
                name: author.name,
                description: author.description,
                image: author.image
            });
            setAvatar(author.image); // Cập nhật avatar từ thông tin tác giả
        }
    }, [author]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Yêu cầu nhập tên tác giả';
        if (!formData.description) newErrors.description = 'Yêu cầu nhập mô tả';
        if (!formData.image) newErrors.image = 'Yêu cầu nhập đường dẫn hình ảnh';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const response = await onUpdate(formData, author._id);
        if (response.success) {
            onCancel();
            fetchAuthors(); // Gọi lại danh sách tác giả
            toast.success('Cập nhật tác giả thành công')
            // showToast('Cập nhật tác giả thành công', 'success'); // Gọi showToast từ cha
        } else {
            toast.error(response.message);
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
    };

    return (
        <div className='w-[600px] flex flex-col gap-4 p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
            <form onClick={handleFormClick} onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Cột Avatar */}
                <div className="flex flex-col items-center">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer opacity-0 absolute h-32 w-32"
                    />
                    {avatar ? (
                        <div className="relative">
                            <img
                                src={avatar}
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