// src/pages/order/OrderList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

const formatPrice = (price) => (Number(price) || 0).toLocaleString('vi-VN') + 'đ';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch { return null; }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      const ordersData = await orderService.getUserOrders(currentUser.email);
      const sortedOrders = Array.isArray(ordersData)
        ? ordersData.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) navigate('/login');
    else loadOrders();
  }, [currentUser, navigate, loadOrders]);

  const handleViewDetail = async (order) => {
    setShowDetail(true);
    setSelectedOrder(null);
    try {
      const orderDetail = await orderService.getOrderDetail(currentUser.email, order.orderId);
      setSelectedOrder(orderDetail);
    } catch (error) {
      alert('❌ Không thể lấy chi tiết đơn hàng');
      setShowDetail(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      setCancelling(orderId);
      await orderService.cancelOrder(currentUser.email, orderId, 'Người dùng yêu cầu hủy');
      alert('✅ Đã hủy đơn hàng thành công');
      loadOrders();
      if (selectedOrder?.orderId === orderId) setShowDetail(false);
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setCancelling(null);
    }
  };

  // Tracking Component
  const OrderTracking = ({ status }) => {
    const stages = [
      { key: 'PENDING', label: 'Chờ xử lý', icon: 'clock', list: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] },
      { key: 'CONFIRMED', label: 'Đã xác nhận', icon: 'box', list: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] },
      { key: 'SHIPPED', label: 'Đang giao', icon: 'truck', list: ['SHIPPED', 'DELIVERED'] },
      { key: 'DELIVERED', label: 'Thành công', icon: 'check-double', list: ['DELIVERED'] },
    ];

    if (status === 'CANCELLED') return (
      <div className="alert alert-secondary text-center rounded-4 border-0 py-3 mb-4">
        <i className="fas fa-times-circle me-2"></i> Đơn hàng này đã bị hủy
      </div>
    );

    return (
      <div className="order-tracking-container mb-5 mt-4">
        <div className="tracking-line"></div>
        <div className="d-flex justify-content-between">
          {stages.map((stage, index) => (
            <div key={index} className="text-center position-relative z-index-1">
              <div className={`step-icon ${stage.list.includes(status) ? 'active' : ''}`}>
                <i className={`fas fa-${stage.icon}`}></i>
              </div>
              <div className={`small mt-2 fw-bold ${stage.list.includes(status) ? 'text-primary' : 'text-muted'}`}>
                {stage.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><i className="fas fa-box me-2 text-primary"></i>Đơn hàng của tôi</h2>
        <button className="btn btn-light border shadow-sm rounded-pill px-4" onClick={loadOrders}>
           Làm mới
        </button>
      </div>

      <div className="row g-3 mb-4">
        <StatCard title="Tổng đơn" value={orders.length} color="primary" icon="shopping-bag" />
        <StatCard title="Đang giao" value={orders.filter(o => o.status === 'SHIPPED').length} color="info" icon="truck" />
        <StatCard title="Hoàn tất" value={orders.filter(o => o.status === 'DELIVERED').length} color="success" icon="check-circle" />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-grow text-primary"></div></div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="ps-4">Mã đơn</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const s = orderService.formatOrderStatus(order.status);
                return (
                  <tr key={order.orderId}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">#{order.orderId}</div>
                      <small className="text-muted">{orderService.formatDate(order.orderDate)}</small>
                    </td>
                    <td><span className="fw-bold text-danger">{formatPrice(orderService.calculateOrderTotal(order))}</span></td>
                    <td><span className={`badge rounded-pill bg-${s.class} bg-opacity-10 text-${s.class} border border-${s.class}`}>{s.text}</span></td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => handleViewDetail(order)}>Xem chi tiết</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Chi tiết đơn hàng #{selectedOrder?.orderId}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetail(false)}></button>
              </div>
              <div className="modal-body p-4">
                {selectedOrder ? (
                  <>
                    {/* TRACKING SECTION */}
                    <OrderTracking status={selectedOrder.status} />

                    <div className="row g-3 mb-4">
                      <div className="col-md-7">
                        <div className="p-3 bg-light rounded-4 h-100">
                          <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Địa chỉ nhận hàng</label>
                          <p className="mb-1 fw-bold">{currentUser?.name}</p>
                          <p className="mb-1 text-muted small">{selectedOrder.shippingAddress}</p>
                          <p className="mb-0 small text-muted">SĐT: {selectedOrder.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="p-3 border rounded-4 h-100">
                          <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Thanh toán</label>
                          <p className="mb-1 small">Phương thức: <strong>{orderService.formatPaymentMethod(selectedOrder.paymentMethod)}</strong></p>
                          <p className="mb-0 text-danger fw-bold fs-5">{formatPrice(orderService.calculateOrderTotal(selectedOrder))}</p>
                        </div>
                      </div>
                    </div>

                    <div className="table-responsive rounded-4 border">
                      <table className="table mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="small">Sản phẩm</th>
                            <th className="text-center small">SL</th>
                            <th className="text-end small">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedOrder.orderItems || []).map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <img src={item.product?.image ? `http://localhost:8080/api/public/products/image/${item.product.image}` : 'https://placehold.co/40'} width="40" height="40" className="rounded shadow-sm" alt=""/>
                                  <div className="small fw-bold">{item.product?.productName}</div>
                                </div>
                              </td>
                              <td className="text-center fw-bold text-primary">x{item.quantity}</td>
                              <td className="text-end small">{formatPrice(item.quantity * (item.orderedPrice || item.product?.price))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setShowDetail(false)}>Đóng</button>
                {selectedOrder && orderService.canCancelOrder(selectedOrder) && (
                  <button className="btn btn-danger rounded-pill px-4" onClick={() => handleCancelOrder(selectedOrder.orderId)} disabled={cancelling === selectedOrder.orderId}>
                    {cancelling === selectedOrder.orderId ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-tracking-container { position: relative; padding: 0 20px; }
        .tracking-line { position: absolute; top: 18px; left: 10%; right: 10%; height: 2px; background: #dee2e6; z-index: 0; }
        .step-icon { width: 36px; height: 36px; border-radius: 50%; background: #e9ecef; color: #adb5bd; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; z-index: 2; transition: all 0.3s; border: 4px solid #fff; }
        .step-icon.active { background: #0d6efd; color: white; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.2); }
        .z-index-1 { z-index: 1; }
        .bg-opacity-10 { --bs-bg-opacity: 0.1; }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body d-flex align-items-center p-3">
        <div className={`bg-${color} bg-opacity-10 text-${color} rounded-4 p-3 me-3`}>
          <i className={`fas fa-${icon} fa-lg`}></i>
        </div>
        <div>
          <h4 className="fw-bold mb-0">{value}</h4>
          <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>{title}</small>
        </div>
      </div>
    </div>
  </div>
);

export default OrderList;