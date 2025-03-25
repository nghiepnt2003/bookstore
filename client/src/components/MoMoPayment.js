import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { apiOrder } from '../apis';

const MoMoPayment = ({ orderId, totalPrice, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handlePayment = async (values) => {
        setLoading(true);
        try {
            const response = apiOrder( {
                payment: 'MOMO',
                recipientName: values.recipient,
                recipientPhone: values.phone,
                shippingAddress: values.address,
            });
            console.log("MOMO " + JSON.stringify(response))

            if (response?.success) {
                window.location.href = response?.momoData?.payUrl;
                // message.success('Thanh toán thành công!');
                // onSuccess(); // Call the onSuccess function to handle success
            } else {
                message.error(response?.message || 'Thanh toán thất bại.');
            }
        } catch (error) {
            message.error('Có lỗi xảy ra: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handlePayment}
            style={{ maxWidth: '400px', margin: '0 auto' }}
        >
            <Form.Item
                label="Tên người nhận"
                name="recipient"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}
            >
                <Input placeholder="Nhập tên người nhận" />
            </Form.Item>
            <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
                <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item
                label="Địa chỉ giao hàng"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
            >
                <Input placeholder="Nhập địa chỉ giao hàng" />
            </Form.Item>
            <p>Tổng tiền: {totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Thanh toán bằng MoMo
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MoMoPayment;