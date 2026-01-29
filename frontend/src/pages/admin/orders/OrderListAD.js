import React, { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import { Eye, Package, User, ShoppingBag, CreditCard, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Mày nhớ cài: npm install jwt-decode

const OrderListAD = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pageConfig, setPageConfig] = useState({ pageNumber: 0, totalPages: 0, totalElements: 0 });
    const navigate = useNavigate();

    // ================= 1. KIỂM TRA QUYỀN ROLE (GIỐNG CATE) =================
 const checkAdminPrivileges = useCallback(() => {
    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    
    if (!token) {
        console.error("🚨 [AUTH] Không tìm thấy Token!");
        return false;
    }

    try {
        const decoded = jwtDecode(token);
        console.log("🔑 [AUTH] Payload Token thực tế:", decoded);

        // FIX Ở ĐÂY: Token của mày dùng key "role" (số ít)
        const userRole = decoded.role || ""; 
        
        // Kiểm tra xem chuỗi role có phải là ADMIN không
        const isAdmin = userRole === "ADMIN";

        if (!isAdmin) {
            console.warn("🚫 [AUTH] Quyền bị từ chối. Role trong token là:", userRole);
            return false;
        }

        console.log("✅ [AUTH] Welcome ADMIN!");
        return token;
    } catch (error) {
        console.error("❌ [AUTH] Token không hợp lệ:", error);
        return false;
    }
}, []);

    // ================= 2. FETCH DATA (CÓ LOG CHI TIẾT) =================
    const fetchOrders = useCallback(async (page = 0) => {
        const token = checkAdminPrivileges();
        
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            console.log(`📡 [API] Đang gọi danh sách đơn hàng trang: ${page}...`);
            
            const res = await api.get(`/admin/orders?pageNumber=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("📥 [API] Dữ liệu nhận về:", res.data);
            
            setOrders(res.data.content || []);
            setPageConfig({ 
                pageNumber: res.data.pageNumber, 
                totalPages: res.data.totalPages, 
                totalElements: res.data.totalElements 
            });
        } catch (err) {
            console.error("❌ [API] Lỗi lấy danh sách:", err.response || err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                Swal.fire("Từ chối", "Phiên làm việc hết hạn hoặc không đủ quyền!", "error");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [checkAdminPrivileges, navigate]);

    useEffect(() => { 
        fetchOrders(0); 
    }, [fetchOrders]);

    // ================= 3. XỬ LÝ CẬP NHẬT (XÁC NHẬN ROLE) =================
  const updateStatus = async (orderId, newStatus) => {
    // 1. Lấy token mới nhất (ưu tiên admin-token)
    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    
    if (!token) {
        console.error("🚨 [AUTH] Không tìm thấy token trong Storage");
        navigate("/admin/login");
        return;
    }

    const result = await Swal.fire({
        title: 'Xác nhận?',
        text: `Đổi trạng thái đơn #${orderId} thành ${newStatus}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#000',
        confirmButtonText: 'Đồng ý'
    });

    if (result.isConfirmed) {
        try {
            // Log ra để check trước khi gửi
            console.log(`📡 [API] Gửi PUT tới /admin/orders/${orderId}/status?orderStatus=${newStatus}`);
            
            // 2. Gọi API
            const res = await api.put(`/admin/orders/${orderId}/status`, null, {
                params: { orderStatus: newStatus }, // Dùng params của Axios sẽ an toàn hơn nối chuỗi
                headers: { 
                    Authorization: `Bearer ${token}` // Đảm bảo có dấu cách sau Bearer
                }
            });

            console.log("✅ [API] Cập nhật thành công:", res.data);
            Swal.fire("Thành công", "Đã cập nhật trạng thái đơn hàng!", "success");
            
            fetchOrders(pageConfig.pageNumber); // Load lại danh sách
            setShowModal(false);

        } catch (err) {
            console.error("❌ [API] Lỗi phản hồi:", err.response);
            
            if (err.response?.status === 401) {
                // TOKEN HẾT HẠN HOẶC SAI
                console.error("🚨 [401] Token bị Server từ chối!");
                localStorage.removeItem("token");
                localStorage.removeItem("admin-token");
                Swal.fire("Lỗi", "Phiên đăng nhập hết hạn!", "error").then(() => navigate("/login"));
            } else {
                Swal.fire("Lỗi", "Không thể cập nhật. Vui lòng kiểm tra quyền Admin.", "error");
            }
        }
    }
};

    const handleViewOrder = async (orderId) => {
        const token = checkAdminPrivileges();
        try {
            console.log(`📡 [API] Lấy chi tiết đơn hàng: ${orderId}`);
            const res = await api.get(`/admin/debug/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("📥 [API] Chi tiết đơn nhận về:", res.data);
            setSelectedOrder(res.data);
            setShowModal(true);
        } catch (err) {
            console.error("❌ [API] Lỗi chi tiết:", err);
            Swal.fire("Error", "Không thể lấy chi tiết!", "error");
        }
    };

    // ... (Giữ nguyên các component StatusPill, InfoBox, ActionBtn và JSX của mày)
    const StatusPill = ({ status }) => {
        const styles = {
            'PENDING': { bg: '#FFF7ED', color: '#C2410C', label: 'Chờ xử lý' },
            'SHIPPED': { bg: '#EFF6FF', color: '#1D4ED8', label: 'Đang giao' },
            'DELIVERED': { bg: '#F0FDF4', color: '#15803D', label: 'Đã giao' },
            'CANCELLED': { bg: '#FEF2F2', color: '#B91C1C', label: 'Đã hủy' }
        };
        const s = styles[status] || { bg: '#F9FAFB', color: '#374151', label: status };
        return (
            <span className="px-3 py-1 rounded-pill fw-semibold" style={{ backgroundColor: s.bg, color: s.color, fontSize: '12px' }}>
                {s.label}
            </span>
        );
    };

    return (
        <div className="p-5" style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* HEADER SECTION */}
            <div className="mb-5 d-flex justify-content-between align-items-center">
                <div>
                    <h1 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1.5px' }}>Quản lý Đơn hàng</h1>
                    <p className="text-secondary m-0">Hệ thống theo dõi và điều phối đơn hàng thời gian thực.</p>
                </div>
                <button className="btn btn-dark px-4 py-2 rounded-3 shadow-sm" onClick={() => fetchOrders(0)}>
                    Làm mới danh sách
                </button>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white shadow-sm border-0 rounded-4 overflow-hidden">
                <table className="table table-hover mb-0">
                    <thead style={{ backgroundColor: '#FAFAFA' }}>
                        <tr>
                            <th className="ps-4 py-4 border-0 text-secondary small fw-bold">ID ĐƠN</th>
                            <th className="border-0 text-secondary small fw-bold">THÔNG TIN KHÁCH HÀNG</th>
                            <th className="border-0 text-secondary small fw-bold">THỜI GIAN</th>
                            <th className="border-0 text-secondary small fw-bold">GIÁ TRỊ</th>
                            <th className="border-0 text-secondary small fw-bold">TRẠNG THÁI</th>
                            <th className="border-0 text-end pe-4">HÀNH ĐỘNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-5">Đang tải...</td></tr>
                        ) : orders.map(o => (
                            <tr key={o.orderId} className="align-middle transition-all border-bottom border-light" style={{ cursor: 'pointer' }}>
                                <td className="ps-4 py-4 fw-bold text-dark">#{o.orderId}</td>
                                <td>
                                    <div className="fw-semibold text-dark mb-0 small">{o.email}</div>
                                    <div className="text-muted" style={{ fontSize: '11px' }}>ID Khách: {o.userId || 'N/A'}</div>
                                </td>
                                <td className="text-secondary small">{o.orderDate}</td>
                                <td className="fw-bold text-dark">{o.totalAmount?.toLocaleString()}đ</td>
                                <td><StatusPill status={o.orderStatus}/></td>
                                <td className="text-end pe-4">
                                    <button className="btn btn-light rounded-3 p-2" onClick={() => handleViewOrder(o.orderId)}>
                                        <Eye size={18} className="text-dark"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL MINIMALIST (Giữ lại cái đẹp của mày) */}
            {showModal && selectedOrder && (
                <div className="modal d-block shadow-lg" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px' }}>
                        <div className="modal-content border-0 shadow-none" style={{ borderRadius: '32px', backgroundColor: '#FFF' }}>
                            <div className="modal-body p-5">
                                <div className="d-flex justify-content-between align-items-center mb-5">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="p-3 bg-dark text-white rounded-4 shadow">
                                            <Package size={24}/>
                                        </div>
                                        <div>
                                            <h2 className="fw-bold m-0" style={{ letterSpacing: '-1px' }}>Chi tiết đơn hàng</h2>
                                            <span className="text-muted small">Mã định danh: #{selectedOrder.orderId}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="btn-close shadow-none"></button>
                                </div>

                                <div className="row g-4 mb-5">
                                    <InfoBox icon={<User size={18}/>} label="Khách hàng" value={selectedOrder.email} />
                                    <InfoBox icon={<MapPin size={18}/>} label="Giao tới" value={selectedOrder.shippingAddress} />
                                    <InfoBox icon={<CreditCard size={18}/>} label="Phương thức" value={selectedOrder.paymentMethod || "COD"} />
                                </div>

                                <div className="mb-5">
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                        <ShoppingBag size={18}/> Sản phẩm đã đặt
                                    </h6>
                                    <div className="bg-light rounded-4 p-2">
                                        {selectedOrder.orderItems?.map((item, i) => (
                                            <div key={i} className="d-flex align-items-center justify-content-between p-3 bg-white mb-2 rounded-3 shadow-sm">
                                                <div className="d-flex align-items-center gap-3">
                                                    <img src={`https://java-lbdz.onrender.com/api/public/products/image/${item.image}`} alt="" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '10px'}} />
                                                    <div>
                                                        <div className="fw-bold small text-dark">{item.productName}</div>
                                                        <div className="text-muted small">Số lượng: {item.quantity}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-bold text-dark">{item.orderedProductPrice?.toLocaleString()}đ</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                    <div>
                                        <div className="text-muted small">Tổng thanh toán</div>
                                        <div className="h3 fw-bold text-dark">{selectedOrder.totalAmount?.toLocaleString()}đ</div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <ActionBtn color="#2563EB" label="Vận chuyển" onClick={() => updateStatus(selectedOrder.orderId, 'SHIPPED')} />
                                        <ActionBtn color="#16A34A" label="Hoàn tất" onClick={() => updateStatus(selectedOrder.orderId, 'DELIVERED')} />
                                        <ActionBtn color="#DC2626" label="Hủy đơn hàng" onClick={() => updateStatus(selectedOrder.orderId, 'CANCELLED')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .transition-all { transition: all 0.2s ease-in-out; }
                .table-hover tbody tr:hover { 
                    background-color: #F9FAFB !important; 
                    transform: translateX(5px);
                }
                .btn-dark:hover { background-color: #1F2937; }
                .rounded-4 { border-radius: 1rem !important; }
            `}</style>
        </div>
    );
};

const InfoBox = ({ icon, label, value }) => (
    <div className="col-md-4">
        <div className="p-3 bg-white border rounded-4 h-100 shadow-sm">
            <div className="text-muted small d-flex align-items-center gap-2 mb-2">
                {icon} {label}
            </div>
            <div className="fw-bold text-dark small" style={{ wordBreak: 'break-word' }}>{value}</div>
        </div>
    </div>
);

const ActionBtn = ({ color, label, onClick }) => (
    <button className="btn px-4 py-2 rounded-pill fw-bold border-0 shadow-sm transition-all" 
            style={{ backgroundColor: color, color: '#FFF', fontSize: '13px' }}
            onClick={onClick}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}>
        {label}
    </button>
);

export default OrderListAD;