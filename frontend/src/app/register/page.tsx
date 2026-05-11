"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Dumbbell, Loader2, CheckCircle } from "lucide-react";

interface FormData {
  gymName: string;
  ownerName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]         = useState<FormData>({ gymName: "", ownerName: "", email: "", password: "", phone: "", address: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090"}/api/v1/auth/register-gym`,
        form
      );
      setSuccess(res.data.data?.message ?? "Registration successful!");
      setTimeout(() => router.push("/"), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Gym</h1>
          <p className="mt-2 text-gray-500">Get started with a 30-day free trial</p>
        </div>

        <div className="card space-y-5">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
              <p className="text-lg font-semibold text-gray-900">{success}</p>
              <p className="text-sm text-gray-500">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Gym Name *</label>
                  <input name="gymName" required value={form.gymName} onChange={change}
                    className="input" placeholder="PowerHouse Gym" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Owner Name *</label>
                  <input name="ownerName" required value={form.ownerName} onChange={change}
                    className="input" placeholder="Kamal Perera" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address *</label>
                <input name="email" type="email" required value={form.email} onChange={change}
                  className="input" placeholder="kamal@powerhouse.lk" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password *</label>
                <input name="password" type="password" required value={form.password} onChange={change}
                  className="input" placeholder="Minimum 8 characters" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                  <input name="phone" value={form.phone} onChange={change}
                    className="input" placeholder="+94 71 234 5678" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Address</label>
                  <input name="address" value={form.address} onChange={change}
                    className="input" placeholder="123 Main St, Colombo" />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering…
                  </span>
                ) : "Register Gym"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/" className="text-violet-600 hover:text-violet-500 underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
