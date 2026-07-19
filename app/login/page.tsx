"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch("/api/authentification/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/administration");
    } else {
      setMessage(data.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 space-y-4 rounded border p-6"
      >
        <h1 className="text-2xl font-bold">Connexion</h1>

        <input
          className="w-full border p-2"
          type="email"
          placeholder="Email"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          className="w-full border p-2"
          type="password"
          placeholder="Mot de passe"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button className="w-full rounded bg-black p-2 text-white">
          Se connecter
        </button>

        {message && <p className="text-red-600">{message}</p>}
      </form>
    </main>
  );
}
