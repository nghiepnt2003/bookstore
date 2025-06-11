import React from 'react';

const DetailInventory = ({ viewInventory, onClose }) => {
    console.log(viewInventory);
    return (
        <div className="relative p-6 bg-pink-100 w-[450px]">
            <button 
                onClick={onClose} 
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
                aria-label="Close"
            >
                &times; {/* This is the close icon */}
            </button>
            <h2 className="text-xl font-bold mb-4">Chi tiết nhập hàng</h2>
            <p><strong>Ghi chú:</strong> {viewInventory.note}</p>
            <p><strong>Tổng chi phí:</strong> {viewInventory.totalCost} VNĐ</p>
            <p><strong>Ngày cập nhật:</strong> {new Date(viewInventory.updatedAt).toLocaleDateString()}</p>
            <h3 className="mt-4 text-lg">Chi tiết sản phẩm:</h3>
            <ul className="list-disc pl-5">
                {viewInventory?.inventoryDetails?.map((detail, index) => (
                    <div key={index} className="mb-2 flex items-center">
                        <img src={detail.productId.image} className='w-[50px] object-cover mr-4' alt={detail.productId.name} />
                        <div>
                            <span>{detail.productId.name}</span><br />
                            <span>Số lượng: {detail.quantity}</span><br />
                            <span>Giá nhập: {detail.unitCost} VNĐ</span>
                        </div>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default DetailInventory;