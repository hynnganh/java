import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import Swal from 'sweetalert2';

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [shippingAddress, setShippingAddress] = useState('');
    const [mobileNumber, setMobileNumber] = useState(''); // State cho số điện thoại
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        loadCartAndUser();
    }, []);

    const loadCartAndUser = async () => {
        if (!currentUser || !currentUser.email) {
            Swal.fire('Thông báo', 'Vui lòng đăng nhập để tiếp tục thanh toán', 'info');
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const cartData = await cartService.getActiveCart(currentUser.email);
            
            if (!cartData || !cartData.products || cartData.products.length === 0) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Giỏ hàng trống',
                    text: 'Bạn không có sản phẩm nào để thanh toán.',
                });
                navigate('/cart');
                return;
            }
            
            setCart(cartData);
            setUser(currentUser);
            
            // Tự động điền nếu user đã có SĐT trong profile, nếu không khách phải tự nhập
            setMobileNumber(currentUser.mobileNumber || '');
            setShippingAddress(localStorage.getItem('shippingAddress') || '');

        } catch (error) {
            console.error('❌ Lỗi tải thông tin:', error);
            Swal.fire('Lỗi', 'Không thể tải dữ liệu giỏ hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        // 1. Kiểm tra Số điện thoại
        const phoneClean = mobileNumber.trim();
        if (!phoneClean) {
            Swal.fire('Thông tin trống', 'Vui lòng nhập số điện thoại để shipper liên lạc', 'warning');
            return;
        }

        const phoneRegex = /^[0-9]{10,11}$/; // Kiểm tra 10-11 chữ số
        if (!phoneRegex.test(phoneClean)) {
            Swal.fire('Lỗi định dạng', 'Số điện thoại phải là dãy số từ 10-11 chữ số', 'warning');
            return;
        }

        // 2. Kiểm tra Địa chỉ
        if (!shippingAddress.trim()) {
            Swal.fire('Thông tin trống', 'Vui lòng nhập địa chỉ giao hàng chi tiết', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Xác nhận đặt hàng?',
            text: `Đơn hàng sẽ được giao đến địa chỉ: ${shippingAddress}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Đồng ý đặt hàng',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                setProcessing(true);
                localStorage.setItem('shippingAddress', shippingAddress);

                // Gửi kèm số điện thoại và địa chỉ cho Backend
                const order = await cartService.createOrder(
                    user.email, 
                    cart.cartId, 
                    paymentMethod, 
                    shippingAddress,
                    phoneClean // Đảm bảo backend đã hỗ trợ tham số này
                );

                await cartService.clearCart(user.email, cart.cartId);
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Đơn hàng của bạn đã được tiếp nhận.',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                navigate('/orders', { state: { message: 'Đặt hàng thành công!' } });
                
            } catch (error) {
                Swal.fire('Thất bại', error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng', 'error');
            } finally {
                setProcessing(false);
            }
        }
    };

    const totalAmount = cart ? cartService.calculateTotal(cart.products) : 0;

    if (loading) return (
        <div className="container mt-5 text-center py-5">
            <div className="spinner-grow text-warning" role="status"></div>
            <p className="mt-3 text-muted">Đang chuẩn bị đơn hàng...</p>
        </div>
    );

    return (
        <div className="container mt-4 mb-5">
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Trang chủ</Link></li>
                    <li className="breadcrumb-item"><Link to="/cart" className="text-decoration-none text-muted">Giỏ hàng</Link></li>
                    <li className="breadcrumb-item active fw-bold text-dark">Thanh toán</li>
                </ol>
            </nav>

            <h3 className="fw-bold mb-4"><i className="fas fa-check-circle me-2 text-success"></i>HOÀN TẤT ĐẶT HÀNG</h3>

            <div className="row g-4">
                {/* Cột trái: Thông tin khách hàng */}
                <div className="col-lg-7">
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4 border-bottom pb-2">Thông tin giao hàng</h5>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase">Họ và tên người nhận</label>
                                    <input type="text" className="form-control py-2 bg-light border-0" value={`${user?.firstName || ''} ${user?.lastName || ''}`} readOnly />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-danger text-uppercase">Số điện thoại liên lạc *</label>
                                    <input 
                                        type="tel" 
                                        className="form-control py-2 border-warning shadow-none" 
                                        placeholder="Nhập số điện thoại để shipper gọi cho bạn..."
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-danger text-uppercase">Địa chỉ chi tiết *</label>
                                    <textarea 
                                        className="form-control border-warning shadow-none" 
                                        rows="3" 
                                        placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..."
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <h5 className="fw-bold mb-4 border-bottom pb-2">Phương thức thanh toán</h5>
                        {['COD', 'BANKING', 'MOMO'].map((method) => (
                            <div 
                                key={method}
                                className={`payment-item p-3 mb-2 rounded-3 border d-flex align-items-center cursor-pointer ${paymentMethod === method ? 'border-warning bg-light-warning' : ''}`}
                                onClick={() => setPaymentMethod(method)}
                                style={{ cursor: 'pointer' }}
                            >
                                <input 
                                    className="form-check-input mt-0 ml-0" 
                                    type="radio" 
                                    checked={paymentMethod === method}
                                    onChange={() => {}} // Đã xử lý bằng thẻ cha
                                />
                                <div className="d-flex align-items-center ml-4">
                                    <i className={`fas fa-${method === 'COD' ? 'money-bill-wave' : (method === 'BANKING' ? 'university' : 'wallet')} me-3 text-muted`}></i>
                                    <div>
                                        <div className="fw-bold small">
                                            {method === 'COD' ? 'Thanh toán khi nhận hàng' : (method === 'BANKING' ? 'Chuyển khoản Ngân hàng' : 'Ví điện tử MoMo')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cột phải: Tóm tắt đơn hàng */}
                <div className="col-lg-5">
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">Chi tiết đơn hàng</h5>
                            <div className="order-items-scroll mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {cart.products.map((item, idx) => (
                                    <div key={idx} className="d-flex gap-3 mb-3 pb-3 border-bottom-dashed">
                                        <img 
                                            src={`http://localhost:8080/api/public/products/image/${item.image}`} 
                                            width="50" height="50" className="rounded-2 shadow-sm object-fit-cover" 
                                            alt="" 
                                        />
                                        <div className="flex-grow-1">
                                            <div className="small fw-bold text-dark text-truncate" style={{maxWidth: '200px'}}>{item.productName}</div>
                                            <div className="small text-muted">Số lượng: {item.quantity}</div>
                                        </div>
                                        <div className="small fw-bold">
                                            {((item.specialPrice || item.price) * item.quantity).toLocaleString()}₫
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tạm tính:</span>
                                <span className="fw-bold">{totalAmount.toLocaleString()}₫</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Phí vận chuyển:</span>
                                <span className="text-success fw-bold">Miễn phí</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <span className="h5 fw-bold">Tổng tiền:</span>
                                <span className="h4 fw-bold text-danger">{totalAmount.toLocaleString()}₫</span>
                            </div>
                            
                            <button 
                                className="btn btn-warning w-100 py-3 fw-bold rounded-pill shadow-warning-btn transition-transform"
                                onClick={handlePlaceOrder}
                                disabled={processing}
                            >
                                {processing ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>ĐANG XỬ LÝ...</>
                                ) : 'XÁC NHẬN ĐẶT HÀNG'}
                            </button>
                            
                            <p className="text-center mt-3 mb-0 small text-muted">
                                Bằng cách đặt hàng, bạn đồng ý với các điều khoản của chúng tôi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .border-bottom-dashed { border-bottom: 1px dashed #eee; }
                .bg-light-warning { background-color: #fff9e6; }
                .shadow-warning-btn { box-shadow: 0 8px 15px -5px rgba(255, 193, 7, 0.4); }
                .transition-transform:active { transform: scale(0.98); }
                .cursor-pointer { cursor: pointer; }
                .rounded-4 { border-radius: 1rem !important; }
                .order-items-scroll::-webkit-scrollbar { width: 4px; }
                .order-items-scroll::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default Checkout;