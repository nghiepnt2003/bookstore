import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGetBlogList, apiCreateBlog, apiGetMyBlogs, apiUpdateBlog, apiDeleteBlog } from '../../apis';
import { toast } from 'react-toastify';
import { Modal } from '../../components';
import icons from "../../ultils/icons";
import { useSelector } from 'react-redux'

const { FaUser, FaRegEdit,  TiDeleteOutline } = icons;

const BlogForm = ({ onSubmit, closeModal, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null); // Hiển thị ảnh hiện có

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    onSubmit(formData);
    closeModal();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Tạo URL cho ảnh xem trước
    }
  };

  useEffect(() => {
    setTitle(initialData?.title || '');
    setContent(initialData?.content || '');
    setImagePreview(initialData?.image || null); // Hiển thị ảnh hiện có
  }, [initialData]);

  return (
    <div className="relative">
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-3xl"
      >
        &times;
      </button>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">{initialData?.id ? 'Chỉnh sửa Blog' : 'Tạo Blog'}</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề"
          className="border p-2 mb-4 w-full"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung"
          className="border p-2 mb-4 w-full"
          required
        />
        {imagePreview && ( // Hiển thị ảnh xem trước nếu có
          <img src={imagePreview} alt="Preview" className="mt-2 w-1/3 h-[170px]" />
        )}
        <input
          type="file"
          onChange={handleImageChange}
          className="border p-2 mb-4 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {initialData?.id ? 'Cập nhật Blog' : 'Tạo Blog'}
        </button>
      </form>
    </div>
  );
};

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('blogs');
  const [selectedBlog, setSelectedBlog] = useState({});
  const {isLoggedIn} = useSelector(state => state.user)

  const fetchBlogs = async () => {
    const response = await apiGetBlogList();
    if (response.success) {
      setBlogs(response.blogs);
    }
  };

  const fetchMyBlogs = async () => {
    const response = await apiGetMyBlogs();
    if (response.success) {
      setMyBlogs(response.blogs);
    }
  };

  const handleCreateBlog = async (formData) => {
    const response = await apiCreateBlog(formData);
    if (response.success) {
      toast.success("Tạo blog thành công");
      fetchBlogs();
      fetchMyBlogs();
      setIsCreating(false);
    } else {
      toast.error(response.message);
    }
  };

  const handleEditBlog = async (formData) => {
    const response = await apiUpdateBlog(selectedBlog._id, formData);
    if (response.success) {
      toast.success("Cập nhật blog thành công");
      fetchMyBlogs();
      setIsEditing(false);
    } else {
      toast.error(response.message);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteBlog = async (id) => {
    const response = await apiDeleteBlog(id);
    if (response.success) {
      toast.success("Xóa blog thành công");
      fetchMyBlogs(); // Cập nhật danh sách blog của tôi
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="w-main">
      <div>
        <div className='flex justify-between mt-5'>
          <h1 className="text-2xl font-bold mb-4">{activeTab === 'blogs' ? 'Blogs' : 'Blog của tôi'}</h1>
          <div className='flex'>
            <button 
              onClick={() => {
                setActiveTab('blogs');
                fetchBlogs();
              }}
              className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-4"
            >
              <span className="mr-2">📖</span>
              Blogs
            </button>
            {isLoggedIn? 
            <>
              <button 
                onClick={() => {
                  setActiveTab('my-blogs');
                  fetchMyBlogs();
                }}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded mr-4"
              >
                <FaUser className="mr-2" /> 
                Blog của tôi
              </button>
               <button onClick={() => setIsCreating(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              Tạo Blog Mới
              </button>
            </>
            :<></>}
           
          </div>
        </div>

        {isCreating && (
          <Modal closeModal={() => setIsCreating(false)}>
            <BlogForm onSubmit={handleCreateBlog} closeModal={() => setIsCreating(false)} />
          </Modal>
        )}

        {isEditing && (
          <Modal closeModal={() => setIsEditing(false)}>
            <BlogForm 
              onSubmit={handleEditBlog} 
              closeModal={() => setIsEditing(false)} 
              initialData={{ id: selectedBlog?._id, title: selectedBlog?.title, content: selectedBlog?.content, image: selectedBlog?.image }} 
            />
          </Modal>
        )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {activeTab === 'my-blogs' ? (
        myBlogs?.map(blog => (
          <div key={blog?._id} className="border p-4 bg-white h-[400px] flex flex-col relative">
            <Link to={`/blogs/${blog._id}`} className="text-xl">{blog?.title}</Link>
            <TiDeleteOutline 
              className='absolute top-6 right-0 w-[50px] cursor-pointer' 
              onClick={() => handleDeleteBlog(blog._id)} 
            />
            <div className='flex-grow flex mt-2'>
              {blog?.image ? (
                <>
                  <img src={blog?.image} alt={blog?.title} className="w-1/3 object-cover h-[200px]" />
                  <p className="ml-4 w-2/3">{blog?.content}</p>
                </>
              ) : (
                <p className="flex-grow">{blog?.content}</p>
              )}
              <FaRegEdit 
                className='w-[50px] cursor-pointer' 
                onClick={() => {
                  setSelectedBlog(blog);
                  setIsEditing(true);
                }} 
              />
            </div>
          </div>
        ))
      ) : (
        blogs?.map(blog => (
          <div key={blog?._id} className="border p-4 bg-white h-[350px] flex flex-col relative">
            <Link to={`/blogs/${blog._id}`} className="text-xl">{blog?.title}</Link>
            <div className='flex-grow flex mt-2'>
              {blog?.image ? (
                <>
                  <img src={blog?.image} alt={blog?.title} className="w-1/3 object-cover h-[200px]" />
                  <p className="ml-4 w-2/3">{blog?.content}</p>
                </>
              ) : (
                <p className="flex-grow">{blog?.content}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
    </div>
      <div className="w-full h-[100px]"></div>
    </div>
  );
};

export default Blog;