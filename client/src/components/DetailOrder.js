import React from 'react';

const DetailOrder = ({ recipientName, recipientPhone, shippingAddress, totalPrice, details, onClose }) => {
    return (
        <div className='bg-pink-100 w-[600px] p-4 rounded shadow-lg relative'>
            {/* Nút đóng */}
            <button 
                onClick={onClose} 
                className='absolute top-4 right-4 text-gray-600 hover:text-red-600 focus:outline-none'
            >
                X
            </button>

            <div className="mb-4">
                <h3 className="font-bold text-lg border-b pb-2 text-main">Thông tin người nhận</h3>
                <p>Tên: <span className="font-medium">{recipientName}</span></p>
                <p>Điện thoại: <span className="font-medium">{recipientPhone}</span></p>
                <p>Địa chỉ giao hàng: <span className="font-medium">{shippingAddress}</span></p>
                <p>Tổng giá: <span className="font-medium">{totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
            </div>

            <div>
                <h3 className="font-bold text-lg border-b pb-2 text-main">Chi tiết sản phẩm</h3>
                {details?.length > 0 ? (
                    details.map(product => (
                        <div key={product._id} className="flex items-center mb-4">
                            <img src={product.productImage} alt={product.productName} className="w-16 h-16 mr-4 rounded" />
                            <div>
                                <h4 className="font-medium">{product.productName}</h4>
                                <p>Số lượng: <span className="font-medium">{product.quantity}</span></p>
                                <p>Giá: <span className="font-medium">{product.productPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Không có sản phẩm nào trong đơn hàng.</p>
                )}
            </div>
        </div>
    );
};

export default DetailOrder;