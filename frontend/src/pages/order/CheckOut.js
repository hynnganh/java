import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import Swal from 'sweetalert2';
import axios from 'axios'; 

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadCartAndUser();
    }, []);

    const loadCartAndUser = async () => {
        if (!currentUser || !currentUser.email) {
            Swal.fire('Thông báo', 'Vui lòng đăng nhập để tiếp tục', 'info');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const cartData = await cartService.getActiveCart(currentUser.email);
            if (!cartData || !cartData.products || cartData.products.length === 0) {
                navigate('/cart');
                return;
            }
            setCart(cartData);
            setUser(currentUser);
            setMobileNumber(currentUser.mobileNumber || '');
            setShippingAddress(localStorage.getItem('shippingAddress') || '');
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể tải dữ liệu giỏ hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        const phoneClean = mobileNumber.trim();
        
        if (!phoneClean || !/^[0-9]{10,11}$/.test(phoneClean)) {
            Swal.fire('Lỗi', 'Số điện thoại không hợp lệ (10-11 số)', 'warning');
            return;
        }
        if (!shippingAddress.trim()) {
            Swal.fire('Thông tin trống', 'Vui lòng nhập địa chỉ giao hàng', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận đặt hàng?',
            text: paymentMethod === 'BANKING' ? 'Hệ thống sẽ chuyển hướng đến cổng VNPay' : 'Xác nhận đặt hàng thanh toán tiền mặt',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                setProcessing(true);
                localStorage.setItem('shippingAddress', shippingAddress);
                // --- XỬ LÝ THANH TOÁN ONLINE (GỌI JAVA BACKEND) ---
                if (paymentMethod === 'BANKING') {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`http://localhost:8080/api/payment/create-payment`, {
                        params: { amount: totalAmount },
                        headers: {
                            'Authorization': `Bearer ${token}` // Gửi token lên để Java xác nhận
                        }
                    });
                    if (response.data.url) {
                        localStorage.setItem('pendingOrder', JSON.stringify({
                            email: user.email,
                            cartId: cart.cartId,
                            address: shippingAddress,
                            phone: phoneClean,
                            method: 'BANKING'
                        }));
                        // Chuyển hướng sang VNPay
                        window.location.href = response.data.url;
                        return; 
                    }
                }

                // --- XỬ LÝ THANH TOÁN TIỀN MẶT (COD) ---
                await cartService.createOrder(user.email, cart.cartId, 'COD', shippingAddress, phoneClean);
                await cartService.clearCart(user.email, cart.cartId);
                
                await Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Đơn hàng đã được tiếp nhận.', timer: 2000, showConfirmButton: false });
                navigate('/orders');
                
            } catch (error) {
                console.error("Lỗi đặt hàng:", error);
                Swal.fire('Thất bại', 'Không thể kết nối với máy chủ thanh toán', 'error');
            } finally {
                setProcessing(false);
            }
        }
    };

    const totalAmount = cart ? cartService.calculateTotal(cart.products) : 0;

    if (loading) return <div className="container mt-5 text-center py-5">Đang tải dữ liệu...</div>;

    return (
        <div className="container mt-4 mb-5">
            <div className="mb-3">
                <Link to="/cart" className="text-decoration-none text-dark fw-bold">
                    <i className="fas fa-arrow-left me-2"></i>Quay lại
                </Link>
            </div>
            <h3 className="fw-bold mb-4 text-uppercase text-center">Hoàn tất đặt hàng</h3>
            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-3 border-bottom pb-2">Thông tin người nhận</h5>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Họ và tên</label>
                            <input type="text" className="form-control bg-light" value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-danger">Số điện thoại *</label>
                            <input type="tel" className="form-control border-warning shadow-none" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Số điện thoại shipper liên lạc" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-danger">Địa chỉ giao hàng *</label>
                            <textarea className="form-control border-warning shadow-none" rows="3" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Số nhà, tên đường, phường/xã..."></textarea>
                        </div>

                        <h5 className="fw-bold mt-4 mb-3 border-bottom pb-2">Hình thức thanh toán</h5>
                        <div className={`p-3 mb-2 rounded border d-flex align-items-center ${paymentMethod === 'COD' ? 'border-warning bg-light' : ''}`} onClick={() => setPaymentMethod('COD')} style={{cursor: 'pointer'}}>
                            <input type="radio" checked={paymentMethod === 'COD'} readOnly />
                            <span className="ms-3 fw-bold"><i className="fas fa-truck me-2"></i>Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <div className={`p-3 mb-2 rounded border d-flex align-items-center ${paymentMethod === 'BANKING' ? 'border-warning bg-light' : ''}`} onClick={() => setPaymentMethod('BANKING')} style={{cursor: 'pointer'}}>
                            <input type="radio" checked={paymentMethod === 'BANKING'} readOnly />
                            <span className="ms-3 fw-bold"><i className="fas fa-credit-card me-2"></i>Thanh toán qua VNPay</span>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                        <div className="mb-3" style={{maxHeight: '250px', overflowY: 'auto'}}>
                            {cart.products.map((item, idx) => (
                    <div key={idx} className="d-flex gap-3 mb-3 pb-3 border-bottom border-light">
                        <img
                            src={`http://localhost:8080/api/public/products/image/${item.image}`}
                            width="60" 
                            height="60" 
                            className="rounded-2 shadow-sm object-fit-cover"
                            alt={item.productName}
                        />
                        <div className="flex-grow-1">
                            <div className="small fw-bold text-dark text-truncate" style={{maxWidth: '180px'}}>
                                {item.productName}
                            </div>
                            <div className="small text-muted">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="small fw-bold">
                            {((item.specialPrice || item.price) * item.quantity).toLocaleString()}₫
                        </div>
                    </div>
                ))}
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between h4 fw-bold">
                            <span>Tổng tiền:</span>
                            <span className="text-danger">{totalAmount.toLocaleString()}₫</span>
                        </div>
                        <button className="btn btn-warning w-100 py-3 mt-4 fw-bold rounded-pill text-uppercase shadow-sm" onClick={handlePlaceOrder} disabled={processing}>
                            {processing ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;