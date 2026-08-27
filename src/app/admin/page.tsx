"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  company: string;
  brand?: string;
  category: string;
  gender?: string;
  price: number;
  description?: string | null;
  image_url: string;
  images?: string[];
  rating?: number;
}

interface AdminOrder {
  id: string;
  user_id?: string;
  customer_email?: string;
  email?: string;
  user_email?: string;
  created_at?: string;
  total?: number;
  status?: string;
}

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  processing: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  pending: "bg-amber-500/15 text-amber-300 border-amber-400/20",
};

export default function AdminPage() {
  const [supabase] = useState(() => createClient());
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: "", company: "", category: "", price: "", image_url: "" });
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [productActionError, setProductActionError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*").order("id");

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load admin products:", error.message, error.details);
        setProductsError(error.message);
      } else if (data) {
        setProducts(data.map((product) => ({
          ...product,
          id: String(product.id),
          company: product.company || product.brand || "SOLE VAULT",
          gender: product.gender || "Unisex",
          image_url: product.image_url || "/placeholder.png",
          images: product.images || [product.image_url || "/placeholder.png"],
          rating: Number(product.rating || 0),
        })) as Product[]);
      }
      setProductsLoading(false);
    };

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("Failed to load admin orders:", error.message, error.details);
        setOrdersError(error.message);
      } else {
        setOrders((data || []) as AdminOrder[]);
      }
      setOrdersLoading(false);
    };

    fetchProducts();
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [supabase]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.company.toLowerCase().includes(query)
    );
  }, [products, search]);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const averageRating = products.length
    ? products.reduce((acc, product) => acc + (product.rating || 0), 0) / products.length
    : 0;

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: "", company: "", category: "", price: "", image_url: "" });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      company: product.company,
      category: product.category,
      price: String(product.price),
      image_url: product.image_url,
    });
    setIsProductModalOpen(true);
  };

  const saveProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = productForm.name.trim();
    const company = productForm.company.trim();
    const category = productForm.category.trim() || "Streetwear";
    const price = Number(productForm.price);
    const image_url = productForm.image_url.trim() || "/placeholder.png";
    if (!name || !company || !Number.isFinite(price) || price < 0) return;

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({ name, company, category, price, image_url })
        .eq("id", editingProduct.id);
      if (error) {
        console.error("Failed to update product:", error.message, error.details);
        setProductActionError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert({
        name,
        company,
        category,
        price,
        gender: "Unisex",
        image_url,
      });
      if (error) {
        console.error("Failed to add product:", error.message, error.details);
        setProductActionError(error.message);
        return;
      }
    }

    await fetchProductsFromSupabase();
    setIsProductModalOpen(false);
  };

  const fetchProductsFromSupabase = async () => {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) {
      console.error("Failed to refresh admin products:", error.message, error.details);
      setProductsError(error.message);
      return;
    }
    if (data) {
      setProducts(data.map((product) => ({
        ...product,
        id: String(product.id),
        company: product.company || product.brand || "SOLE VAULT",
        gender: product.gender || "Unisex",
        image_url: product.image_url || "/placeholder.png",
        images: product.images || [product.image_url || "/placeholder.png"],
        rating: Number(product.rating || 0),
      })) as Product[]);
    }
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      console.error("Failed to delete product:", error.message, error.details);
      setProductActionError(error.message);
      return;
    }
    await fetchProductsFromSupabase();
  };

  const formatStatus = (status?: string) => {
    const normalized = (status || "pending").toLowerCase();
    return {
      label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
      className: statusStyles[normalized] || statusStyles.pending,
    };
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
      <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-orange-400">SOLE VAULT / CONTROL ROOM</p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Catalog health, revenue, and fulfillment at a glance.</p>
        </div>
        <button
          type="button"
          onClick={openAddProduct}
          className="w-fit rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
        >
          + Add New Product
        </button>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Sales Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, note: "From recorded orders", accent: "text-orange-400" },
          { label: "Total Orders", value: ordersLoading ? "..." : orders.length.toLocaleString(), note: "Supabase orders", accent: "text-emerald-400" },
          { label: "Total Products", value: products.length.toLocaleString(), note: "Local catalog", accent: "text-blue-400" },
          { label: "Average Rating", value: averageRating ? averageRating.toFixed(1) : "0.0", note: "Across catalog", accent: "text-amber-400" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-white/10 bg-slate-800/80 p-5 shadow-xl shadow-black/10">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
            <p className={`mt-3 text-3xl font-black ${metric.accent}`}>{metric.value}</p>
            <p className="mt-2 text-xs text-slate-500">{metric.note}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.8fr)]">
        <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Inventory</p>
              <h2 className="mt-1 text-xl font-black text-white">Product Management</h2>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search catalog..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-400 sm:w-56"
            />
          </div>
          {productsError && <p className="border-b border-red-400/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">Unable to load products: {productsError}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">Product</th><th className="px-3 py-3">Brand</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Price</th><th className="px-3 py-3">Stock</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productsLoading ? <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">Loading products...</td></tr> : filteredProducts.map((product, index) => (
                  <tr key={product.id} className="text-sm transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3"><div className="flex items-center gap-3"><img src={product.image_url} alt={product.name} className="h-11 w-11 rounded-lg bg-slate-700 object-cover" /><div><p className="max-w-[230px] truncate font-bold text-white">{product.name}</p><p className="text-[11px] text-slate-500">{product.company}</p></div></div></td>
                    <td className="px-3 py-3 text-xs text-slate-300">{product.company}</td>
                    <td className="px-3 py-3 text-xs text-slate-400">{product.category}</td>
                    <td className="px-3 py-3 font-bold text-white">${product.price.toFixed(2)}</td>
                    <td className="px-3 py-3"><span className={`rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap ${index % 7 === 0 ? "border-amber-400/20 bg-amber-500/15 text-amber-300" : "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"}`}>{index % 7 === 0 ? "Low Stock" : "In Stock"}</span></td>
                    <td className="px-5 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditProduct(product)} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:border-orange-400 hover:text-orange-300">Edit</button><button type="button" onClick={() => deleteProduct(product.id)} className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-500/10">Delete</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl shadow-black/10">
          <div className="border-b border-white/10 p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Fulfillment</p><h2 className="mt-1 text-xl font-black text-white">Recent Orders</h2></div>
          {ordersError ? <p className="p-5 text-sm text-red-300">Unable to load orders: {ordersError}</p> : ordersLoading ? <p className="p-5 text-sm text-slate-400">Loading orders...</p> : orders.length === 0 ? <p className="p-5 text-sm text-slate-400">No orders recorded yet.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Total</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-white/5">{orders.slice(0, 12).map((order) => { const status = formatStatus(order.status); return <tr key={order.id} className="text-xs hover:bg-white/[0.03]"><td className="px-5 py-4 font-bold text-white">#{order.id.slice(0, 8)}</td><td className="max-w-[170px] truncate px-3 py-4 text-slate-400">{order.customer_email || order.email || order.user_email || order.user_id || "Customer"}</td><td className="px-3 py-4 text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}</td><td className="px-3 py-4 font-bold text-white">${Number(order.total || 0).toFixed(2)}</td><td className="px-5 py-4"><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}>{status.label}</span></td></tr>; })}</tbody></table></div>}
        </section>
      </div>

      {isProductModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"><form onSubmit={saveProduct} className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-white">{editingProduct ? "Edit Product" : "Add Product"}</h2><button type="button" onClick={() => setIsProductModalOpen(false)} className="text-xl text-slate-400 hover:text-white" aria-label="Close product form">×</button></div><div className="mt-5 space-y-4"><label className="block text-xs font-bold text-slate-300">Product name<input required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label><label className="block text-xs font-bold text-slate-300">Brand / Company<input required value={productForm.company} onChange={(event) => setProductForm({ ...productForm, company: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label><label className="block text-xs font-bold text-slate-300">Image URL / Path<input value={productForm.image_url} onChange={(event) => setProductForm({ ...productForm, image_url: event.target.value })} placeholder="/images/products/1/1.jpg" className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-400" /></label><label className="block text-xs font-bold text-slate-300">Category<input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label><label className="block text-xs font-bold text-slate-300">Price<input required type="number" min="0" step="0.01" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setIsProductModalOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5">Cancel</button><button type="submit" className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-400">Save Product</button></div></form></div>}
    </main>
  );
}