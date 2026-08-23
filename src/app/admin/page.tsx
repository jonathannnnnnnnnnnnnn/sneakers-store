// src/app/admin/page.tsx
export default function AdminPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-orange-500">
        SOLE VAULT Admin Dashboard 🔐
      </h1>
      <h1 className="p-8 text-2xl font-black">Welcome to the Vault Admin! 🚀</h1>
      <p className="text-gray-400 mt-2">
        If you can see this page, your role-based security guard is working perfectly!
      </p>
    </div>
  );
}