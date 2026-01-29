import React, { useState, useEffect, useCallback } from "react";
import productService from "../../../services/productService";
import api from "../../../services/api";
import Swal from "sweetalert2";

const ProductListAD = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
    price: "",
    discount: 0,
    quantity: 1,
    description: "",
    categoryId: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Quản lý phân trang
  const [pageConfig, setPageConfig] = useState({ 
    pageNumber: 0, 
    pageSize: 10, // Mày có thể đổi số này thành 50 nếu muốn hiện nhiều
    totalPages: 0,
    totalElements: 0
  });

  // ================= FETCH DATA =================
  const fetchData = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      // Gọi API với pageNumber và pageSize hiện tại
      const prodRes = await productService.getAllProductsAD(page, pageConfig.pageSize);
      const catRes = await api.get("/public/categories");

      setProducts(prodRes.content || []);
      setPageConfig(prev => ({ 
        ...prev,
        pageNumber: prodRes.pageNumber || 0, 
        totalPages: prodRes.totalPages || 0,
        totalElements: prodRes.totalElements || 0
      }));
      
      setCategories(catRes.data.content || catRes.data || []);
    } catch (err) {
      console.error("❌ Lỗi Fetch Data:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [pageConfig.pageSize]);

  useEffect(() => { 
    fetchData(0); 
  }, [fetchData]);

  // ================= LOGIC MODAL =================
  const handleOpenModal = (product = null) => {
    if (product) {
      setIsEdit(true);
      setFormData({
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        discount: product.discount,
        quantity: product.quantity,
        description: product.description,
        categoryId: product.category?.categoryId || "" 
      });
      setImagePreview(product.image ? `https://java-lbdz.onrender.com/api/public/products/image/${product.image}` : null);
    } else {
      setIsEdit(false);
      setFormData({ productId: "", productName: "", price: "", discount: 0, quantity: 1, description: "", categoryId: "" });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ================= SUBMIT (FIXED) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.productName.length < 3) return Swal.fire("Lỗi", "Tên ít nhất 3 ký tự", "error");
    
    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const productPayload = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        discount: parseFloat(formData.discount) || 0,
        specialPrice: 0 ,
        category: {
          categoryId: formData.categoryId 
        }
      };

      let savedProduct;
      if (isEdit) {
        const res = await api.put(`/admin/products/${formData.productId}`, productPayload, config);
        savedProduct = res.data;
      } else {
        const res = await api.post(`/admin/categories/${formData.categoryId}/products`, productPayload, config);
        savedProduct = res.data;
      }

      if (selectedFile) {
        const pId = savedProduct?.productId || formData.productId;
        const imageForm = new FormData();
        imageForm.append("image", selectedFile);
        await api.put(`/admin/products/${pId}/image`, imageForm, {
          headers: { ...config.headers, "Content-Type": "multipart/form-data" }
        });
      }

      Swal.fire("Thành công!", "Dữ liệu đã được cập nhật.", "success");
      setShowModal(false);
      fetchData(pageConfig.pageNumber); 
    } catch (err) {
      Swal.fire("Lỗi", err.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Xóa sản phẩm?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa ngay"
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/products/${id}`);
        Swal.fire("Đã xóa!", "", "success");
        fetchData(pageConfig.pageNumber);
      } catch (err) {
        Swal.fire("Lỗi", "Không thể xóa.", "error");
      }
    }
  };

  return (
    <div className="p-1">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="m-0 fw-bold text-dark"><i className="bi bi-box-seam me-2"></i>QUẢN LÝ SẢN PHẨM</h5>
          <button className="btn btn-primary btn-sm px-3" onClick={() => handleOpenModal()}>+ Thêm mới</button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá bán</th>
                <th>Kho</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.productId}>
                  <td>{p.productId}</td>
                  <td>
                    <img src={p.image ? `https://java-lbdz.onrender.com/api/public/products/image/${p.image}` : "https://via.placeholder.com/50"} 
                         style={{width: "40px", height: "40px", objectFit: "cover", borderRadius: "6px"}} alt="p" />
                  </td>
                  <td className="fw-semibold">{p.productName}</td>
                  <td className="text-danger fw-bold">{p.specialPrice?.toLocaleString()}₫</td>
                  <td><span className={`badge ${p.quantity > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>{p.quantity} cái</span></td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleOpenModal(p)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.productId)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION CONTROLS ================= */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <p className="text-muted small mb-0">Hiển thị {products.length} / {pageConfig.totalElements} sản phẩm</p>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pageConfig.pageNumber === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => fetchData(pageConfig.pageNumber - 1)}>Trước</button>
              </li>
              {[...Array(pageConfig.totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${pageConfig.pageNumber === i ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => fetchData(i)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${pageConfig.pageNumber >= pageConfig.totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => fetchData(pageConfig.pageNumber + 1)}>Sau</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal - Giữ nguyên như cũ */}
      {showModal && (
        <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="fw-bold">{isEdit ? "Chỉnh sửa" : "Thêm mới"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body row g-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Tên sản phẩm</label>
                    <input type="text" className="form-control form-control-sm" required value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})}/>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Danh mục</label>
                    <select className="form-select form-select-sm" required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      <option value="">Chọn...</option>
                      {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4"><label className="form-label small">Giá</label><input type="number" className="form-control form-control-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}/></div>
                  <div className="col-md-4"><label className="form-label small">Giảm (%)</label><input type="number" className="form-control form-control-sm" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})}/></div>
                  <div className="col-md-4"><label className="form-label small">Kho</label><input type="number" className="form-control form-control-sm" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}/></div>
                  <div className="col-12"><label className="form-label small">Mô tả</label><textarea className="form-control form-control-sm" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
                  <div className="col-12">
                    <label className="form-label small">Ảnh</label>
                    <input type="file" className="form-control form-control-sm" onChange={handleFileChange}/>
                    {imagePreview && <img src={imagePreview} className="mt-2 rounded" style={{width: "60px"}} />}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light btn-sm" onClick={() => setShowModal(false)}>Đóng</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4">Lưu lại</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListAD;