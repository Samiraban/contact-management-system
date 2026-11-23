
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Pagination from "../components/Pagination";
import Toast from "../components/Toast";

const PAGE_SIZE = 2;

export default function Favourites() {
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
          search: currentQuery,
          favourite: true
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

  const toggleFavourite = async (contact, value) => {
    try {
      const { data } = await api.patch(
        `/contacts/${contact._id}/favourite`,
        { isFavourite: value }
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

  return (
    <>
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div className="page-toolbar">
        <div>
          <div className="eyebrow">DIRECTORY</div>
          <h2>Favourites</h2>
          <p>
            Contacts you've marked as favourites.
          </p>
        </div>
      </div>

      <section className="content-card">
        <div className="table-toolbar">
          <div className="table-title">
            <h3>Favourite contacts</h3>
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
              placeholder="Search favourite contacts"
              aria-label="Search favourite contacts"
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
            Loading favourite contacts...
          </div>
        ) : (
          <ContactTable
            contacts={contacts}
            favouriteMode
            onFavourite={toggleFavourite}
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
