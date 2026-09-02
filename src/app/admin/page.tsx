"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/context/StoreContext";

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

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at?: string;
}

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  processing: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  pending: "bg-amber-500/15 text-amber-300 border-amber-400/20",
};

export default function AdminPage() {
  const [supabase] = useState(() => createClient());
  const { user } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const [search, setSearch] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    company: "",
    category: "",
    price: "",
    image_url: "",
  });

  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [productActionError, setProductActionError] = useState("");

  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [userActionLoadingId, setUserActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users || []);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchProductsFromSupabase = async () => {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) {
      setProductsError(error.message);
      return;
    }
    if (data) {
      setProducts(
        data.map((product) => ({
          ...product,
          id: String(product.id),
          company: product.company || product.brand || "SOLE VAULT",
          gender: product.gender || "Unisex",
          image_url: product.image_url || "/placeholder.png",
          images: product.images || [product.image_url || "/placeholder.png"],
          rating: Number(product.rating || 0),
        })) as Product[]
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      // 1. Load Products
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("id");

      if (isMounted) {
        if (prodError) {
          setProductsError(prodError.message);
        } else if (prodData) {
          setProducts(
            prodData.map((product) => ({
              ...product,
              id: String(product.id),
              company: product.company || product.brand || "SOLE VAULT",
              gender: product.gender || "Unisex",
              image_url: product.image_url || "/placeholder.png",
              images: product.images || [product.image_url || "/placeholder.png"],
              rating: Number(product.rating || 0),
            })) as Product[]
          );
        }
        setProductsLoading(false);
      }

      // 2. Load Orders
      const { data: ordData, error: ordError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (ordError) {
          setOrdersError(ordError.message);
        } else {
          setOrders((ordData || []) as AdminOrder[]);
        }
        setOrdersLoading(false);
      }

      // 3. Load All Auth Users
      await fetchUsers();
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // User Actions
const handleToggleRole = async (targetUser: UserProfile) => {
  const newRole = targetUser.role === "admin" ? "user" : "admin";
  setUserActionLoadingId(targetUser.id);

  try {
    // 1. Send request ONLY to your Next.js server route
    const res = await fetch("/api/admin/users/role", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        targetUserId: targetUser.id, 
        newRole 
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update role");
    }

    // 2. Update local state on success
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );
  } catch (err: any) {
    alert(err.message);
  } finally {
    setUserActionLoadingId(null);
  }
};

  const handleDeleteUser = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;

    setUserActionLoadingId(targetUserId);

    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUserActionLoadingId(null);
    }
  };

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
    setProductActionError("");
    setEditingProduct(null);
    setProductForm({ name: "", company: "", category: "", price: "", image_url: "" });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setProductActionError("");
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
    setProductActionError("");

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
        setProductActionError(error.message);
        return;
      }
    }

    await fetchProductsFromSupabase();
    setIsProductModalOpen(false);
  };

  const deleteProduct = async (productId: string) => {
    setProductActionError("");
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
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
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-orange-400 sm:text-xs">
            SOLE VAULT / CONTROL ROOM
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Catalog health, user access, and fulfillment at a glance.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddProduct}
          className="w-full rounded-xl bg-orange-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 sm:w-fit"
        >
          + Add New Product
        </button>
      </header>

      {/* Metric Cards */}
      <section className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          {
            label: "Total Sales Revenue",
            value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            note: "Recorded orders",
            accent: "text-orange-400",
          },
          {
            label: "Total Orders",
            value: ordersLoading ? "..." : orders.length.toLocaleString(),
            note: "Supabase orders",
            accent: "text-emerald-400",
          },
          {
            label: "Total Products",
            value: products.length.toLocaleString(),
            note: "Catalog items",
            accent: "text-blue-400",
          },
          {
            label: "Total Accounts",
            value: usersLoading ? "..." : users.length.toLocaleString(),
            note: "Auth accounts",
            accent: "text-amber-400",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-slate-800/80 p-4 sm:p-5 shadow-xl shadow-black/10"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
              {metric.label}
            </p>
            <p className={`mt-2 text-xl font-black sm:mt-3 sm:text-3xl ${metric.accent}`}>
              {metric.value}
            </p>
            <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{metric.note}</p>
          </div>
        ))}
      </section>

      {/* User Management Section */}
      <section className="mb-8 rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between border-b border-white/10 p-4 sm:p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 sm:text-xs">
              Accounts
            </p>
            <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">User Management</h2>
          </div>
          <button
            onClick={fetchUsers}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>

        {usersError ? (
          <p className="p-4 text-xs text-red-300 sm:text-sm">Unable to load users: {usersError}</p>
        ) : usersLoading ? (
          <p className="p-4 text-xs text-slate-400 sm:text-sm">Loading user accounts...</p>
        ) : (
          <div>
            {/* Mobile View: Cards */}
            <div className="divide-y divide-white/5 sm:hidden">
              {users.map((u) => {
                const isCurrentAdmin = u.id === user?.id;
                const isLoading = userActionLoadingId === u.id;

                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-sm">{u.full_name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{u.email}</p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                          u.role === "admin"
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="flex gap-2">
<button
  disabled={isLoading || isCurrentAdmin}
  onClick={() => handleToggleRole(u)}
  className="flex-1 rounded-lg border border-white/10 bg-slate-900 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
>
  {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
</button>
                      <button
                        disabled={isLoading || isCurrentAdmin}
                        onClick={() => handleDeleteUser(u.id)}
                        className="flex-1 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-xs font-bold text-red-300 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => {
                    const isCurrentAdmin = u.id === user?.id;
                    const isLoading = userActionLoadingId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.03]">
                        <td className="px-5 py-3.5 font-bold text-white">{u.full_name}</td>
                        <td className="px-3 py-3.5 text-slate-300">{u.email}</td>
                        <td className="px-3 py-3.5">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "border-red-500/20 bg-red-500/10 text-red-400"
                                : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
  <button
  disabled={isLoading || isCurrentAdmin}
  onClick={() => handleToggleRole(u)}
  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
    u.role === "admin"
      ? "border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-700"
      : "bg-orange-500 text-white hover:bg-orange-400"
  } disabled:opacity-40`}
>
  {u.role === "admin" ? "Revoke Admin" : "Make Admin"}
</button>
                          <button
                            disabled={isLoading || isCurrentAdmin}
                            onClick={() => handleDeleteUser(u.id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Grid Layout for Inventory & Orders */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.8fr)]">
        {/* Inventory Section */}
        <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 sm:text-xs">
                Inventory
              </p>
              <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">
                Product Management
              </h2>
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search catalog..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-600 focus:border-orange-400 sm:w-56 sm:py-2.5 sm:text-sm"
            />
          </div>

          <div>
            {/* Mobile View: Product List */}
            <div className="divide-y divide-white/5 sm:hidden">
              {filteredProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg bg-slate-700 object-cover"
                    />
                    <div>
                      <p className="font-bold text-white text-xs max-w-[150px] truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-400">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditProduct(product)}
                      className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-lg border border-red-400/20 px-2.5 py-1 text-[10px] font-bold text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Product Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-3 py-3">Brand</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Price</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} className="text-sm transition hover:bg-white/[0.03]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-11 w-11 rounded-lg bg-slate-700 object-cover"
                          />
                          <div>
                            <p className="max-w-[230px] truncate font-bold text-white">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-500">{product.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-300">{product.company}</td>
                      <td className="px-3 py-3 text-xs text-slate-400">{product.category}</td>
                      <td className="px-3 py-3 font-bold text-white">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`whitespace-nowrap rounded-full border px-2 py-1 text-xs font-medium ${
                            index % 7 === 0
                              ? "border-amber-400/20 bg-amber-500/15 text-amber-300"
                              : "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {index % 7 === 0 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold text-slate-300 hover:border-orange-400 hover:text-orange-300"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Fulfillment Section */}
        <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-800/80 shadow-xl shadow-black/10">
          <div className="border-b border-white/10 p-4 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 sm:text-xs">
              Fulfillment
            </p>
            <h2 className="mt-0.5 text-lg font-black text-white sm:text-xl">Recent Orders</h2>
          </div>
          <div>
            {/* Mobile View: Orders Card List */}
            <div className="divide-y divide-white/5 sm:hidden">
              {orders.slice(0, 8).map((order) => {
                const status = formatStatus(order.status);
                return (
                  <div key={order.id} className="p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">#{order.id.slice(0, 8)}</p>
                      <p className="text-slate-400 text-[10px]">
                        {order.customer_email || order.email || "Customer"}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-white">${Number(order.total || 0).toFixed(2)}</p>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[9px] font-bold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Orders Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] text-left">
                <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 12).map((order) => {
                    const status = formatStatus(order.status);
                    return (
                      <tr key={order.id} className="text-xs hover:bg-white/[0.03]">
                        <td className="px-5 py-4 font-bold text-white">
                          #{order.id.slice(0, 8)}
                        </td>
                        <td className="max-w-[170px] truncate px-3 py-4 text-slate-400">
                          {order.customer_email || order.email || "Customer"}
                        </td>
                        <td className="px-3 py-4 text-slate-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-3 py-4 font-bold text-white">
                          ${Number(order.total || 0).toFixed(2)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2 py-1 text-[10px] font-bold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={saveProduct}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-xl text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-xs font-bold text-slate-300">
                Product name
                <input
                  required
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({ ...productForm, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400"
                />
              </label>

              <label className="block text-xs font-bold text-slate-300">
                Brand / Company
                <input
                  required
                  value={productForm.company}
                  onChange={(event) =>
                    setProductForm({ ...productForm, company: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400"
                />
              </label>

              <label className="block text-xs font-bold text-slate-300">
                Image URL / Path
                <input
                  value={productForm.image_url}
                  onChange={(event) =>
                    setProductForm({ ...productForm, image_url: event.target.value })
                  }
                  placeholder="/images/products/1/1.jpg"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-orange-400"
                />
              </label>

              <label className="block text-xs font-bold text-slate-300">
                Category
                <input
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({ ...productForm, category: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400"
                />
              </label>

              <label className="block text-xs font-bold text-slate-300">
                Price
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({ ...productForm, price: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-400"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}