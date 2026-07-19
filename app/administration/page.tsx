"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  status: string;
};

export default function AdministrationPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchTickets() {
      try {
        const response = await fetch("/api/tickets");

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des tickets");
        }

        const data = await response.json();

        if (!ignore) {
          setTickets(data);
        }
      } catch (err) {
        if (!ignore) {
          setError("Impossible de charger les tickets");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTickets();

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Chargement des tickets...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-bold">Administration des tickets</h1>

        <p className="text-gray-600 mt-2">
          Gestion et suivi des demandes utilisateurs.
        </p>
      </section>

      <section className="bg-white rounded-lg shadow border">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">ID</th>

              <th className="text-left p-3">Titre</th>

              <th className="text-left p-3">Statut</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Aucun ticket disponible
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t">
                  <td className="p-3">{ticket.id}</td>

                  <td className="p-3">{ticket.title}</td>

                  <td className="p-3">{ticket.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
