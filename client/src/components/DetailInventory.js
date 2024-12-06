import React from 'react';

const DetailInventory = ({ viewInventory, onClose }) => {
    console.log(viewInventory)
    return (
        <div className="p-6 bg-white w-[300px]">
            <h2 className="text-xl font-bold mb-4">Chi tiết nhập hàng</h2>
            <p><strong>Ghi chú:</strong> {viewInventory.note}</p>
            <p><strong>Tổng chi phí:</strong> {viewInventory.totalCost} VNĐ</p>
            <p><strong>Ngày cập nhật:</strong> {new Date(viewInventory.updatedAt).toLocaleDateString()}</p>
            <h3 className="mt-4 text-lg">Chi tiết sản phẩm:</h3>
            <ul className="list-disc pl-5">
                {viewInventory?.inventoryDetails?.map((detail, index) => (
                    <li key={index} className="mb-2">
                        <span>{detail.name}</span>
                        <span>Số lượng: {detail.quantity}</span><br />
                        <span>Giá nhập: {detail.unitCost} VNĐ</span>
                    </li>
                ))}
            </ul>
            <button 
                onClick={onClose} 
                className="mt-4 bg-main text-white p-2 rounded"
            >
                Đóng
            </button>
        </div>
    );
};

export default DetailInventory;