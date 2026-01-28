import React, { useState, useEffect, useCallback } from "react";
import categoryService from "../../../services/categoryService";
import api from "../../../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const CategoryListAD = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ categoryId: "", categoryName: "" });
  const navigate = useNavigate();

  // Phân trang giống ProductList
  const [pageConfig, setPageConfig] = useState({ 
    pageNumber: 0, 
    pageSize: 10, 
    totalPages: 0,
    totalElements: 0
  });

  // ================= FETCH DATA (Giống Product) =================
  const fetchCategories = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      // Gọi qua service, truyền page và size
      const res = await categoryService.getAllCategories(page, pageConfig.pageSize);
      
      console.log("📥 [DATA] Category Response:", res);

      // Bóc tách content (Giống hệt logic product: res.content)
      setCategories(res.content || res || []);
      setPageConfig(prev => ({ 
        ...prev,
        pageNumber: res.pageNumber || 0, 
        totalPages: res.totalPages || 0,
        totalElements: res.totalElements || 0
      }));
    } catch (err) {
      console.error("❌ Lỗi Fetch Category:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [pageConfig.pageSize]);

  // ================= CHỈ CHECK TOKEN (Giống Product) =================
  useEffect(() => { 
    // Lấy đúng cái token mà thằng Product đang dùng
    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");

    if (token) {
        console.log("✅ Đã thấy Token, tiến hành load dữ liệu...");
        fetchCategories(0); 
    } else {
        console.error("🚨 Không thấy token, về login!");
        navigate("/login");
    }
  }, [fetchCategories, navigate]);

  // ================= SUBMIT (Dùng logic Token của Product) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.categoryName.trim().length < 5) return Swal.fire("Lỗi", "Tên ít nhất 5 ký tự", "error");

    const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (isEdit) {
        await api.put(`/admin/categories/${formData.categoryId}`, { categoryName: formData.categoryName }, config);
      } else {
        await api.post(`/admin/categories`, { categoryName: formData.categoryName }, config);
      }

      Swal.fire("Thành công!", "Dữ liệu đã được cập nhật.", "success");
      setShowModal(false);
      fetchCategories(pageConfig.pageNumber); 
    } catch (err) {
      Swal.fire("Lỗi", err.response?.data?.message || "Thao tác thất bại", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({ title: "Xóa danh mục?", icon: "warning", showCancelButton: true });
    if (confirm.isConfirmed) {
      const token = localStorage.getItem("admin-token") || localStorage.getItem("token");
      try {
        await api.delete(`/admin/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire("Đã xóa!", "", "success");
        fetchCategories(0);
      } catch (err) { Swal.fire("Lỗi", "Không thể xóa.", "error"); }
    }
  };

  return (
    <div className="p-1">
      <div className="card shadow-sm border-0 text-start">
        <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="m-0 fw-bold text-dark">QUẢN LÝ DANH MỤC</h5>
          <button className="btn btn-primary btn-sm px-3" onClick={() => { setIsEdit(false); setFormData({categoryId:"", categoryName:""}); setShowModal(true); }}>+ Thêm mới</button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.categoryId}>
                  <td>{c.categoryId}</td>
                  <td className="fw-semibold">{c.categoryName}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => { setIsEdit(true); setFormData(c); setShowModal(true); }}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.categoryId)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h6 className="fw-bold m-0">{isEdit ? "CẬP NHẬT" : "THÊM MỚI"}</h6>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body py-3">
                  <label className="form-label small fw-bold">Tên danh mục</label>
                  <input type="text" className="form-control" required value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})}/>
                </div>
                <div className="modal-footer">
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

export default CategoryListAD;