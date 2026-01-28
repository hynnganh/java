import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"; // Thêm useParams
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductCard from "../product/ProductCard";

const ProductList = () => {
  const { categoryId: urlCategoryId } = useParams(); // Lấy ID từ URL /category/:categoryId
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categoryId: urlCategoryId || "", // Ưu tiên ID từ URL
    searchKeyword: "",
    priceRange: "all",
    sortBy: "price",
    sortOrder: "asc"
  });

  // 1. ĐỒNG BỘ URL VỚI FILTER
  useEffect(() => {
    if (urlCategoryId) {
      setFilters(prev => ({ ...prev, categoryId: urlCategoryId }));
    } else if (location.state?.selectedCategory) {
      // Dự phòng nếu mày vẫn dùng state
      setFilters(prev => ({ ...prev, categoryId: location.state.selectedCategory }));
    }
  }, [urlCategoryId, location.state]);

  // 2. LẮNG NGHE SEARCH TỪ HEADER (state)
  useEffect(() => {
    if (location.state?.searchKeyword) {
      setSearchTerm(location.state.searchKeyword);
      setFilters(prev => ({ ...prev, searchKeyword: location.state.searchKeyword }));
      // Xóa state để tránh loop hoặc dính search cũ khi chuyển trang khác
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 3. Debounce tìm kiếm
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchKeyword: searchTerm }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 4. Tải danh mục để hiện lên dropdown
  useEffect(() => {
    categoryService.getAllCategories().then(data => setCategories(data || []));
  }, []);

  // 5. HÀM TẢI SẢN PHẨM
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const PAGE_SIZE = 1000;
    try {
      let response;
      const { categoryId, searchKeyword, sortBy, sortOrder, priceRange } = filters;

      if (searchKeyword) {
        response = await productService.searchProducts(searchKeyword, 0, PAGE_SIZE, sortBy, sortOrder);
      } else if (categoryId) {
        // Gọi API theo danh mục
        response = await productService.getProductsByCategory(categoryId, 0, PAGE_SIZE, sortBy, sortOrder);
      } else {
        response = await productService.getAllProducts(0, PAGE_SIZE, sortBy, sortOrder);
      }

      // Backend Spring Boot thường trả về content (Pageable)
      let data = response?.content || response || [];

      // Lọc theo giá tại Client
      if (priceRange !== "all") {
        const [min, max] = priceRange.split("-").map(Number);
        data = data.filter(p => {
          const price = p.price;
          return max ? (price >= min && price <= max) : (price >= min);
        });
      }

      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 6. XỬ LÝ KHI THAY ĐỔI DROPDOWN DANH MỤC
  const handleCategoryChange = (id) => {
    setFilters(p => ({ ...p, categoryId: id }));
    if (id) {
      navigate(`/category/${id}`); // Cập nhật luôn URL cho nó chuyên nghiệp
    } else {
      navigate(`/product`);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      categoryId: "",
      searchKeyword: "",
      priceRange: "all",
      sortBy: "price",
      sortOrder: "asc"
    });
    navigate("/product");
  };

  return (
    <section className="container mt-5 pb-5">
      <div className="row g-2 mb-4 bg-light p-3 rounded-4 align-items-center shadow-sm">
        {/* Dropdown Danh mục */}
        <div className="col-md-2">
          <select 
            value={filters.categoryId} 
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="form-select rounded-pill border-0 shadow-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id || c.categoryId} value={c.id || c.categoryId}>
                {c.categoryName || c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc Giá */}
        <div className="col-md-2">
          <select 
            value={filters.priceRange} 
            onChange={(e) => setFilters(p => ({ ...p, priceRange: e.target.value }))}
            className="form-select rounded-pill border-0 shadow-sm"
          >
            <option value="all">Khoảng giá</option>
            <option value="0-100000">Dưới 100k</option>
            <option value="100000-500000">100k - 500k</option>
            <option value="500000-1000000">500k - 1tr</option>
            <option value="1000000">Trên 1tr</option>
          </select>
        </div>
        
        {/* Tìm kiếm */}
        <div className="col-md-6">
          <div className="position-relative">
            <i className="fa fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input 
              type="text" 
              className="form-control rounded-pill border-0 shadow-sm ps-5"
              placeholder="Tìm trong danh mục này..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-2 text-end">
          <button className="btn btn-white rounded-pill w-100 shadow-sm text-danger fw-medium" onClick={handleClearFilters}>
            Làm mới
          </button>
        </div>
      </div>

      <div className={`row transition-all ${loading ? 'opacity-50' : ''}`}>
        {products.length > 0 ? (
          products.map(p => <ProductCard key={p.id || p.productId} product={p} />)
        ) : !loading && (
          <div className="text-center py-5">
             <h4>Hết hàng hoặc không tìm thấy sản phẩm!</h4>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;