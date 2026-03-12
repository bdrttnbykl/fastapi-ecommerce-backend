import { useEffect, useRef, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function ProductsAdminPage({ token, onLogout, showViewSwitch = false, adminView = "admin", onAdminViewChange }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/`);
      const data = await response.json();
      setProducts(data);
    } catch {
      setMessage("Urunler alinamadi.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories/`);
      const data = await response.json();
      setCategories(data);
    } catch {
      setMessage("Kategoriler alinamadi.");
    }
  };

  const uploadImageIfNeeded = async () => {
    if (!imageFile) {
      return formData.image_url || null;
    }

    const payload = new FormData();
    payload.append("file", imageFile);

    const response = await fetch(`${API_BASE}/products/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getApiError(response, data, "Resim yuklenemedi"));
    }

    return data.image_url;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      image_url: "",
    });
    setImageFile(null);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const imageUrl = await uploadImageIfNeeded();

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: Number(formData.category_id),
        image_url: imageUrl,
      };

      const response = await fetch(
        editingId ? `${API_BASE}/products/${editingId}` : `${API_BASE}/products/`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(getApiError(response, data, "Islem basarisiz."));
        return;
      }

      setMessage(editingId ? "Urun guncellendi." : "Urun eklendi.");
      resetForm();
      fetchProducts();
    } catch (error) {
      setMessage(error.message || "Sunucu hatasi.");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category_id: product.category_id ?? "",
      image_url: product.image_url || "",
    });
    setImageFile(null);
    setMessage("Duzenleme modu aktif. Degisiklikleri yapip 'Urunu Guncelle'ye basin.");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (productId) => {
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(getApiError(response, data, "Silme islemi basarisiz."));
        return;
      }

      setMessage("Urun silindi.");
      fetchProducts();

      if (editingId === productId) {
        resetForm();
      }
    } catch {
      setMessage("Sunucu hatasi.");
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    return category ? category.name : "Bilinmiyor";
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1>Urun Yonetim Paneli</h1>
        {showViewSwitch && (
          <div style={styles.viewSwitch}>
            <button
              type="button"
              onClick={() => onAdminViewChange("store")}
              style={adminView === "store" ? styles.viewBtnActive : styles.viewBtn}
            >
              Musteri Magazasi
            </button>
            <button
              type="button"
              onClick={() => onAdminViewChange("admin")}
              style={adminView === "admin" ? styles.viewBtnActive : styles.viewBtn}
            >
              Isletme Paneli
            </button>
          </div>
        )}
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <form ref={formRef} onSubmit={handleSubmit} style={styles.form}>
        <input type="text" name="name" placeholder="Urun adi" value={formData.name} onChange={handleChange} required style={styles.input} />
        <input type="text" name="description" placeholder="Aciklama" value={formData.description} onChange={handleChange} style={styles.input} />
        <input type="number" name="price" placeholder="Fiyat" value={formData.price} onChange={handleChange} required style={styles.input} />
        <input type="number" name="stock" placeholder="Stok" value={formData.stock} onChange={handleChange} required style={styles.input} />

        <select name="category_id" value={formData.category_id} onChange={handleChange} required style={styles.input}>
          <option value="">Kategori sec</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div style={styles.filePickerRow}>
          <label htmlFor="product-image" style={styles.filePickerButton}>
            Dosya Sec
          </label>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            style={styles.hiddenInput}
          />
          <span style={styles.fileNameText}>
            {imageFile ? imageFile.name : "Dosya secilmedi"}
          </span>
        </div>

        {formData.image_url && !imageFile && (
          <img src={`${API_BASE}${formData.image_url}`} alt="Mevcut urun" style={styles.preview} />
        )}

        {imageFile && <p>Secilen dosya: {imageFile.name}</p>}

        <div style={styles.buttonRow}>
          <button type="submit" style={styles.button}>{editingId ? "Urunu Guncelle" : "Urun Ekle"}</button>
          {editingId && (
            <button type="button" onClick={resetForm} style={styles.cancelButton}>Iptal</button>
          )}
        </div>
      </form>

      <h2>Urun Listesi</h2>

      <div style={styles.list}>
        {products.length === 0 ? (
          <p>Henuz urun yok.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} style={editingId === product.id ? styles.cardEditing : styles.card}>
              {product.image_url && (
                <img src={`${API_BASE}${product.image_url}`} alt={product.name} style={styles.cardImage} />
              )}
              <h3>{product.name}</h3>
              <p><strong>Aciklama:</strong> {product.description || "-"}</p>
              <p><strong>Fiyat:</strong> {product.price}</p>
              <p><strong>Indirimli:</strong> {product.discounted_price}</p>
              <p><strong>Stok:</strong> {product.stock}</p>
              <p><strong>Kategori:</strong> {getCategoryName(product.category_id)}</p>

              <div style={styles.buttonRow}>
                <button type="button" onClick={() => handleEdit(product)} style={editingId === product.id ? styles.editButtonActive : styles.editButton}>Duzenle</button>
                <button type="button" onClick={() => handleDelete(product.id)} style={styles.deleteButton}>Sil</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div style={styles.bottomActions}>
        <button type="button" onClick={onLogout} style={styles.logoutButton}>Cikis Yap</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "0",
    borderRadius: "12px",
    background: "linear-gradient(120deg, #1678bd, #199b93)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  form: {
    display: "grid",
    gap: "12px",
    marginBottom: "30px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  preview: {
    width: "180px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
  },
  button: {
    padding: "10px 16px",
    border: "0",
    borderRadius: "12px",
    background: "linear-gradient(120deg, #1678bd, #199b93)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cancelButton: {
    padding: "10px 16px",
    border: "1px solid #9fb4c8",
    borderRadius: "12px",
    background: "#fff",
    color: "#1f3448",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  filePickerRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filePickerButton: {
    display: "inline-block",
    padding: "10px 16px",
    border: "0",
    borderRadius: "12px",
    background: "linear-gradient(120deg, #1678bd, #199b93)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  hiddenInput: {
    display: "none",
  },
  fileNameText: {
    color: "#2d4b66",
    fontSize: "14px",
  },
  viewSwitch: {
    display: "flex",
    gap: "8px",
  },
  bottomActions: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
  },
  viewBtn: {
    border: "1px solid #9fb4c8",
    background: "#fff",
    color: "#1f3448",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  viewBtnActive: {
    border: "1px solid #1678bd",
    background: "linear-gradient(120deg, #1678bd, #199b93)",
    color: "#fff",
    borderRadius: "999px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  editButton: {
    padding: "9px 13px",
    border: "0",
    borderRadius: "10px",
    background: "linear-gradient(120deg, #1678bd, #199b93)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  editButtonActive: {
    padding: "9px 13px",
    border: "0",
    borderRadius: "10px",
    background: "linear-gradient(120deg, #0f5e98, #158274)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  deleteButton: {
    padding: "9px 13px",
    border: "1px solid #c8d5e3",
    borderRadius: "10px",
    background: "#fff",
    color: "#1f3448",
    fontWeight: 700,
    cursor: "pointer",
  },
  list: {
    display: "grid",
    gap: "16px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
  },
  cardEditing: {
    border: "2px solid #1678bd",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 0 0 3px rgba(22,120,189,0.12)",
  },
  cardImage: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  message: {
    marginBottom: "16px",
    fontWeight: "bold",
  },
};

export default ProductsAdminPage;

