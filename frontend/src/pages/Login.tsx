import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/screenshots");
    } catch (err: any) {
      console.log(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <h1 className="text-2xl font-medium mb-2">Snapterra</h1>
          <p>Sign in to manage your screenshots.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider px-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-800 rounded-lg text-black"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider px-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-zinc-800 rounded-lg text-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-black text-white rounded-lg font-medium hover:cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
