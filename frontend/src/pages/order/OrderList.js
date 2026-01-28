import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import Swal from 'sweetalert2';

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
        ? ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        : [];
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
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
      inputPlaceholder: 'Nhập lý do tại đây...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Xác nhận hủy',
      cancelButtonText: 'Quay lại',
    });

    if (isConfirmed) {
      try {
        setCancelling(orderId);
        const finalReason = reason || 'Người dùng yêu cầu hủy qua giao diện';
        await orderService.cancelOrder(currentUser.email, orderId, finalReason);
        Swal.fire('Thành công', 'Đơn hàng đã được hủy', 'success');
        loadOrders();
        setShowDetail(false);
      } catch (error) {
        Swal.fire('Thất bại', error.response?.data?.message || "Lỗi hệ thống", 'error');
      } finally {
        setCancelling(null);
      }
    }
  };

  const OrderTracking = ({ status }) => {
    const stages = [
      { key: 'PENDING', label: 'Chờ xử lý', icon: 'clock', activeFor: ['PENDING', 'Order Accepted !', 'SHIPPED', 'DELIVERED'] },
      { key: 'ACCEPTED', label: 'Đã xác nhận', icon: 'check', activeFor: ['Order Accepted !', 'SHIPPED', 'DELIVERED'] },
      { key: 'SHIPPED', label: 'Đang giao', icon: 'truck', activeFor: ['SHIPPED', 'DELIVERED'] },
      { key: 'DELIVERED', label: 'Thành công', icon: 'check-double', activeFor: ['DELIVERED'] },
    ];

    if (status === 'CANCELLED') return (
      <div className="alert alert-danger text-center rounded-4 border-0 py-3 mb-4 small fw-bold shadow-sm">
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
              <div key={index} className="text-center position-relative z-index-1" style={{ width: '25%' }}>
                <div className={`step-icon ${isActive ? 'active' : ''}`}>
                  <i className={`fas fa-${stage.icon}`}></i>
                </div>
                <div className={`x-small mt-2 fw-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
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
        <h2 className="fw-bold text-dark mb-0"><i className="fas fa-box-open me-2 text-primary"></i>Đơn hàng của tôi</h2>
        <button className="btn btn-white border shadow-sm rounded-pill px-4 fw-bold transition-all" onClick={loadOrders}>
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
              <thead className="bg-light text-muted small text-uppercase fw-bold">
                <tr>
                  <th className="ps-4 py-3">Mã đơn</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const s = orderService.formatOrderStatus(order.orderStatus);
                  return (
                    <tr key={order.orderId}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">#{order.orderId}</div>
                        <div className="x-small text-muted">{order.orderDate}</div>
                      </td>
                      <td><span className="fw-bold text-dark">{formatPrice(order.totalAmount)}</span></td>
                      <td>
                        <span className={`badge rounded-pill bg-${s.class} bg-opacity-10 text-${s.class} border border-${s.class} px-3 py-2 x-small`}>
                          {s.text}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-2">
                          {order.orderStatus === 'DELIVERED' && (
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleViewDetail(order)}>
                              Đánh giá
                            </button>
                          )}
                          <button className="btn btn-sm btn-dark rounded-pill px-3 fw-bold shadow-sm" onClick={() => handleViewDetail(order)}>
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết */}
      {showDetail && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
              <div className="modal-header border-0 p-4">
                <h4 className="modal-title fw-bold text-dark">Đơn hàng #{selectedOrder?.orderId}</h4>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowDetail(false)}></button>
              </div>
              <div className="modal-body p-4 pt-0">
                {selectedOrder ? (
                  <>
                    <OrderTracking status={selectedOrder.orderStatus} />

                    <div className="row g-3 mb-4">
                      <div className="col-md-7">
                        <div className="p-3 bg-light rounded-4 h-100">
                          <label className="text-muted x-small fw-bold text-uppercase mb-2 d-block">Thông tin nhận hàng</label>
                          <p className="mb-1 fw-bold text-dark">{currentUser?.name || "Khách hàng"}</p>
                          <p className="mb-0 x-small text-secondary"><i className="fas fa-map-marker-alt me-1"></i> {selectedOrder.shippingAddress}</p>
                        </div>
                      </div>
                      <div className="col-md-5">
                        <div className="p-3 border rounded-4 h-100 bg-white shadow-sm">
                          <label className="text-muted x-small fw-bold text-uppercase mb-2 d-block">Thanh toán</label>
                          <div className="h4 text-danger fw-bold mb-1">{formatPrice(selectedOrder.totalAmount)}</div>
                          <span className="badge bg-secondary x-small px-2 py-1">{selectedOrder.payment?.paymentMethod || 'COD'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-4 border overflow-hidden bg-white shadow-sm">
                      <table className="table mb-0">
                        <thead className="table-light small fw-bold">
                          <tr>
                            <th className="ps-3">Sản phẩm</th>
                            <th className="text-center">Số lượng</th>
                            <th className="text-end pe-3">Giá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.orderItems?.map((item, idx) => (
                            <tr key={idx} className="align-middle">
                              <td className="ps-3 py-3">
                                <div className="d-flex align-items-center gap-3">
                                  <img 
                                    src={`http://localhost:8080/api/public/products/image/${item.product.image}`} 
                                    width="50" height="50" className="rounded-3 object-fit-cover shadow-sm border" alt=""
                                  />
                                  <div>
                                    <div className="small fw-bold text-dark">{item.productName}</div>
                                    {selectedOrder.orderStatus === 'DELIVERED' && (
                                      <Link to={`/product/${item.product.productId}`} className="text-primary text-decoration-none x-small fw-bold mt-1 d-block">
                                        <i className="fas fa-edit me-1"></i> Viết đánh giá ngay
                                      </Link>
                                    )}
                                  </div>
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
              <div className="modal-footer border-0 p-4 pt-0">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowDetail(false)}>Đóng</button>
                {selectedOrder && (selectedOrder.orderStatus === 'PENDING' || selectedOrder.orderStatus === 'Order Accepted !') && (
                  <button className="btn btn-outline-danger rounded-pill px-4 fw-bold" onClick={() => handleCancelOrder(selectedOrder.orderId)} disabled={cancelling === selectedOrder.orderId}>
                    {cancelling === selectedOrder.orderId ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .order-tracking-container { position: relative; padding: 0 5%; }
        .tracking-line { position: absolute; top: 18px; left: 10%; right: 10%; height: 2px; background: #e9ecef; z-index: 0; }
        .step-icon { width: 36px; height: 36px; border-radius: 50%; background: #e9ecef; color: #adb5bd; display: flex; align-items: center; justify-content: center; margin: 0 auto; position: relative; z-index: 2; transition: all 0.3s ease; border: 3px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .step-icon.active { background: #0d6efd; color: white; transform: scale(1.15); box-shadow: 0 0 12px rgba(13,110,253,0.3); }
        .x-small { font-size: 0.75rem; }
        .transition-all:hover { transform: translateY(-2px); opacity: 0.85; }
        .z-index-1 { z-index: 1; }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm rounded-4 transition-all">
      <div className="card-body d-flex align-items-center p-3">
        <div className={`bg-${color} bg-opacity-10 text-${color} rounded-circle p-3 me-3 d-flex align-items-center justify-content-center`} style={{width: '50px', height: '50px'}}>
          <i className={`fas fa-${icon}`}></i>
        </div>
        <div>
          <h5 className="fw-bold mb-0 text-dark">{value}</h5>
          <div className="text-muted text-uppercase fw-bold x-small" style={{letterSpacing: '0.5px'}}>{title}</div>
        </div>
      </div>
    </div>
  </div>
);

export default OrderList;