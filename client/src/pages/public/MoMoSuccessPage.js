import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const MoMotSuccessPage = () => {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <Result
                status="success"
                title="Thanh toán thành công!"
                subTitle="Cảm ơn bạn đã mua hàng! Đơn hàng của bạn đã được thanh toán."
                extra={[
                    <Link to="/products" key="products">
                        <Button type="primary">Quay lại trang sản phẩm</Button>
                    </Link>,
                    <Link to="/" key="home">
                        <Button>Về trang chủ</Button>
                    </Link>
                ]}
            />
        </div>
    );
};

export default MoMotSuccessPage;