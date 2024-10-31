import React from 'react';

const AuthorSelect = ({ authors, selectedAuthors, onChange, onRemove }) => {
    console.log("selectedAuthors " + JSON.stringify(selectedAuthors));

    return (
        <div className="flex flex-col w-full">
            <label htmlFor="author" className="font-semibold mb-1">Tác giả</label>
            <select
                name='author'
                onChange={onChange}
                className="p-2 border border-gray-300 rounded-md text-lg"
                value="" // Có thể điều chỉnh giá trị này nếu cần
            >
                <option value=''>Chọn tác giả</option>
                {authors?.map((auth) => (
                    !selectedAuthors.some(selectedAuth => selectedAuth._id === auth._id) && (
                        <option 
                            key={auth._id} 
                            value={JSON.stringify({ _id: auth._id, name: auth.name })} // Ghi lại đối tượng dưới dạng chuỗi JSON
                        >
                            {auth.name}
                        </option>
                    )
                ))}
            </select>
            <div className="mt-2">
                {selectedAuthors.map(({ _id, name }) => (
                    <span key={_id} className="inline-flex items-center bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                        {name}
                        <button 
                            type="button" 
                            onClick={() => onRemove(_id)} 
                            className="ml-1 text-green-500 hover:text-green-700"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default AuthorSelect;