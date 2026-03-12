import { useEffect, useMemo, useState } from "react";
import "./StorePage.css";

const API_BASE = "http://127.0.0.1:8000";

function StorePage({ token, user, onLogout, showViewSwitch = false, adminView = "store", onAdminViewChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState(null);
  const [view, setView] = useState("store");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shippingFee] = useState(79.9);
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCart();
  }, []);

  const getErrorMessage = (data, fallback) => {
    if (data?.detail) return data.detail;
    if (data?.error?.message) return data.error.message;
    return fallback;
  };

  const getApiError = (response, data, fallback) => {
    if (response.status === 401) {
      onLogout();
      return "Oturum suresi doldu. Lutfen tekrar giris yapin.";
    }
    return getErrorMessage(data, fallback);
  };

  const fetchProducts = async (categoryId = "") => {
    try {
      const url = categoryId
        ? `${API_BASE}/products/?category_id=${categoryId}`
        : `${API_BASE}/products/`;
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Ürünler alınamadı"));
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
        throw new Error(getErrorMessage(data, "Kategoriler alınamadı"));
      }
      setCategories(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`${API_BASE}/cart/`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(response, data, "Sepet alınamadı"));
      }

      setCart(data);
      setMessage("Sepet guncellendi");
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
        throw new Error(getApiError(response, data, "Sepete eklenemedi"));
      }

      setCart(data);
      setMessage("Ürün sepete eklendi");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(response, data, "Sepet guncellenemedi"));
      }
      setCart(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(response, data, "Urun sepetten silinemedi"));
      }
      setCart(data);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createOrder = async () => {
    if (!address.trim()) {
      setMessage("Lutfen teslimat adresi gir");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(getApiError(response, data, "Siparis olusturulamadi"));
      }
      setMessage("Siparis olusturuldu");
      setAddress("");
      fetchCart();
      setView("store");
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

  const subtotal = Number(cart?.total_price || 0);
  const grandTotal = totalItems > 0 ? (subtotal + shippingFee).toFixed(2) : "0.00";
  const stableCartItems = useMemo(() => {
    if (!cart?.items) return [];
    return [...cart.items].sort((a, b) => a.id - b.id);
  }, [cart]);

  if (view === "cart") {
    return (
      <div className="store-page">
        <div className="store-topbar">
          <div>
            <p className="store-kicker">Alisveris Sepeti</p>
            <h1>Sepetiniz</h1>
          </div>
          <button type="button" className="store-refresh-btn" onClick={() => setView("store")}>
            Magazaya Don
          </button>
        </div>

        {message && <p className="store-message">{message}</p>}

        <div className="cart-layout">
          <section className="cart-items">
            {stableCartItems.length ? (
              stableCartItems.map((item) => (
                <article key={item.id} className="cart-item-row">
                  <div>
                    <h3 className="cart-item-name">{item.product_name}</h3>
                    <p className="cart-item-line">Birim: {item.discounted_unit_price} ₺</p>
                  </div>
                  <div className="cart-qty">
                    <button
                      type="button"
                      onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong className="cart-line-total">{item.line_total} ₺</strong>
                  <button type="button" className="cart-remove" onClick={() => removeCartItem(item.id)}>
                    Sil
                  </button>
                </article>
              ))
            ) : (
              <p>Sepet bos.</p>
            )}
          </section>

          <aside className="cart-summary">
            <h3>Siparis Ozeti</h3>
            <div className="cart-summary-row">
              <span>Ara Toplam</span>
              <strong>{subtotal.toFixed(2)} ₺</strong>
            </div>
            <div className="cart-summary-row">
              <span>Kargo</span>
              <strong>{totalItems > 0 ? shippingFee.toFixed(2) : "0.00"} ₺</strong>
            </div>
            <div className="cart-summary-row total">
              <span>Genel Toplam</span>
              <strong>{grandTotal} ₺</strong>
            </div>
            <textarea
              className="cart-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Teslimat adresi"
            />
            <button type="button" className="cart-checkout-btn" onClick={createOrder} disabled={!cart?.items?.length}>
              Siparisi Tamamla
            </button>
          </aside>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedProduct) {
    const hasDiscount = selectedProduct.discounted_price < selectedProduct.price;
    return (
      <div className="store-page">
        <div className="store-topbar">
          <div>
            <p className="store-kicker">Urun Detayi</p>
            <h1>{selectedProduct.name}</h1>
          </div>
          <button type="button" className="store-refresh-btn" onClick={() => setView("store")}>
            Magazaya Don
          </button>
        </div>

        {message && <p className="store-message">{message}</p>}

        <div className="product-detail-layout">
          <div className="product-detail-media">
            {selectedProduct.image_url ? (
              <img src={`${API_BASE}${selectedProduct.image_url}`} alt={selectedProduct.name} className="product-detail-image" />
            ) : (
              <div className="product-detail-image product-detail-placeholder">Gorsel yok</div>
            )}
          </div>
          <div className="product-detail-body">
            <h2>{selectedProduct.name}</h2>
            <p className="product-detail-desc">{selectedProduct.description || "Aciklama bulunmuyor."}</p>
            <p className="product-detail-stock">Stok: {selectedProduct.stock}</p>
            <div className="store-price-row">
              <span className="store-new-price">{selectedProduct.discounted_price} ₺</span>
              {hasDiscount && <span className="store-old-price">{selectedProduct.price} ₺</span>}
            </div>
            <div className="product-detail-actions">
              <button
                type="button"
                onClick={() => addToCart(selectedProduct.id)}
                disabled={selectedProduct.stock <= 0}
                className="store-cart-btn"
              >
                {selectedProduct.stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
              </button>
              <button
                type="button"
                className="store-logout-btn"
                onClick={() => {
                  fetchCart();
                  setView("cart");
                }}
              >
                Sepete Git ({totalItems})
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="store-page">
      <div className="store-categories-rail">
        <button
          type="button"
          className={selectedCategory === "" ? "store-cat-btn active" : "store-cat-btn"}
          onClick={() => {
            setSelectedCategory("");
            fetchProducts("");
          }}
        >
          Tum urunler
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={String(selectedCategory) === String(category.id) ? "store-cat-btn active" : "store-cat-btn"}
            onClick={() => {
              setSelectedCategory(String(category.id));
              fetchProducts(String(category.id));
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="store-controls-row">
        <div className="store-filtered-label">Filtrelenen: {products.length} urun</div>
        <div className="store-controls-right">
          <button
            type="button"
            onClick={() => {
              fetchCart();
              setView("cart");
            }}
            className="store-refresh-btn"
          >
            Sepete Git ({totalItems})
          </button>
          {showViewSwitch && (
            <div className="store-view-switch">
              <button
                type="button"
                className={adminView === "store" ? "store-view-btn active" : "store-view-btn"}
                onClick={() => onAdminViewChange("store")}
              >
                Magaza
              </button>
              <button
                type="button"
                className={adminView === "admin" ? "store-view-btn active" : "store-view-btn"}
                onClick={() => onAdminViewChange("admin")}
              >
                Panel
              </button>
            </div>
          )}
        </div>
      </div>

      {message && <p className="store-message">{message}</p>}

      <div className="store-grid">
        {products.map((product) => {
          const hasDiscount = product.discounted_price < product.price;
          const discountPercent = hasDiscount
            ? Math.round(((product.price - product.discounted_price) / product.price) * 100)
            : 0;
          return (
            <article key={product.id} className="store-card" onClick={() => { setSelectedProduct(product); setView("detail"); }}>
              <div className="store-media">
                {product.image_url ? (
                  <img src={`${API_BASE}${product.image_url}`} alt={product.name} className="store-image" />
                ) : (
                  <div className="store-image store-image-placeholder">Gorsel yok</div>
                )}
              </div>

              <div className="store-body">
                {hasDiscount && <span className="store-discount-chip">%{discountPercent} Indirim</span>}
                <h3>{product.name}</h3>
                <div className="store-price-row">
                  <span className="store-new-price">{product.discounted_price} ₺</span>
                  {hasDiscount && <span className="store-old-price">{product.price} ₺</span>}
                </div>
                <p className="store-meta">Stok: {product.stock}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id);
                  }}
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

      <button type="button" onClick={onLogout} className="store-logout-floating">
        Cikis
      </button>
    </div>
  );
}

export default StorePage;
