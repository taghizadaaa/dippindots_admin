import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Dashboards = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    details: '',
    price: '',
    type: '', 
    size: '', 
    productImage: null,
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedValues, setEditedValues] = useState({
    name: '',
    details: '',
    price: '',
    type: '',
    size: '',
    productImage: '',
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        const apiProducts = await response.json();

        const savedProducts = JSON.parse(localStorage.getItem('products')) || [];

        const mergedProducts = [
          ...apiProducts,
          ...savedProducts.filter((product) => !apiProducts.some((apiProduct) => apiProduct.id === product.id)),
        ];

        const sortedProducts = mergedProducts.map((product, index) => ({
          ...product,
          id: index + 1,
        }));

        setProducts(sortedProducts);
        localStorage.setItem('products', JSON.stringify(sortedProducts));
      } catch (error) {
        console.error('Error fetching products:', error);
        const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
        setProducts(savedProducts);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, productImage: file });
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.details || !newProduct.price || !newProduct.type || !newProduct.size || !newProduct.productImage) {
      alert('All fields are required!');
      return;
    }

    const maxId = products.length > 0 ? Math.max(...products.map((p) => p.id)) : 0;
    const newId = maxId + 1;

    const productToAdd = {
      ...newProduct,
      id: newId,
    };

    const updatedProducts = [...products, productToAdd];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('details', newProduct.details);
      formData.append('price', newProduct.price);
      formData.append('type', newProduct.type);
      formData.append('size', newProduct.size);
      formData.append('productImage', newProduct.productImage);

      const response = await axios.post('http://localhost:8080/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200 || response.status === 201) {
        alert('Product added successfully to the API!');
      }
    } catch (error) {
      console.error('Error adding product to API:', error);
      alert('Product added locally. Will sync with API when online.');
    }

    setNewProduct({ name: '', details: '', price: '', type: '', size: '', productImage: null });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8080/api/products/${id}`);
      if (response.status === 200 || response.status === 204) {
        alert('Product deleted successfully from the API!');
      }
    } catch (error) {
      console.error('Error deleting product from API:', error);
      alert('Failed to delete product from API. Deleting locally instead.');
    }

    let savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    savedProducts = savedProducts.filter((product) => product.id !== id);
    localStorage.setItem('products', JSON.stringify(savedProducts));

    setProducts(savedProducts);

    alert('Product deleted successfully!');
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditedValues({
      name: product.name,
      details: product.details,
      price: product.price,
      type: product.type,
      size: product.size,
      productImage: product.productImage,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedValues({ ...editedValues, [name]: value });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/products/${editingProductId}`, editedValues, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 || response.status === 204) {
        alert('Product updated successfully in the API!');
      }

      const updatedProducts = products.map((product) =>
        product.id === editingProductId ? { ...product, ...editedValues } : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      setEditingProductId(null);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product in API. Updating locally instead.');

      const updatedProducts = products.map((product) =>
        product.id === editingProductId ? { ...product, ...editedValues } : product
      );
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));

      setEditingProductId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="add-product-form">
        <h2>Add New Product</h2>
        <input type="text" name="name" placeholder="Name" value={newProduct.name} onChange={handleInputChange} />
        <input type="text" name="details" placeholder="Details" value={newProduct.details} onChange={handleInputChange} />
        <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleInputChange} />
        <select name="type" value={newProduct.type} onChange={handleInputChange}>
          <option value="">Select Type</option>
          <option value="cream">Cream</option>
          <option value="ice">Ice</option>
          <option value="yogurt">Yogurt</option>
        </select>
        <select name="size" value={newProduct.size} onChange={handleInputChange}>
          <option value="">Select Size</option>
          <option value="bulk">Bulk</option>
          <option value="single">Single</option>
        </select>
        <input type="file" name="productImage" accept="image/*" onChange={handleImageChange} />
        {newProduct.productImage && <img src={URL.createObjectURL(newProduct.productImage)} alt="Preview" width="100" />}
        <button onClick={addProduct}>Add Product</button>
      </div>

      <div className="product-list">
        <h2>Product List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Details</th>
              <th>Price</th>
              <th>Type</th>
              <th>Size</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {editingProductId === product.id ? (
                    <input type="text" name="name" value={editedValues.name} onChange={handleEditChange} />
                  ) : (
                    product.name
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input type="text" name="details" value={editedValues.details} onChange={handleEditChange} />
                  ) : (
                    product.details
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <input type="number" name="price" value={editedValues.price} onChange={handleEditChange} />
                  ) : (
                    product.price
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <select name="type" value={editedValues.type} onChange={handleEditChange}>
                      <option value="cream">Cream</option>
                      <option value="ice">Ice</option>
                      <option value="yogurt">Yogurt</option>
                    </select>
                  ) : (
                    product.type
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <select name="size" value={editedValues.size} onChange={handleEditChange}>
                      <option value="bulk">Bulk</option>
                      <option value="single">Single</option>
                    </select>
                  ) : (
                    product.size
                  )}
                </td>
                <td>
                  {product.productImage ? (
                    <img src={`http://localhost:8080/${product.productImage}`} alt={product.name} width="50" />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <>
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(product)} className="edit-button button-spacing">
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="button-spacing">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboards;