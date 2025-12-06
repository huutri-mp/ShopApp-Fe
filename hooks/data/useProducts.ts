"use client";

import { useState, useCallback } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  image: string;
  discount?: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium Wireless Headphones",
      price: 89.99,
      description: "High-quality wireless headphones with noise cancellation",
      category: "Audio",
      stock: 50,
      rating: 4.5,
      reviews: 234,
      image: "/wireless-headphones.png",
      discount: 20,
    },
    {
      id: "2",
      name: "Smart Watch Pro",
      price: 189.99,
      description: "Advanced smartwatch with fitness tracking",
      category: "Smart Devices",
      stock: 30,
      rating: 4.8,
      reviews: 156,
      image: "/modern-smartwatch.png",
      discount: 15,
    },
  ]);

  const addProduct = useCallback((newProduct: Omit<Product, "id">) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProductById = useCallback(
    (id: string) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
  };
}
