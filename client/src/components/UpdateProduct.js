// import React, { memo, useEffect, useState, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { apiGetAuthors, apiGetPublishers, apiUpdateProduct } from '../apis';
// import { toast } from 'react-toastify';
// import { Spin } from 'antd';
// import icons from '../ultils/icons';
// import CategorySelect from './CategorySelect';
// import AuthorSelect from './AuthorSelect';
// import compressImage from './compressImage';

// const { TiCameraOutline } = icons;

// const UpdateProduct = ({ editProduct, onClose, onRefresh }) => {
//     const { categories } = useSelector(state => state.app);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         name: '',
//         price: '',
//         pageNumber: '',
//         author: [],
//         publisher: '',
//         categories: [],
//         description: '',
//         soldCount: 0,
//         image: '',
//     });
//     const [avatar, setAvatar] = useState('');
//     const [selectedCategories, setSelectedCategories] = useState([]);
//     const [selectedAuthors, setSelectedAuthors] = useState([]);
//     const [authors, setAuthors] = useState([]);
//     const [publishers, setPublishers] = useState([]);

//     useEffect(() => {
//         if (editProduct) {
//             setFormData({
//                 name: editProduct.name || '',
//                 price: editProduct.price || '',
//                 pageNumber: editProduct.pageNumber || '',
//                 author: editProduct.author?.map(auth => auth._id) || [],
//                 publisher: editProduct.publisher?._id || '',
//                 categories: editProduct.categories?.map(cat => cat._id) || [],
//                 description: editProduct.description || '',
//                 soldCount: editProduct.soldCount || 0,
//                 image: editProduct.image || '',
//             });
//             setAvatar(editProduct.image);
//             setSelectedCategories(editProduct.categories?.map(cat => ({ _id: cat._id, name: cat.name })) || []);
//             setSelectedAuthors(editProduct.author?.map(auth => ({_id: auth._id, name: auth.name})) || []);
//         }
//     }, [editProduct]);

//     const fetchAuthors = async () => {
//         try {
//             const response = await apiGetAuthors();
//             if (response.success && Array.isArray(response.authors)) {
//                 setAuthors(response.authors);
//             }
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     const fetchPublishers = async () => {
//         try {
//             const response = await apiGetPublishers();
//             if (response.success && Array.isArray(response.publishers)) {
//                 setPublishers(response.publishers)
//             }
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     useEffect(() => {
//         fetchAuthors();
//         fetchPublishers()
//     }, []);

//     // const handleFileChange = (e) => {
//     //     const file = e.target.files[0];
//     //     if (file) {
//     //         const reader = new FileReader();
//     //         reader.onloadend = () => {
//     //             setAvatar(reader.result);
//     //             setFormData(prev => ({ ...prev, image: reader.result }));
//     //         };
//     //         reader.readAsDataURL(file);
//     //     }
//     // };

//     // const handleFileChange = async (e) => {
//     //     const file = e.target.files[0];
//     //     if (file) {
//     //         const compressedImage = await compressImage(file);
//     //         setAvatar(compressedImage);
//     //         setFormData(prev => ({ ...prev, image: compressedImage }));
//     //     }
//     //     // reader.readAsDataURL(file);
//     // };

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             // setSelectedFile(file); // Lưu trữ file thực tế để gửi đi
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setAvatar(reader.result); 
//                 setFormData(prev => ({ ...prev, image: reader.result }))
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleUpdateProduct = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         const { name, price, publisher, image , pageNumber} = formData;
//         if (!name || !price  || !pageNumber || selectedCategories.length === 0 || selectedAuthors.length === 0 || !publisher || !image) {
//             toast.error('Vui lòng điền đầy đủ thông tin');
//             setLoading(false); // Đặt loading về false nếu có lỗi
//             e.stopPropagation();
//             return; // Ngăn không cho tiếp tục
//         }
//         try {
//             console.log("FORMDATA " + JSON.stringify(formData))
//             console.log("ANH LỚN "+formData.image.length)
//             const response = await apiUpdateProduct({ ...formData, categories: selectedCategories, author: selectedAuthors }, editProduct._id);
//             if (response.success) {
//                 toast.success('Cập nhật thành công');
//                 onRefresh();
//                 onClose();
//             } else {
//                 toast.error(response.message);
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error('Có lỗi xảy ra');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleFormClick = (e) => {
//         e.stopPropagation(); // Ngăn chặn modal đóng
//     };

//     const removeCategory = useCallback((categoryId) => {
//         setSelectedCategories(prev => prev.filter(cat => cat._id !== categoryId));
//     }, []);

//     const handleSelectChange = useCallback((e) => {
//         const { name, value } = e.target;
//         if (name === 'category' && value) {
//             const selectedCategory = JSON.parse(value);
//             if (!selectedCategories.some(cat => cat._id === selectedCategory._id)) {
//                 setSelectedCategories(prev => [...prev, selectedCategory]);
//             }
//         }
//     }, [selectedCategories]);

//     const handleSelectChangeAuthor = useCallback((e) => {
//         const { name, value } = e.target;
//         if (name === 'author' && value) {
//             const selectedAuthor = JSON.parse(value);
//             if (!selectedAuthors.some(auth => auth._id === selectedAuthor._id)) {
//                 setSelectedAuthors(prev => [...prev, selectedAuthor]);
//             }
//         }
//     }, [selectedAuthors]);

//     const removeAuthor = useCallback((authId) => {
//         setSelectedAuthors(prev => prev.filter(auth => auth._id !== authId));
//     }, []);

//     // Hàm cập nhật formData khi nhập
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         // Chỉ cập nhật nếu giá trị không âm
//         if ((name === 'price' || name === 'pageNumber') && Number(value) < 0) {
//             return; // Ngăn không cho cập nhật giá trị âm
//         }
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     return (
//         <Spin size='large' spinning={loading}>
//             <div className='w-[900px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
//                 <form onClick={handleFormClick} onSubmit={handleUpdateProduct} className="flex flex-col md:flex-row gap-4">
//                     {/* Cột Avatar */}
//                     <div className="flex flex-col items-center w-full md:w-1/4 relative border border-gray-300 rounded-md h-80">
//                         <input
//                             type='file'
//                             accept="image/*"
//                             onChange={handleFileChange}
//                             className="absolute inset-0 cursor-pointer opacity-0 z-10"
//                         />
//                         {avatar ? (
//                             <div className="relative">
//                                 <img
//                                     src={avatar}
//                                     alt="Avatar Preview"
//                                     className="w-50 h-80 object-cover p-4"
//                                 />
//                                 <TiCameraOutline className="absolute bottom-2 right-2 h-8 w-8 text-white bg-gray-600 rounded-full p-1" />
//                             </div>
//                         ) : (
//                             <div className="w-32 h-32 border border-gray-300 rounded-md flex items-center justify-center">
//                                 <TiCameraOutline className="h-8 w-8 text-gray-400" />
//                             </div>
//                         )}
//                     </div>

//                     {/* Cột Thông Tin Sản Phẩm */}
//                     <div className="flex flex-col w-full md:w-3/4 border border-gray-300 rounded-md p-4">
//                         {/* Tên Sản Phẩm */}
//                         <div className="flex flex-col w-full">
//                             <label htmlFor="name" className="font-semibold mb-1">Tên sản phẩm</label>
//                             <input
//                                 type='text'
//                                 name='name'
//                                 value={formData.name}
//                                 onChange={handleInputChange} // Thêm onChange
//                                 className="p-2 border border-gray-300 rounded-md text-lg"
//                             />
//                         </div>

//                         {/* Giá, Số Trang, và Số Lượng Còn Lại */}
//                         <div className="flex flex-col md:flex-row gap-4">
//                             <div className="flex flex-col">
//                                 <label htmlFor="price" className="font-semibold mb-1">Giá</label>
//                                 <input
//                                     type='number'
//                                     name='price'
//                                     value={formData.price}
//                                     onChange={handleInputChange} // Thêm onChange
//                                     className="p-2 border border-gray-300 rounded-md text-lg"
//                                 />
//                             </div>
//                             <div className="flex flex-col w-[160px]">
//                                 <label htmlFor="pageNumber" className="font-semibold mb-1">Số trang</label>
//                                 <input
//                                     type='number'
//                                     name='pageNumber'
//                                     value={formData.pageNumber}
//                                     onChange={handleInputChange} // Thêm onChange
//                                     className="p-2 border border-gray-300 rounded-md text-lg"
//                                 />
//                             </div>
//                             <div className="flex flex-col w-[160px]">
//                                 <label htmlFor="soldCount" className="font-semibold mb-1">Đã bán</label>
//                                 <input
//                                     type='number'
//                                     name='soldCount'
//                                     value={formData.soldCount}
//                                     readOnly
//                                     className="p-2 border border-gray-300 rounded-md bg-slate-100 text-lg"
//                                 />
//                             </div>
//                         </div>

//                         {/* Mô Tả */}
//                         <div className="flex flex-col">
//                             <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
//                             <textarea
//                                 name='description'
//                                 value={formData.description}
//                                 onChange={handleInputChange} // Thêm onChange
//                                 className="p-2 border border-gray-300 rounded-md text-lg"
//                             />
//                         </div>
//                         <CategorySelect
//                             categories={categories}
//                             selectedCategories={selectedCategories}
//                             onChange={handleSelectChange}
//                             onRemove={removeCategory}
//                         />
//                         <AuthorSelect
//                             authors={authors}
//                             selectedAuthors={selectedAuthors}
//                             onChange={handleSelectChangeAuthor}
//                             onRemove={removeAuthor}
//                         />

//                         {/* Nhà Xuất Bản */}
//                         <div className="flex flex-col">
//                             <label htmlFor="publisher" className="font-semibold mb-1">Nhà xuất bản</label>
//                             <select
//                                 name='publisher'
//                                 value={formData.publisher}
//                                 onChange={handleInputChange} // Thêm onChange
//                                 className="p-2 border border-gray-300 rounded-md text-lg"
//                             >
//                                 <option value=''>Chọn nhà xuất bản</option>
//                                 {publishers.map((publisher) => (
//                                     <option key={publisher._id} value={publisher._id}>
//                                         {publisher.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </form>

//                 {/* Nút Cập Nhật và Đóng */}
//                 <div className="flex justify-between mt-4">
//                     <button type='submit' onClick={handleUpdateProduct} className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
//                         Cập nhật sản phẩm
//                     </button>
//                     <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
//                         Đóng
//                     </button>
//                 </div>
//             </div>
//         </Spin>
//     );
// };

// export default memo(UpdateProduct);


import React, { memo, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { apiGetAuthors, apiGetPublishers, apiUpdateProduct } from '../apis';
import { toast } from 'react-toastify';
import { Spin } from 'antd';
import icons from '../ultils/icons';
import CategorySelect from './CategorySelect';
import AuthorSelect from './AuthorSelect';
// import compressImage from './compressImage'; // Có thể bỏ nếu không nén

const { TiCameraOutline } = icons;

const UpdateProduct = ({ editProduct, onClose, onRefresh }) => {
    const { categories } = useSelector(state => state.app);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        pageNumber: '',
        // author và categories sẽ được quản lý bởi selectedAuthors/Categories
        publisher: '',
        description: '',
        soldCount: 0,
        // Không còn lưu 'image' (Base64) trực tiếp trong formData nữa
    });
    const [avatar, setAvatar] = useState(''); // Dùng để hiển thị ảnh preview
    const [selectedFile, setSelectedFile] = useState(null); // **MỚI**: Lưu trữ đối tượng File thực tế
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);

    useEffect(() => {
        if (editProduct) {
            setFormData({
                name: editProduct.name || '',
                price: editProduct.price || '',
                pageNumber: editProduct.pageNumber || '',
                publisher: editProduct.publisher?._id || '',
                description: editProduct.description || '',
                soldCount: editProduct.soldCount || 0,
                // Không cần đặt image vào formData ban đầu vì sẽ gửi qua selectedFile
            });
            // Nếu có ảnh cũ, đặt nó làm avatar preview và không có selectedFile ban đầu
            setAvatar(editProduct.image || '');
            setSelectedFile(null); // Đảm bảo không có file mới nào được chọn khi khởi tạo

            // Đặt các danh mục và tác giả đã chọn từ dữ liệu editProduct
            setSelectedCategories(editProduct.categories?.map(cat => ({ _id: cat._id, name: cat.name })) || []);
            setSelectedAuthors(editProduct.author?.map(auth => ({ _id: auth._id, name: auth.name })) || []);
        }
    }, [editProduct]);

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

    // --- Xử lý thay đổi file ảnh (đã cập nhật) ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Lưu trữ file thực tế để gửi đi
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result); // Chuyển đổi thành Base64 để hiển thị preview
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null); // Nếu người dùng bỏ chọn file
            setAvatar(editProduct.image || ''); // Quay lại ảnh cũ nếu có
        }
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { name, price, pageNumber, publisher, description, soldCount } = formData;

        // Kiểm tra các trường bắt buộc
        if (!name || !price || !pageNumber || selectedCategories.length === 0 || selectedAuthors.length === 0 || !publisher) {
            toast.error('Vui lòng điền đầy đủ thông tin.');
            setLoading(false);
            return;
        }

        // Tạo đối tượng FormData để gửi file và các trường khác
        const productUpdateFormData = new FormData();
        productUpdateFormData.append('name', name);
        productUpdateFormData.append('price', price);
        productUpdateFormData.append('pageNumber', pageNumber);
        productUpdateFormData.append('publisher', publisher);
        productUpdateFormData.append('description', description);
        productUpdateFormData.append('soldCount', soldCount);

        // Thêm từng ID của category và author đã chọn
        selectedCategories.forEach(cat => productUpdateFormData.append('categories[]', cat._id));
        selectedAuthors.forEach(auth => productUpdateFormData.append('author[]', auth._id));

        // CHỈ THÊM ẢNH VÀO FORM DATA NẾU CÓ ẢNH MỚI ĐƯỢC CHỌN
        if (selectedFile) {
            productUpdateFormData.append('image', selectedFile); // Thêm file ảnh thực tế vào FormData
        } else if (editProduct.image) {
            // Nếu không có file mới được chọn nhưng có ảnh cũ, gửi đường dẫn ảnh cũ để backend biết
            // Điều này phụ thuộc vào cách backend của bạn xử lý cập nhật ảnh khi không có file mới được tải lên
            // Một số backend sẽ bỏ qua trường ảnh nếu không có file mới, một số sẽ cần đường dẫn ảnh cũ.
            // Để an toàn, bạn có thể gửi lại đường dẫn ảnh cũ nếu không có ảnh mới được chọn.
            productUpdateFormData.append('image', editProduct.image);
        } else {
            // Trường hợp không có ảnh cũ và cũng không có ảnh mới (hiếm khi xảy ra với sản phẩm)
            // Có thể thêm một giá trị rỗng hoặc không thêm trường 'image' vào FormData.
        }

        try {
            const response = await apiUpdateProduct(productUpdateFormData, editProduct._id); // Gửi FormData
            if (response.success) {
                toast.success('Cập nhật sản phẩm thành công');
                onRefresh();
                onClose();
            } else {
                toast.error(response?.message+': '+response?.error || 'Có lỗi xảy ra khi cập nhật sản phẩm.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFormClick = (e) => {
        e.stopPropagation(); // Ngăn chặn modal đóng
    };

    const removeCategory = useCallback((categoryId) => {
        setSelectedCategories(prev => prev.filter(cat => cat._id !== categoryId));
    }, []);

    const handleSelectChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'category' && value) {
            const selectedCategory = JSON.parse(value);
            if (!selectedCategories.some(cat => cat._id === selectedCategory._id)) {
                setSelectedCategories(prev => [...prev, selectedCategory]);
            }
        }
    }, [selectedCategories]);

    const handleSelectChangeAuthor = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'author' && value) {
            const selectedAuthor = JSON.parse(value);
            if (!selectedAuthors.some(auth => auth._id === selectedAuthor._id)) {
                setSelectedAuthors(prev => [...prev, selectedAuthor]);
            }
        }
    }, [selectedAuthors]);

    const removeAuthor = useCallback((authId) => {
        setSelectedAuthors(prev => prev.filter(auth => auth._id !== authId));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'price' || name === 'pageNumber' || name === 'soldCount') && Number(value) < 0) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Spin size='large' spinning={loading}>
            <div className='w-[900px] flex flex-col gap-4 relative p-6 border border-gray-300 rounded-lg bg-white mx-auto'>
                <form onClick={handleFormClick} onSubmit={handleUpdateProduct} className="flex flex-col md:flex-row gap-4">
                    {/* Cột Avatar */}
                    <div className="flex flex-col items-center w-full md:w-1/4 relative border border-gray-300 rounded-md h-80">
                        <input
                            type='file'
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 cursor-pointer opacity-0 z-10"
                        />
                        {avatar ? (
                            <div className="relative">
                                <img
                                    src={avatar} // Hiển thị preview (có thể là URL ảnh cũ hoặc Base64 ảnh mới)
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
                            <label htmlFor="name" className="font-semibold mb-1">Tên sản phẩm</label>
                            <input
                                type='text'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-md text-lg"
                                required
                            />
                        </div>

                        {/* Giá, Số Trang, và Số Lượng Đã Bán */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex flex-col flex-1">
                                <label htmlFor="price" className="font-semibold mb-1">Giá</label>
                                <input
                                    type='number'
                                    name='price'
                                    value={formData.price}
                                    min="0"
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md text-lg"
                                    required
                                />
                            </div>
                            <div className="flex flex-col flex-1">
                                <label htmlFor="pageNumber" className="font-semibold mb-1">Số trang</label>
                                <input
                                    type='number'
                                    name='pageNumber'
                                    min="0"
                                    value={formData.pageNumber}
                                    onChange={handleInputChange}
                                    className="p-2 border border-gray-300 rounded-md text-lg"
                                    required
                                />
                            </div>
                            <div className="flex flex-col w-[100px]">
                                <label htmlFor="soldCount" className="font-semibold mb-1">Đã bán</label>
                                <input
                                    type='number'
                                    name='soldCount'
                                    value={formData.soldCount || 0}
                                    readOnly
                                    className="p-2 border border-gray-300 bg-slate-100 rounded-md text-lg"
                                />
                            </div>
                        </div>

                        {/* Mô Tả */}
                        <div className="flex flex-col mb-4">
                            <label htmlFor="description" className="font-semibold mb-1">Mô tả</label>
                            <textarea
                                name='description'
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
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
                            <label htmlFor="publisher" className="font-semibold mb-1">Nhà xuất bản</label>
                            <select
                                name='publisher'
                                value={formData.publisher}
                                onChange={handleInputChange}
                                className="p-2 border border-gray-300 rounded-md text-lg"
                                required
                            >
                                <option value=''>Chọn nhà xuất bản</option>
                                {publishers.map((publisher) => (
                                    <option key={publisher._id} value={publisher._id}>
                                        {publisher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>

                {/* Nút Cập Nhật và Đóng */}
                <div className="flex justify-between mt-4">
                    <button type='submit' onClick={handleUpdateProduct} className="px-4 py-2 bg-main text-white rounded-md hover:bg-[#FF66CC] transition">
                        Cập nhật sản phẩm
                    </button>
                    <button type='button' onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition">
                        Đóng
                    </button>
                </div>
            </div>
        </Spin>
    );
};

export default memo(UpdateProduct);