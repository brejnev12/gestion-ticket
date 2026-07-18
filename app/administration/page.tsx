"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdministrationPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token) {
        router.push("/login");
        return;
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      try {
        const response = await fetch("/api/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setTickets(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function saveTicket(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Tous les champs sont obligatoires");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const url = editingId ? `/api/tickets/${editingId}` : "/api/tickets";
    const method = editingId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Erreur");
        return;
      }

      if (editingId) {
        setTickets((previous) =>
          previous.map((ticket) => (ticket.id === editingId ? data : ticket)),
        );
        setMessage("Ticket modifié avec succès");
      } else {
        setTickets((previous) => [...previous, data]);
        setMessage("Ticket créé avec succès");
      }

      setForm({
        title: "",
        description: "",
      });
      setEditingId(null);
    } catch (error) {
      console.error(error);
    }
  }

  function editTicket(ticket: Ticket) {
    setEditingId(ticket.id);
    setForm({
      title: ticket.title,
      description: ticket.description,
    });
    setMessage("");
  }
  async function deleteTicket(id: number) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const confirmDelete = window.confirm("Supprimer ce ticket ?");
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `/api/tickets/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setTickets((previous) => previous.filter((ticket) => ticket.id !== id));
        setMessage("Ticket supprimé");
      }
    } catch (error) {
      console.error(error);
    }
  }
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <header className="mb-10 flex justify-between rounded-xl bg-white p-6 shadow">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && <p className="mt-2 text-gray-600">Bonjour {user.name}</p>}
        </div>
        <button
          onClick={logout}
          className="rounded bg-red-600 px-5 py-2 text-white"
        >
          Déconnexion
        </button>
      </header>
      <div className="grid items-start gap-8 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-bold">
            {editingId ? "Modifier ticket" : "Créer ticket"}
          </h2>
          <form onSubmit={saveTicket} className="space-y-4">
            <input
              className="w-full rounded border p-3"
              placeholder="Titre"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />
            <textarea
              className="h-32 w-full rounded border p-3"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
            <button className="w-full rounded bg-blue-600 py-3 text-white">
              {editingId ? "Modifier" : "Ajouter"}
            </button>
          </form>
        </section>
        <section className="rounded-xl bg-white p-6 shadow lg:col-span-2">
          <h2 className="mb-5 text-center text-xl font-bold">Mes tickets</h2>
          {message && (
            <div className="mb-5 rounded-lg bg-green-100 p-3 text-center font-medium text-green-700">
              {message}
            </div>
          )}
          {loading ? (
            <p>Chargement...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500">Aucun ticket trouvé</p>
          ) : (
            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-2">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="rounded border p-5">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{ticket.title}</h3>
                    <span className="rounded bg-green-100 px-3 py-1 text-sm">
                      {ticket.status}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-600">{ticket.description}</p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => editTicket(ticket)}
                      className="rounded bg-yellow-500 px-4 py-2 text-white"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
