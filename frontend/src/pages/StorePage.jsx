import { useEffect, useMemo, useState } from "react";
import "./StorePage.css";

const API_BASE = "http://127.0.0.1:8000";

function StorePage({ token, user, onLogout, showViewSwitch = false, adminView = "store", onAdminViewChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCart();
  }, []);

  const fetchProducts = async (categoryId = "") => {
    try {
      const url = categoryId
        ? `${API_BASE}/products/?category_id=${categoryId}`
        : `${API_BASE}/products/`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Ürünler alınamadı");
      }
      setProducts(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories/`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Kategoriler alınamadı");
      }
      setCategories(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Sepet alınamadı");
      }

      setCart(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const addToCart = async (productId) => {
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Sepete eklenemedi");
      }

      setCart(data);
      setMessage("Ürün sepete eklendi");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const totalItems = useMemo(() => {
    if (!cart?.items) {
      return 0;
    }

    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="store-page">
      <div className="store-topbar">
        <div>
          <p className="store-kicker">E-Commerce Store</p>
          <h1>Merhaba, {user.username}</h1>
        </div>
        {showViewSwitch && (
          <div className="store-view-switch">
            <button
              type="button"
              className={adminView === "store" ? "store-view-btn active" : "store-view-btn"}
              onClick={() => onAdminViewChange("store")}
            >
              Müşteri Mağazası
            </button>
            <button
              type="button"
              className={adminView === "admin" ? "store-view-btn active" : "store-view-btn"}
              onClick={() => onAdminViewChange("admin")}
            >
              İşletme Paneli
            </button>
          </div>
        )}
      </div>

      <div className="store-toolbar">
        <div className="store-chip">Sepet Adet: {totalItems}</div>
        <div className="store-chip">Sepet Toplam: {cart?.total_price ?? 0} ₺</div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            fetchProducts(e.target.value);
          }}
          className="store-select"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button onClick={fetchCart} className="store-refresh-btn">Sepeti Yenile</button>
      </div>

      {message && <p className="store-message">{message}</p>}

      <div className="store-grid">
        {products.map((product) => {
          const hasDiscount = product.discounted_price < product.price;
          return (
            <article key={product.id} className="store-card">
              <div className="store-media">
                {hasDiscount && <span className="store-discount-badge">Avantajlı Ürün</span>}
                <button type="button" className="store-fav-btn" aria-label="Favorilere ekle">
                  ♡
                </button>
                {product.image_url ? (
                  <img
                    src={`${API_BASE}${product.image_url}`}
                    alt={product.name}
                    className="store-image"
                  />
                ) : (
                  <div className="store-image store-image-placeholder">Görsel yok</div>
                )}
              </div>

              <div className="store-body">
                <h3>{product.name}</h3>
                <p className="store-desc">{product.description || "Açıklama bulunmuyor"}</p>

                <div className="store-price-row">
                  {hasDiscount ? (
                    <>
                      <span className="store-old-price">{product.price} ₺</span>
                      <span className="store-new-price">{product.discounted_price} ₺</span>
                    </>
                  ) : (
                    <span className="store-new-price">{product.price} ₺</span>
                  )}
                </div>

                <p className="store-meta">Stok: {product.stock}</p>

                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock <= 0}
                  className="store-cart-btn"
                >
                  {product.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="store-bottom-actions">
        <button onClick={onLogout} className="store-logout-btn">Çıkış Yap</button>
      </div>
    </div>
  );
}

export default StorePage;
