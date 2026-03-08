import React, { useState, useEffect } from "react";
import { PlusCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToastSuccess, showToastError } from "@/utils/alerts";
import type { Product } from "@/types";
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/utils/api/products";
import ProductTable from "@/components/products/ProductTable";
import ProductFormModal from "@/components/products/ProductFormModal";
import ProductDeleteConfirmModal from "@/components/products/ProductDeleteConfirmModal";
import ProductsSkeleton from "../../components/dashboard/skeletons/ProductsSkeleton";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
      showToastError({ title: "Error", text: "Failed to load products." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProductClick = () => {
    setSelectedProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
        showToastSuccess({ title: "Success", text: "อัพเดทสินค้าสำเร็จ!" });
      } else {
        await createProduct(productData as Omit<Product, 'id'>);
        showToastSuccess({ title: "Success", text: "สร้างสินค้าสำเร็จ!" });
      }
      fetchProducts();
      setIsFormModalOpen(false);
      return true;
    } catch (err) {
      console.error("Error saving product:", err);
      showToastError({ title: "Error", text: "เกิดข้อผิดพลาดในการสร้างสินค้่า." });
      return false;
    }
  };

  const handleDeleteConfirm = async (productId: string) => {
    try {
      await deleteProduct(productId);
      showToastSuccess({ title: "Success", text: "ลบสินค้าสำเร็จ!" });
      fetchProducts();
      setIsDeleteConfirmModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error deleting product:", err);
      showToastError({ title: "Error", text: "เกิดผิดพลาดในการดึงข้อมูล" });
    }
  };

  if (loading) {
    return <ProductsSkeleton />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-11/12 mx-auto">
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-sm shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Package className="w-10 h-10 mr-4 text-white" />
              จัดการสินค้า
            </h1>
            <p className="text-white text-lg">รายการสินค้าทั้งหมด</p>
          </div>
          <Button
            onClick={handleAddProductClick}
            className="bg-white text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
      </div>
      <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteClick} />

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveProduct}
        currentProduct={selectedProduct || undefined}
      />

      <ProductDeleteConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productToDelete={selectedProduct}
      />
    </div>
  );
};

export default Products;
