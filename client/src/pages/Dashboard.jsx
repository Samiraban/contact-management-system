
import { useEffect, useState } from "react";
import {
  Users,
  Heart,
  UserRound,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Toast from "../components/Toast";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    favourite: 0,
    unfavourite: 0
  });

  const [recent, setRecent] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [statsResponse, contactsResponse] = await Promise.all([
        api.get("/contacts/stats"),
        api.get("/contacts?limit=5&page=1")
      ]);

      setStats(statsResponse.data);
      setRecent(contactsResponse.data.contacts || []);
    } catch (error) {
      setToast({
        type: "error",
        message: errorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    {
      label: "Total contacts",
      value: stats.total,
      icon: Users,
      tone: "blue",
      note: "Contacts in your directory"
    },
    {
      label: "Favourites",
      value: stats.favourite,
      icon: Heart,
      tone: "rose",
      note: "Contacts marked as favourite"
    },
    {
      label: "Other contacts",
      value: stats.unfavourite,
      icon: UserRound,
      tone: "amber",
      note: "Contacts not marked as favourite"
    }
  ];

  return (
    <>
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div className="welcome-row">
        <div>
          <div className="eyebrow">OVERVIEW</div>

          <h2>Dashboard</h2>

          <p>
            A summary of your contact directory.
          </p>
        </div>

        <Link
          to="/contacts/new"
          className="primary-button"
        >
          <Plus size={17} />
          Add contact
        </Link>
      </div>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="stat-card" key={card.label}>
              <div className="stat-top">
                <span>{card.label}</span>

                <div className={`stat-icon ${card.tone}`}>
                  <Icon size={19} />
                </div>
              </div>

              <div className="stat-value">
                {loading
                  ? "—"
                  : Number(card.value || 0).toLocaleString()}
              </div>

              <div className="stat-note">
                {card.note}
              </div>
            </div>
          );
        })}
      </div>

      <section className="content-card recent-card">

        <div className="section-heading">
          <div>
            <h3>Recently added</h3>

            <p>
              The latest contacts saved in your directory.
            </p>
          </div>

          <Link
            to="/contacts"
            className="text-link"
          >
            All contacts
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading contacts...
          </div>
        ) : (
          <ContactTable
            contacts={recent}
            readOnly
          />
        )}

      </section>
    </>
  );
}
