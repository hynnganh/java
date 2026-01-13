import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../../services/cartService';
import Swal from 'sweetalert2';

const ProductCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user')) || { email: null };

  useEffect(() => {
    if (!currentUser.email) {
      setLoading(false);
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await cartService.getActiveCart(currentUser.email);
      setCart(cartData);
    } catch (error) {
      console.error('❌ Lỗi tải giỏ hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Cập nhật UI tạm thời (Local State) để gõ phím mượt mà
  const updateLocalQty = (productId, newQty) => {
    setCart(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.productId === productId ? { ...p, quantity: newQty } : p
      )
    }));
  };

  // 2. Xử lý khi gõ trực tiếp vào ô input
  const handleInputChange = (item, value) => {
    // Chỉ lấy số, loại bỏ ký tự lạ
    const val = value.replace(/[^0-9]/g, '');
    if (val === '') {
      updateLocalQty(item.productId, '');
      return;
    }

    const num = parseInt(val);
    const stock = item.productQuantity || 99; // Giả định tồn kho nếu backend chưa có

    if (num > stock) {
      Swal.fire({
        title: 'Hết hàng',
        text: `Sản phẩm này chỉ còn ${stock} món trong kho`,
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
      updateLocalQty(item.productId, stock);
    } else {
      updateLocalQty(item.productId, num);
    }
  };

  // 3. Gửi API đồng bộ dữ liệu (Khi bấm nút hoặc khi rời ô input - OnBlur)
  const syncQuantity = async (productId, finalQty) => {
    if (finalQty === '' || finalQty < 1) {
      loadCart(); // Reset về dữ liệu cũ từ server nếu nhập bậy
      return;
    }
    
    try {
      setUpdatingId(productId);
      await cartService.updateQuantity(cart.cartId, productId, finalQty);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật số lượng', 'error');
      loadCart();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: "Bạn chắc chắn muốn bỏ sản phẩm này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ffc107',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý'
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingId(productId);
      setCart(prev => ({
        ...prev,
        products: prev.products.filter(p => p.productId !== productId)
      }));
      await cartService.removeFromCart(cart.cartId, productId);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      loadCart();
      Swal.fire('Lỗi', 'Không thể xóa sản phẩm', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateCartTotal = () => {
    return cart?.products?.reduce((total, item) => {
      const price = item.productPrice || item.specialPrice || item.price || 0;
      return total + (price * (parseInt(item.quantity) || 0));
    }, 0) || 0;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning"></div>
      <p className="mt-2">Đang tải giỏ hàng...</p>
    </div>
  );

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <div className="container m-5 text-center">
        <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
        <h3 className="text-muted">Giỏ hàng trống</h3>
        <Link to="/product" className="btn btn-warning mt-3 px-4 rounded-pill fw-bold">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4 text-primary"><i className="fas fa-shopping-basket me-2"></i>GIỎ HÀNG CỦA BẠN</h2>
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            {cart.products.map((item) => (
              <div key={item.productId} className={`row align-items-center p-3 border-bottom m-0 ${updatingId === item.productId ? 'item-updating' : ''}`}>
                <div className="col-3 col-md-2">
                  <img 
                    src={`http://localhost:8080/api/public/products/image/${item.image}`} 
                    className="img-fluid rounded shadow-sm" alt={item.productName} 
                  />
                </div>
                <div className="col-9 col-md-4">
                  <h6 className="mb-1 fw-bold text-dark">{item.productName}</h6>
                  <p className="text-muted small mb-0">Đơn giá: <span className="text-danger">{(item.productPrice || item.price).toLocaleString()}₫</span></p>
                </div>
                
                {/* Bộ điều khiển số lượng nhập tay */}
                <div className="col-6 col-md-3 mt-3 mt-md-0 d-flex justify-content-center">
                  <div className="quantity-toggle">
                    <button 
                      className="quantity-btn"
                      onClick={() => {
                        const newQty = parseInt(item.quantity) - 1;
                        updateLocalQty(item.productId, newQty);
                        syncQuantity(item.productId, newQty);
                      }}
                      disabled={item.quantity <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    
                    <input 
                      type="text" 
                      className="quantity-input" 
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item, e.target.value)}
                      onBlur={(e) => syncQuantity(item.productId, parseInt(e.target.value))}
                    />
                    
                    <button 
                      className="quantity-btn"
                      onClick={() => {
                        const newQty = (parseInt(item.quantity) || 0) + 1;
                        if (newQty <= (item.productQuantity || 99)) {
                          updateLocalQty(item.productId, newQty);
                          syncQuantity(item.productId, newQty);
                        } else {
                          Swal.fire('Hết hàng', 'Không thể thêm quá số lượng tồn kho', 'info');
                        }
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div className="col-6 col-md-3 text-end">
                  <p className="fw-bold text-dark mb-1">{( (item.productPrice || item.price) * (item.quantity || 0)).toLocaleString()}₫</p>
                  <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleRemoveItem(item.productId)}>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tổng kết thanh toán */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Hóa đơn của bạn</h5>
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Tạm tính:</span>
              <span>{calculateCartTotal().toLocaleString()}₫</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Vận chuyển:</span>
              <span className="text-success fw-bold">Miễn phí</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="h5 fw-bold">Tổng cộng:</span>
              <span className="h5 fw-bold text-danger">{calculateCartTotal().toLocaleString()}₫</span>
            </div>
            <button className="btn btn-warning w-100 py-3 fw-bold rounded-pill shadow" onClick={() => navigate('/checkout')}>
              TIẾN HÀNH THANH TOÁN
            </button>
            <Link to="/product" className="btn btn-link w-100 text-muted mt-2 text-decoration-none">
              <i className="fas fa-arrow-left me-2"></i>Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;