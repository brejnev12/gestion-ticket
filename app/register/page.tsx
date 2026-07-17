"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/authentification/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      router.push("/login");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-96 space-y-4 rounded border p-6"
      >
        <h1 className="text-2xl font-bold">Inscription</h1>
        <input
          className="w-full border p-2"
          placeholder="Nom"
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Email"
          type="email"
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Mot de passe"
          type="password"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />
        <button className="w-full rounded bg-black p-2 text-white">
          Créer un compte
        </button>
      </form>
    </main>
  );
}
