export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold">QueuePlus Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="mb-3 w-full rounded-lg border border-slate-300 p-2"
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-4 w-full rounded-lg border border-slate-300 p-2"
        />

        <button className="w-full rounded-lg bg-blue-600 p-2 text-white">
          Login
        </button>
      </div>
    </div>
  );
}