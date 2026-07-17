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

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/tickets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erreur de récupération des tickets");
        }

        const data = await response.json();

        setTickets(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <main className="min-h-screen p-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {user && <p className="mt-2">Bonjour {user.name}</p>}
        </div>

        <button
          onClick={logout}
          className="rounded bg-red-600 px-4 py-2 text-white"
        >
          Déconnexion
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Mes tickets</h2>

        {loading ? (
          <p className="mt-4">Chargement...</p>
        ) : tickets.length === 0 ? (
          <p className="mt-4">Aucun ticket trouvé</p>
        ) : (
          <div className="mt-5 space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded border p-5">
                <h3 className="font-bold">{ticket.title}</h3>
                <p className="mt-2">{ticket.description}</p>
                <p className="mt-2 text-sm">Statut : {ticket.status}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
