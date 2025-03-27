// import React from 'react';
// import { Result, Button } from 'antd';
// import { Link } from 'react-router-dom';

// const MoMotSuccessPage = () => {
//     return (
//         <div style={{ padding: '50px', textAlign: 'center' }}>
//             <Result
//                 status="success"
//                 title="Thanh toán thành công!"
//                 subTitle="Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được thanh toán."
//                 extra={[
//                     <Link to="/products" key="products">
//                         <Button type="primary">Quay lại trang sản phẩm</Button>
//                     </Link>,
//                     <Link to="/" key="home">
//                         <Button>Về trang chủ</Button>
//                     </Link>
//                 ]}
//             />
//         </div>
//     );
// };

// export default MoMotSuccessPage;


import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const MoMotSuccessPage = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://png.pngtree.com/thumb_back/fw800/background/20190223/ourmid/pngtree-fresh-hand-drawn-book-dot-advertising-background-backgroundfreshsimplecirclebookhand-paintedlovelyknow-how-image_73514.jpg')" }}>
            <Result
                className="text-white text-center"
                status="success"
                title="Thanh toán thành công!"
                subTitle="Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được thanh toán."
                extra={[
                    <Link to="/member/buy-history" key="products">
                        <Button type="primary" className="mr-2">Đến trang xem đơn hàng</Button>
                    </Link>,
                    <Link to="/" key="home">
                        <Button className="bg-white hover:bg-main">Về trang chủ</Button>
                    </Link>
                ]}
            />
        </div>
    );
};

export default MoMotSuccessPage;