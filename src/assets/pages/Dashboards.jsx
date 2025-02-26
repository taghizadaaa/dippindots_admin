import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Dashboards = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', details: '', price: '', productImage: null });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedValues, setEditedValues] = useState({ name: '', details: '', price: '', productImage: '' });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        const apiProducts = await response.json();
  
        const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
  
        const mergedProducts = [
          ...apiProducts,
          ...savedProducts.filter((product) => !apiProducts.some((apiProduct) => apiProduct.id === product.id))
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
    if (!newProduct.name || !newProduct.details || !newProduct.price || !newProduct.productImage) {
      alert('All fields are required!');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('details', newProduct.details);
    formData.append('price', newProduct.price);
    formData.append('productImage', newProduct.productImage);
  
    try {
      const response = await axios.post('http://localhost:8080/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      if (response.status === 200 || response.status === 201) {
        alert('Product added successfully!');
        const addedProduct = response.data;
  
        const updatedProducts = [...products, { ...addedProduct, isFromAPI: true }];
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
        setNewProduct({ name: '', details: '', price: '', productImage: null });

        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding product:', error);
  
      const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
      const localProduct = {
        ...newProduct,
        id: maxId + 1, 
        isFromAPI: false,
      };
  
      const updatedProducts = [...products, localProduct];
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
  
      alert('Product added locally (offline mode).');
  

      window.location.reload();
    }
  };
  
  

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
  
    try {

      const productExistsInAPI = products.find((product) => product.id === id && product.isFromAPI);
      
      if (productExistsInAPI) {
        const response = await axios.delete(`http://localhost:8080/api/products/${id}`);
        if (response.status !== 200 && response.status !== 204) {
          throw new Error('Failed to delete product from API');
        }
        console.log(`Product with ID ${id} deleted from API.`);
      }
  

      let savedProducts = JSON.parse(localStorage.getItem('products')) || [];
      savedProducts = savedProducts.filter((product) => product.id !== id);
      localStorage.setItem('products', JSON.stringify(savedProducts));
  

      setProducts(savedProducts);
  
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };
  
  
  
  
  
  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setEditedValues({ name: product.name, details: product.details, price: product.price, productImage: product.productImage });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedValues({ ...editedValues, [name]: value });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedValues),
      });
  
      if (!response.ok) {
        throw new Error('Error updating product');
      }
  
      const updatedProducts = products.map((product) =>
        product.id === editingProductId ? { ...product, ...editedValues } : product
      );
  
      setProducts(updatedProducts);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      setEditingProductId(null);
    } catch (error) {
      console.error('Error updating product:', error);
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
                  {product.productImage ? <img
                    src={`http://localhost:8080/${product.productImage}`}
                    alt={product.name}
                    width="50"
                  /> : <span>No Image</span>}
                </td>
                <td>
                  {editingProductId === product.id ? (
                    <>
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(product)} className="edit-button button-spacing">Edit</button>
                      <button onClick={() => deleteProduct(product.id)} className="button-spacing">Delete</button>
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
