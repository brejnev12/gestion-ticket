"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setMessage("");
    setLoading(true);


    try {

      const response = await fetch(
        "/api/authentification/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );


      const data = await response.json();


      console.log("Réponse register :", data);


      if (!response.ok) {

        setMessage(
          data.message || "Erreur lors de l'inscription"
        );

        return;
      }


      router.push("/login");


    } catch (error) {

      console.error(error);

      setMessage(
        "Erreur de connexion au serveur"
      );

    } finally {

      setLoading(false);

    }

  }


  return (

    <main className="flex min-h-screen items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="w-96 space-y-4 rounded-lg bg-white p-6 shadow"
      >

        <h1 className="text-center text-2xl font-bold">
          Inscription
        </h1>


        <input
          type="text"
          placeholder="Nom"
          className="w-full rounded border p-2"
          value={form.nom}
          onChange={(e) =>
            setForm({
              ...form,
              nom: e.target.value,
            })
          }
        />


        <input
          type="email"
          placeholder="Email"
          className="w-full rounded border p-2"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />


        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full rounded border p-2"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />


        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black p-2 text-white disabled:opacity-50"
        >

          {
            loading
              ? "Création..."
              : "Créer le compte"
          }

        </button>


        {
          message && (
            <p className="text-center text-red-600">
              {message}
            </p>
          )
        }


      </form>

    </main>

  );

}