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
      Swal.fire({
        title: 'Hết hàng',
        text: `Sản phẩm này chỉ còn ${stock} món`,
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false
      });
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

  // ✅ FIX ĐÚNG specialPrice
  const calculateCartTotal = () => {
    return cart?.products?.reduce((total, item) => {
      const unitPrice =
        item.specialPrice ?? item.productPrice ?? item.price ?? 0;
      return total + unitPrice * (parseInt(item.quantity) || 0);
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
        <Link to="/product" className="btn btn-warning mt-3 fw-bold">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4 text-primary">GIỎ HÀNG CỦA BẠN</h2>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            {cart.products.map(item => {
              const unitPrice =
                item.specialPrice ?? item.productPrice ?? item.price;

              return (
                <div key={item.productId} className="row align-items-center p-3 border-bottom m-0">
                  <div className="col-3 col-md-2">
                    <img
                      src={`http://localhost:8080/api/public/products/image/${item.image}`}
                      className="img-fluid rounded"
                      alt={item.productName}
                    />
                  </div>

                  <div className="col-9 col-md-4">
                    <h6 className="fw-bold">{item.productName}</h6>
                    <p className="text-muted small">
                      Đơn giá:
                      <span className="text-danger ms-1">
                        {unitPrice.toLocaleString()}₫
                      </span>
                    </p>
                  </div>

                  <div className="col-6 col-md-3 d-flex justify-content-center">
                    <input
                      type="text"
                      className="quantity-input"
                      value={item.quantity}
                      onChange={e => handleInputChange(item, e.target.value)}
                      onBlur={e =>
                        syncQuantity(item.productId, parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="col-6 col-md-3 text-end">
                    <p className="fw-bold">
                      {(unitPrice * item.quantity).toLocaleString()}₫
                    </p>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-lg-4 mt-4">
          <div className="card p-4 shadow-sm">
            <h5 className="fw-bold">Hóa đơn</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Tổng:</span>
              <span className="fw-bold text-danger">
                {calculateCartTotal().toLocaleString()}₫
              </span>
            </div>

            <button
              className="btn btn-warning w-100 mt-3 fw-bold"
              onClick={() => navigate('/checkout')}
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
