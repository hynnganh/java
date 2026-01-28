import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import cartService from "../../services/cartService";
import ProductCard from "../product/ProductCard"; // Nhập component đã tạo
import ProductReview from "./ProductReview";
import Swal from 'sweetalert2';

const IMAGE_BASE_URL = "http://localhost:8080/api/public/products/image";

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Lấy chi tiết sản phẩm
        const productData = await productService.getProductById(productId);
        setProduct(productData);
        const categoryId =
          productData.categoryId ||
          productData.category?.categoryId ||
          productData.category_id ||
          productData.categories?.[0]?.categoryId;

        if (!categoryId) {
          console.error("❌ Không lấy được categoryId", productData);
          setRelatedProducts([]);
        } else {
          // 3️⃣ LẤY SẢN PHẨM CÙNG DANH MỤC
          const related = await productService.getProductsByCategory(
            categoryId,
            0,
            8
          );

          const filtered = (related?.content || []).filter(
            (p) => (p.productId ?? p.id) !== Number(productId)
          );

          setRelatedProducts(filtered);
        }

        // 3. Gợi ý sản phẩm
        const suggested = await productService.getAllProducts(0, 4);
        setSuggestedProducts(suggested.content);

      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  const handleAddToCart = async () => {
    if (!currentUser) {
      Swal.fire({ 
        title: 'Yêu cầu đăng nhập', 
        text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
        icon: 'warning', 
        showCancelButton: true, 
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Để sau'
      }).then((result) => result.isConfirmed && navigate('/login'));
      return;
    }

    try {
      setAddingToCart(true);
      let cart = await cartService.getActiveCart(currentUser.email);
      await cartService.addToCart(cart.cartId, productId, 1);
      Swal.fire({ icon: 'success', title: 'Đã thêm vào giỏ!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error.message });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}>
      <div className="spinner-grow text-primary" role="status"></div>
    </div>
  );

  if (!product) return <div className="container mt-5 text-center"><h5>Không tìm thấy sản phẩm!</h5></div>;

  const currentPrice = product.specialPrice || product.price;

  return (
    <div className="container mt-4 mb-5 animate__animated animate__fadeIn">
      {/* Breadcrumb mượt mà */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb bg-light p-3 rounded-pill shadow-sm">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/product" className="text-decoration-none">Sản phẩm</Link></li>
          <li className="breadcrumb-item active text-truncate" style={{maxWidth: '200px'}}>{product.productName}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Ảnh sản phẩm với Hiệu ứng soi ảnh (Zoom) */}
        <div className="col-lg-6">
          <div className="bg-white p-4 rounded-4 shadow-sm border text-center overflow-hidden">
            <img 
              src={`${IMAGE_BASE_URL}/${product.image}`} 
              alt={product.productName} 
              className="img-fluid product-zoom" 
              style={{ maxHeight: '500px', objectFit: 'contain' }} 
            />
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="col-lg-6">
          <div className="ps-lg-4">
            <span className="badge bg-soft-primary text-primary mb-2">Chính hãng</span>
            <h1 className="fw-bold mb-3">{product.productName}</h1>
            
            <div className="d-flex align-items-center mb-3">
              <div className="text-warning me-2">
                {[...Array(5)].map((_, i) => <i key={i} className={`bi bi-star${i < 4 ? '-fill' : '-half'}`}></i>)}
              </div>
              <span className="text-muted small border-start ps-2">128 đánh giá | 542 đã bán</span>
            </div>

            <div className="p-3 bg-light rounded-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <span className="display-6 fw-bold text-danger">{currentPrice?.toLocaleString()} ₫</span>
                {product.specialPrice && <del className="text-muted h5 mb-0">{product.price?.toLocaleString()} ₫</del>}
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold">Mô tả sản phẩm:</h6>
              <p className="text-muted" style={{lineHeight: '1.6'}}>
                {product.description || "Sản phẩm mỹ phẩm cao cấp giúp cải thiện làn da, mang lại vẻ đẹp tự nhiên và rạng rỡ. Thành phần an toàn, lành tính cho mọi loại da."}
              </p>
            </div>

            <div className="d-flex gap-3 mb-5">
              <button 
                className="btn btn-primary btn-lg flex-grow-1 rounded-pill shadow"
                onClick={handleAddToCart}
                disabled={product.quantity === 0 || addingToCart}
              >
                {addingToCart ? 'Đang thêm...' : <><i className="bi bi-cart-plus me-2"></i>Thêm vào giỏ hàng</>}
              </button>
              <button className="btn btn-outline-danger btn-lg rounded-circle shadow-sm">
                <i className="bi bi-heart"></i>
              </button>
            </div>

            {/* Thông tin cam kết */}
            <div className="row g-3 border-top pt-4">
              <div className="col-4 text-center">
                <i className="bi bi-truck h3 text-primary"></i>
                <p className="small mb-0">Giao nhanh 2h</p>
              </div>
              <div className="col-4 text-center border-start">
                <i className="bi bi-shield-check h3 text-primary"></i>
                <p className="small mb-0">Bảo hành 12th</p>
              </div>
              <div className="col-4 text-center border-start">
                <i className="bi bi-arrow-repeat h3 text-primary"></i>
                <p className="small mb-0">Đổi trả 7 ngày</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductReview productId={productId} currentUser={currentUser} />

      {/* SẢN PHẨM LIÊN QUAN */}
      <div className="pt-2">
        <h4 className="fw-bold mb-4 border-start border-4 border-primary ps-3 text-uppercase">Sản phẩm cùng loại</h4>
        <div className="row">
          {relatedProducts.length > 0 ? (
            relatedProducts.map(item => <ProductCard key={item.productId || item.id} product={item} />)
          ) : (
            <p className="text-muted ps-3">Không có sản phẩm tương tự.</p>
          )}
        </div>
      </div>

      <style>{`
        .bg-soft-primary { background-color: #e7f1ff; }
        .product-zoom { transition: transform 0.5s ease; cursor: zoom-in; }
        .product-zoom:hover { transform: scale(1.1); }
        .breadcrumb-item + .breadcrumb-item::before { content: "›"; font-size: 1.2rem; line-height: 1; }
      `}</style>
    </div>
  );
};

export default ProductDetail;