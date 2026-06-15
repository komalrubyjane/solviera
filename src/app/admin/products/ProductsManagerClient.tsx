"use client";

import React, { useState } from "react";
import { createProductAction, updateProductAction, deleteProductAction } from "@/app/actions/admin";

interface Product {
  id: string;
  name: string;
  desc: string;
  price: number;
  badge: string | null;
  img: string;
}

interface Props {
  initialProducts: Product[];
}

export default function ProductsManagerClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form Fields
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editBadge, setEditBadge] = useState("");
  const [editImg, setEditImg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add New Product Form Fields
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newBadge, setNewBadge] = useState("");
  const [newImg, setNewImg] = useState("/tote_crochet.png");

  const showToast = (msg: string) => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.innerText = msg;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 4000);
    }
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.desc);
    setEditPrice(p.price);
    setEditBadge(p.badge || "");
    setEditImg(p.img);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setIsSubmitting(true);

    const res = await updateProductAction(editingId, {
      name: editName,
      desc: editDesc,
      price: Number(editPrice),
      badge: editBadge || null,
      img: editImg,
    });

    if (res.success && res.product) {
      showToast("Featured piece updated successfully!");
      setProducts(products.map(p => p.id === editingId ? (res.product as Product) : p));
      setEditingId(null);
    } else {
      showToast(res.message || "Failed to update featured piece.");
    }
    setIsSubmitting(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesc || !newPrice) return;
    setIsSubmitting(true);

    const res = await createProductAction({
      name: newName,
      desc: newDesc,
      price: Number(newPrice),
      badge: newBadge || undefined,
      img: newImg,
    });

    if (res.success && res.product) {
      showToast("New featured piece added successfully!");
      setProducts([res.product as Product, ...products]);
      setNewName("");
      setNewDesc("");
      setNewPrice(0);
      setNewBadge("");
      setNewImg("/tote_crochet.png");
    } else {
      showToast(res.message || "Failed to add featured piece.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this featured piece from the home catalog?")) return;
    setIsSubmitting(true);
    const res = await deleteProductAction(id);
    if (res.success) {
      showToast("Featured piece deleted successfully.");
      setProducts(products.filter(p => p.id !== id));
    } else {
      showToast("Failed to delete product.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-dark-mocha font-light">Featured Pieces Catalog</h1>
        <p className="text-xs font-light text-soft-brown mt-1">
          Add, edit, or delete items showcased under the Curated Selection - Featured Pieces homepage panel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD PRODUCT FORM */}
        <div className="lg:col-span-1 bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md h-fit">
          <h3 className="font-serif text-lg text-dark-mocha mb-6">Add Featured Piece</h3>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="form-label text-[10px]" htmlFor="p-name">Piece Title</label>
              <input
                type="text"
                id="p-name"
                className="form-input text-xs"
                placeholder="e.g. Starry Night Cat"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]" htmlFor="p-price">Price (INR)</label>
              <input
                type="number"
                id="p-price"
                className="form-input text-xs"
                placeholder="e.g. 22900"
                value={newPrice || ""}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="form-label text-[10px]" htmlFor="p-badge">Status Badge (Optional)</label>
              <input
                type="text"
                id="p-badge"
                className="form-input text-xs"
                placeholder="e.g. Bestseller, New"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label text-[10px]" htmlFor="p-img">Bag Image Source Path</label>
              <select
                id="p-img"
                className="form-input text-xs"
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
              >
                <option value="/tote_crochet.png">Toscana Tulip (/tote_crochet.png)</option>
                <option value="/tote_hibiscus.png">Atelier Lotus (/tote_hibiscus.png)</option>
                <option value="/tote_starry_cat.png">Starry Night Cat (/tote_starry_cat.png)</option>
                <option value="/tote_floral.png">Floral Canvas (/tote_floral.png)</option>
                <option value="/tote_blockprint.png">Blockprint Canvas (/tote_blockprint.png)</option>
              </select>
            </div>
            <div>
              <label className="form-label text-[10px]" htmlFor="p-desc">Catalog Description</label>
              <textarea
                id="p-desc"
                className="form-input text-xs h-24"
                placeholder="Describe the craftsmanship details..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-mocha text-cream font-bold py-3 px-6 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 hover:scale-102"
            >
              Add Product
            </button>
          </form>
        </div>

        {/* PRODUCTS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-sand/30 border border-mocha/10 rounded-2xl p-6 shadow-md">
            <h3 className="font-serif text-lg text-dark-mocha mb-6">Active Featured Pieces ({products.length})</h3>
            
            <div className="space-y-4">
              {products.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} className="p-4 bg-beige/10 rounded-xl border border-mocha/5 flex gap-4">
                    <div className="w-16 h-16 relative bg-white/40 border border-mocha/10 rounded-xl flex items-center justify-center p-2">
                      <img src={p.img} alt={p.name} className="max-w-full max-h-full object-contain" />
                    </div>

                    <div className="flex-1">
                      {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="form-label text-[9px] mb-1">Title</label>
                              <input
                                type="text"
                                className="form-input text-xs"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <label className="form-label text-[9px] mb-1">Price (INR)</label>
                              <input
                                type="number"
                                className="form-input text-xs"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="form-label text-[9px] mb-1">Status Badge</label>
                              <input
                                type="text"
                                className="form-input text-xs"
                                value={editBadge}
                                onChange={(e) => setEditBadge(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="form-label text-[9px] mb-1">Image Path</label>
                              <select
                                className="form-input text-xs"
                                value={editImg}
                                onChange={(e) => setEditImg(e.target.value)}
                              >
                                <option value="/tote_crochet.png">Toscana Tulip (/tote_crochet.png)</option>
                                <option value="/tote_hibiscus.png">Atelier Lotus (/tote_hibiscus.png)</option>
                                <option value="/tote_starry_cat.png">Starry Night Cat (/tote_starry_cat.png)</option>
                                <option value="/tote_floral.png">Floral Canvas (/tote_floral.png)</option>
                                <option value="/tote_blockprint.png">Blockprint Canvas (/tote_blockprint.png)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="form-label text-[9px] mb-1">Description</label>
                            <textarea
                              className="form-input text-xs h-20"
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="bg-mocha text-cream px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="bg-sand/60 text-soft-brown border border-mocha/10 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-dark-mocha">{p.name}</h4>
                              {p.badge && (
                                <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-0.5 px-2 rounded-md uppercase font-semibold">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-mocha font-medium mt-1">₹{p.price.toLocaleString()}</p>
                            <p className="text-[11px] font-light text-soft-brown mt-1.5 leading-relaxed">{p.desc}</p>
                          </div>
                          <div className="flex gap-3 text-xs pt-1">
                            <button
                              type="button"
                              onClick={() => startEditing(p)}
                              className="text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="text-red-400 hover:text-red-300 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div id="toast" className="text-dark-mocha text-xs font-light rounded-xl"></div>
    </div>
  );
}
