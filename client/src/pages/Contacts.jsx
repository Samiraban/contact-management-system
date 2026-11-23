
import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Pagination from "../components/Pagination";
import Toast from "../components/Toast";

const PAGE_SIZE = 2;

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const load = async (currentPage = page, currentQuery = query) => {
    setLoading(true);

    try {
      const { data } = await api.get("/contacts", {
        params: {
          page: currentPage,
          limit: PAGE_SIZE,
          search: currentQuery
        }
      });

      setContacts(data.contacts || []);
      setPagination(data.pagination);
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
    load(page, query);
  }, [page, query]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(search.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setQuery("");
    setPage(1);
  };

  const removeContact = async (contact) => {
    const confirmed = window.confirm(
      `Delete ${contact.contactName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const { data } = await api.delete(
        `/contacts/${contact._id}`
      );

      setToast({ message: data.message });

      if (contacts.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        load(page, query);
      }
    } catch (error) {
      setToast({
        type: "error",
        message: errorMessage(error)
      });
    }
  };

  return (
    <>
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div className="page-toolbar">
        <div>
          <div className="eyebrow">DIRECTORY</div>
          <h2>Contacts</h2>
          <p>
            View and manage the contact information saved in your directory.
          </p>
        </div>

        <Link to="/contacts/new" className="primary-button">
          <Plus size={18} />
          Add contact
        </Link>
      </div>

      <section className="content-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h3>All contacts</h3>
            <span className="count-pill">
              {pagination?.total ?? 0} contacts
            </span>
          </div>

          <form className="search-box" onSubmit={handleSearch}>
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, company or email"
              aria-label="Search contacts"
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}

            <button
              type="submit"
              className="search-submit"
              disabled={loading}
            >
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading contacts...
          </div>
        ) : (
          <ContactTable
            contacts={contacts}
            onDelete={removeContact}
            startIndex={(page - 1) * PAGE_SIZE}
          />
        )}

        <Pagination
          pagination={pagination}
          onPage={setPage}
        />
      </section>
    </>
  );
}
