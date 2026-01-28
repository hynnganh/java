import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import Swal from 'sweetalert2'; // Dùng cái này cho đồng bộ với Admin

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
      // Đảm bảo dùng orderStatus từ Backend
      const sortedOrders = Array.isArray(ordersData)
        ? ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi load đơn hàng:", error);
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
      Swal.fire("Lỗi", "Không thể lấy chi tiết đơn hàng", "error");
      setShowDetail(false);
    }
  };

const handleCancelOrder = async (orderId) => {
  const { value: reason, isConfirmed } = await Swal.fire({
    title: 'Lý do hủy đơn?',
    input: 'text',
    inputPlaceholder: 'Nhập lý do tại đây (ví dụ: Đổi ý, đặt nhầm)...',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Xác nhận hủy',
    cancelButtonText: 'Quay lại',
    icon: 'question'
  });

  if (isConfirmed) {
    try {
      setCancelling(orderId);
      // Nếu khách không nhập gì, gửi lý do mặc định
      const finalReason = reason || 'Người dùng yêu cầu hủy qua giao diện';
      
      await orderService.cancelOrder(currentUser.email, orderId, finalReason);
      
      Swal.fire('Thành công', 'Đơn hàng đã được hủy', 'success');
      loadOrders(); // Tải lại danh sách để cập nhật UI
      setShowDetail(false); // Đóng modal chi tiết
    } catch (error) {
      console.error("Lỗi hủy đơn:", error);
      const msg = error.response?.status === 401 
                  ? "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!" 
                  : (error.response?.data?.message || "Lỗi hệ thống");
      Swal.fire('Thất bại', msg, 'error');
    } finally {
      setCancelling(null);
    }
  }
};

  // Tracking Component: Ràng buộc chặt chẽ với orderStatus
const OrderTracking = ({ status }) => {
  const stages = [
    { 
      key: 'PENDING', 
      label: 'Chờ xử lý', 
      icon: 'clock', 
      // Sáng khi ở trạng thái PENDING hoặc khi đã được Accepted/Shipped...
      activeFor: ['PENDING', 'Order Accepted !', 'SHIPPED', 'DELIVERED'] 
    },
    { 
      key: 'ACCEPTED', 
      label: 'Đã xác nhận', 
      icon: 'check', 
      activeFor: ['Order Accepted !', 'SHIPPED', 'DELIVERED'] 
    },
    { 
      key: 'SHIPPED', 
      label: 'Đang giao', 
      icon: 'truck', 
      activeFor: ['SHIPPED', 'DELIVERED'] 
    },
    { 
      key: 'DELIVERED', 
      label: 'Thành công', 
      icon: 'check-double', 
      activeFor: ['DELIVERED'] 
    },
  ];

  if (status === 'CANCELLED') return (
    <div className="alert alert-danger text-center rounded-4 border-0 py-3 mb-4">
      <i className="fas fa-times-circle me-2"></i> Đơn hàng này đã bị hủy
    </div>
  );

    return (
      <div className="order-tracking-container mb-5 mt-4">
        <div className="tracking-line"></div>
        <div className="d-flex justify-content-between">
          {stages.map((stage, index) => {
            const isActive = stage.activeFor.includes(status);
            return (
              <div key={index} className="text-center position-relative z-index-1" style={{ width: '33%' }}>
                <div className={`step-icon ${isActive ? 'active' : ''}`}>
                  <i className={`fas fa-${stage.icon}`}></i>
                </div>
                <div className={`small mt-2 fw-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4 pb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark"><i className="fas fa-box me-2 text-primary"></i>Đơn hàng của tôi</h2>
        <button className="btn btn-white border shadow-sm rounded-pill px-4 fw-bold" onClick={loadOrders}>
           Làm mới
        </button>
      </div>

      <div className="row g-3 mb-4">
        <StatCard title="Tổng đơn" value={orders.length} color="primary" icon="shopping-bag" />
        <StatCard title="Đang giao" value={orders.filter(o => o.orderStatus === 'SHIPPED').length} color="info" icon="truck" />
        <StatCard title="Hoàn tất" value={orders.filter(o => o.orderStatus === 'DELIVERED').length} color="success" icon="check-circle" />
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-grow text-primary"></div></div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 border-0">Mã đơn</th>
                  <th className="border-0">Tổng tiền</th>
                  <th className="border-0">Trạng thái</th>
                  <th className="text-end pe-4 border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  // Gọi format từ service bằng orderStatus
                  const s = orderService.formatOrderStatus(order.orderStatus);
                  return (
                    <tr key={order.orderId}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">#{order.orderId}</div>
                        <small className="text-muted">{order.orderDate}</small>
                      </td>
                      <td><span className="fw-bold text-dark">{formatPrice(order.totalAmount)}</span></td>
                      <td>
                        <span className={`badge rounded-pill bg-${s.class} bg-opacity-10 text-${s.class} border border-${s.class} px-3 py-2`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-dark rounded-pill px-4 shadow-sm" onClick={() => handleViewDetail(order)}>Chi tiết</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-5">
              <div className="modal-header border-0 p-4 pb-0">
                <h4 className="modal-title fw-bold">Đơn hàng #{selectedOrder?.orderId}</h4>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowDetail(false)}></button>
              </div>
              <div className="modal-body p-4">
                {selectedOrder ? (
                  <>
                    <OrderTracking status={selectedOrder.orderStatus} />

                    <div className="row g-3 mb-4">
                      <div className="col-md-7">
                        <div className="p-4 bg-light rounded-4 h-100 border-0">
                          <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Địa chỉ nhận hàng</label>
                          <p className="mb-1 fw-bold text-dark">{currentUser?.name || "Khách hàng"}</p>
                          <p className="mb-1 text-secondary small"><i className="fas fa-map-marker-alt me-2"></i>{selectedOrder.shippingAddress}</p>
                          <p className="mb-0 small text-muted"><i className="fas fa-phone me-2"></i>{selectedOrder.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="p-4 border rounded-4 h-100 bg-white">
                          <label className="text-muted small fw-bold text-uppercase mb-2 d-block">Thanh toán</label>
                          <p className="mb-2 small">Phương thức: <span className="badge bg-secondary">{selectedOrder.payment?.paymentMethod || 'COD'}</span></p>
                          <div className="h4 text-danger fw-bold mb-0">{formatPrice(selectedOrder.totalAmount)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-4 border overflow-hidden">
                      <table className="table mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="small ps-3">Sản phẩm</th>
                            <th className="text-center small">SL</th>
                            <th className="text-end small pe-3">Đơn giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.orderItems?.map((item, idx) => (
                            <tr key={idx}>
                              <td className="ps-3">
                                <div className="d-flex align-items-center gap-3">
                                  <img 
                                    src={`http://localhost:8080/api/public/products/image/${item.product.image}`} 
                                    width="45" height="45" className="rounded-3 object-fit-cover shadow-sm" alt=""
                                  />
                                  <div className="small fw-bold text-dark">{item.productName}</div>
                                </div>
                              </td>
                              <td className="text-center fw-bold">x{item.quantity}</td>
                              <td className="text-end pe-3 fw-bold text-secondary">{formatPrice(item.orderedProductPrice)}</td>
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
              {/* Modal Footer */}
<div className="modal-footer border-0 p-4 pt-0">
  <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowDetail(false)}>
    Đóng
  </button>
  
  {selectedOrder && (selectedOrder.orderStatus === 'PENDING' || selectedOrder.orderStatus === 'Order Accepted !') && (
    <button 
      className="btn btn-outline-danger rounded-pill px-4 fw-bold shadow-sm" 
      onClick={() => handleCancelOrder(selectedOrder.orderId)} 
      disabled={cancelling === selectedOrder.orderId}
    >
      {cancelling === selectedOrder.orderId ? (
        <><span className="spinner-border spinner-border-sm me-2"></span> Đang hủy...</>
      ) : (
        'Hủy đơn hàng'
      )}
    </button>
  )}
</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-tracking-container { position: relative; padding: 0 10%; }
        .tracking-line { position: absolute; top: 18px; left: 10%; right: 10%; height: 3px; background: #e9ecef; z-index: 0; }
        .step-icon { width: 40px; height: 40px; border-radius: 50%; background: #e9ecef; color: #adb5bd; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; z-index: 2; transition: all 0.4s; border: 4px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .step-icon.active { background: #0d6efd; color: white; transform: scale(1.1); box-shadow: 0 0 15px rgba(13, 110, 253, 0.4); }
        .z-index-1 { z-index: 1; }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm rounded-4 transition-all" style={{ cursor: 'default' }}>
      <div className="card-body d-flex align-items-center p-3">
        <div className={`bg-${color} bg-opacity-10 text-${color} rounded-4 p-3 me-3`}>
          <i className={`fas fa-${icon} fa-lg`}></i>
        </div>
        <div>
          <h4 className="fw-bold mb-0 text-dark">{value}</h4>
          <small className="text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>{title}</small>
        </div>
      </div>
    </div>
  </div>
);

export default OrderList;