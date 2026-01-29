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

  // Hàm xử lý tăng/giảm số lượng khi bấm nút
  const handleQtyChange = async (item, change) => {
    const currentQty = parseInt(item.quantity) || 0;
    const newQty = currentQty + change;
    const stock = item.productQuantity || 99;

    if (newQty < 1) {
      handleRemoveItem(item.productId);
      return;
    }

    if (newQty > stock) {
      Swal.fire({
        title: 'Hết hàng',
        text: `Sản phẩm này chỉ còn ${stock} món`,
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    // Cập nhật UI nhanh cho người dùng thấy (Optimistic Update)
    updateLocalQty(item.productId, newQty);
    
    // Đồng bộ ngay lập tức với Server
    await syncQuantity(item.productId, newQty);
  };

  const updateLocalQty = (productId, newQty) => {
    setCart(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.productId === productId ? { ...p, quantity: newQty } : p
      )
    }));
  };

  const handleInputChange = (item, value) => {
    const val = value.replace(/[^0-9]/g, '');
    if (val === '') {
      updateLocalQty(item.productId, '');
      return;
    }
    const num = parseInt(val);
    const stock = item.productQuantity || 99;
    if (num > stock) {
      updateLocalQty(item.productId, stock);
    } else {
      updateLocalQty(item.productId, num);
    }
  };

  const syncQuantity = async (productId, finalQty) => {
    if (finalQty === '' || finalQty < 1) {
      loadCart();
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
      const unitPrice = item.specialPrice ?? item.productPrice ?? item.price ?? 0;
      return total + unitPrice * (parseInt(item.quantity) || 0);
    }, 0) || 0;
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-warning"></div>
      <p className="mt-2 text-muted">Đang kiểm tra giỏ hàng...</p>
    </div>
  );

  if (!cart || !cart.products || cart.products.length === 0) {
    return (
      <div className="container my-5 text-center py-5 shadow-sm rounded bg-white">
        <i className="fas fa-shopping-basket fa-4x text-light mb-3 d-block"></i>
        <h3 className="text-muted">Giỏ hàng đang trống</h3>
        <p className="text-muted small">Hãy quay lại cửa hàng để chọn sản phẩm ưng ý nhé!</p>
        <Link to="/product" className="btn btn-warning mt-3 px-5 py-2 fw-bold text-white rounded-pill shadow-sm">
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">GIỎ HÀNG <span className="text-muted fs-6">({cart.products.length} sản phẩm)</span></h4>
          </div>

          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            {cart.products.map(item => {
              const unitPrice = item.specialPrice ?? item.productPrice ?? item.price;
              const isUpdating = updatingId === item.productId;

              return (
                <div key={item.productId} className={`row align-items-center p-3 border-bottom m-0 ${isUpdating ? 'opacity-50' : ''}`}>
                  {/* Ảnh sản phẩm */}
                  <div className="col-3 col-md-2">
                    <img
                      src={`https://java-lbdz.onrender.com/api/public/products/image/${item.image}`}
                      className="img-fluid rounded-3 border"
                      alt={item.productName}
                    />
                  </div>

                  {/* Thông tin tên & giá */}
                  <div className="col-9 col-md-4">
                    <h6 className="fw-bold text-truncate mb-1">{item.productName}</h6>
                    <div className="d-flex align-items-center">
                      <span className="text-danger fw-bold">{unitPrice.toLocaleString()}₫</span>
                      {item.specialPrice < item.productPrice && (
                        <small className="text-muted text-decoration-line-through ms-2">{item.productPrice.toLocaleString()}₫</small>
                      )}
                    </div>
                  </div>

                  {/* BỘ NÚT TĂNG GIẢM */}
                  <div className="col-6 col-md-3 mt-3 mt-md-0 d-flex justify-content-center">
  <div className="input-group input-group-sm quantity-wrapper shadow-sm border rounded-pill overflow-hidden" style={{ width: 'fit-content' }}>
    {/* Nút Giảm */}
    <button 
      className="btn btn-white border-0 px-3" 
      type="button"
      disabled={updatingId === item.productId} // Khóa khi đang xử lý
      onClick={() => handleQtyChange(item, -1)}
    >
      <i className={`fas ${item.quantity <= 1 ? 'fa-trash-alt text-danger' : 'fa-minus'} small`}></i>
    </button>
    
    {/* Input Số lượng */}
    <input
      type="text"
      className="form-control text-center fw-bold border-0 bg-white"
      style={{ width: '50px', fontSize: '0.9rem', boxShadow: 'none' }}
      value={item.quantity}
      disabled={updatingId === item.productId}
      onChange={e => handleInputChange(item, e.target.value)}
      onBlur={e => syncQuantity(item.productId, parseInt(e.target.value))}
    />

    {/* Nút Tăng */}
    <button 
      className="btn btn-white border-0 px-3" 
      type="button"
      disabled={updatingId === item.productId}
      onClick={() => handleQtyChange(item, 1)}
    >
      <i className="fas fa-plus small"></i>
    </button>
  </div>
</div>

                  {/* Thành tiền & Xóa */}
                  <div className="col-6 col-md-3 mt-3 mt-md-0 text-end">
                    <div className="fw-bold text-dark mb-2">
                      {(unitPrice * (parseInt(item.quantity) || 0)).toLocaleString()}₫
                    </div>
                    <button
                      className="btn btn-link text-muted p-0 text-decoration-none small-hover"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      <i className="fas fa-trash-alt me-1"></i> Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cột phải: Hóa đơn */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card border-0 shadow-sm p-4 rounded-4 sticky-top" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-4">TÓM TẮT ĐƠN HÀNG</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tạm tính:</span>
              <span>{calculateCartTotal().toLocaleString()}₫</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Giao hàng:</span>
              <span className="text-success fw-bold">Miễn phí</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <span className="fw-bold fs-5">TỔNG CỘNG:</span>
              <span className="fw-bold fs-4 text-danger">
                {calculateCartTotal().toLocaleString()}₫
              </span>
            </div>

            <button
              className="btn btn-warning w-100 py-3 fw-bold text-white rounded-pill shadow"
              onClick={() => navigate('/checkout')}
            >
              TIẾN HÀNH THANH TOÁN
            </button>
            <p className="text-center mt-3 mb-0 small text-muted">
              <i className="fas fa-shield-alt me-1"></i> Thanh toán an toàn 100%
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .quantity-wrapper {
          border: 1px solid #dee2e6;
          border-radius: 20px;
          overflow: hidden;
          background: #f8f9fa;
        }
        .quantity-wrapper .btn {
          background: #fff;
          padding: 5px 12px;
        }
        .quantity-wrapper .btn:hover {
          background: #f1f1f1;
        }
        .small-hover:hover {
          color: #dc3545 !important;
          transition: 0.3s;
        }
        .rounded-4 { border-radius: 1rem !important; }
      `}</style>
    </div>
  );
};

export default ProductCart;