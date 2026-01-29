import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import Swal from 'sweetalert2';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const finalize = async () => {
            const vnpCode = searchParams.get('vnp_ResponseCode');
            const pending = JSON.parse(localStorage.getItem('pendingOrder'));

            // "00" là mã thành công của VNPay
            if (vnpCode === "00" && pending) {
                try {
                    // --- XỬ LÝ LƯU ĐƠN ONLINE TƯƠNG TỰ COD ---
                    // Gọi đúng hàm createOrder như bên Checkout nhưng đổi phương thức thành 'BANKING'
                    await cartService.createOrder(
                        pending.email, 
                        pending.cartId, 
                        'BANKING', 
                        pending.address, 
                        pending.phone
                    );

                    // Xóa giỏ hàng sau khi tạo đơn thành công
                    await cartService.clearCart(pending.email, pending.cartId);
                    
                    // Dọn dẹp localStorage
                    localStorage.removeItem('pendingOrder');

                    await Swal.fire({
                        icon: 'success',
                        title: 'Thanh toán thành công!',
                        text: 'Đơn hàng của bạn đã được lưu vào hệ thống.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    
                    navigate('/orders');
                } catch (error) {
                    console.error('❌ Lỗi lưu đơn hàng:', error);
                    Swal.fire('Lỗi hệ thống', 'Thanh toán đã khớp nhưng không thể tạo đơn hàng. Hãy chụp màn hình và liên hệ hỗ trợ!', 'error');
                }
            } else {
                Swal.fire('Thất bại', 'Giao dịch không thành công hoặc đã bị hủy.', 'error');
                navigate('/cart');
            }
        };
        finalize();
    }, [searchParams, navigate]);

    return (
        <div className="container text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <h4 className="mt-3">Đang xử lý đơn hàng...</h4>
        </div>
    );
};

export default PaymentSuccess;