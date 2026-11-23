
import { Edit3, Globe, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactTable({
  contacts = [],
  onDelete,
  onFavourite,
  favouriteMode = false,
  readOnly = false,
  startIndex = 0
}) {
  const navigate = useNavigate();

  if (!contacts.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <UserRound size={23} />
        </div>

        <h3>
          {favouriteMode
            ? "No favourite contacts"
            : "No contacts found"}
        </h3>

        <p>
          {favouriteMode
            ? "Contacts you mark as favourites will appear here."
            : "There are no contacts to display."}
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="contact-table">

        <thead>
          <tr>
            <th className="sn-col">No.</th>
            <th>Contact</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Address</th>

            {!readOnly && (
              <th className="action-col">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact, index) => (
            <tr key={contact._id}>

              <td className="muted-cell">
                {startIndex + index + 1}
              </td>

              <td>
                <div className="contact-person">

                  <div className="contact-avatar">
                    {(contact.contactName || "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div className="contact-person-details">
                    <div className="name-row">
                      <strong>
                        {contact.contactName || "Unnamed contact"}
                      </strong>

                      {contact.websiteUrl && (
                        <a
                          className="site-link"
                          href={contact.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Visit website"
                          aria-label={`Visit ${contact.contactName}'s website`}
                        >
                          <Globe size={14} />
                        </a>
                      )}
                    </div>

                    <span>
                      {contact.companyName || "—"}
                    </span>
                  </div>

                </div>
              </td>

              <td className="nowrap">
                {contact.mobileNumber || "—"}
              </td>

              <td>
                {contact.emailAddress ? (
                  <a
                    className="email-link"
                    href={`mailto:${contact.emailAddress}`}
                  >
                    {contact.emailAddress}
                  </a>
                ) : (
                  "—"
                )}
              </td>

              <td
                className="address-cell"
                title={contact.fullAddress || ""}
              >
                {contact.fullAddress || "—"}
              </td>

              {!readOnly && (
                <td>
                  {favouriteMode ? (
                    <label className="unfav-check">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() =>
                          onFavourite?.(contact, false)
                        }
                        aria-label={`Remove ${contact.contactName} from favourites`}
                      />

                      <span>Remove favourite</span>
                    </label>
                  ) : (
                    <div className="action-buttons">

                      <button
                        type="button"
                        className="action-icon"
                        title="Edit contact"
                        aria-label={`Edit ${contact.contactName}`}
                        onClick={() =>
                          navigate(`/contacts/${contact._id}/edit`)
                        }
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="action-icon delete-action"
                        title="Delete contact"
                        aria-label={`Delete ${contact.contactName}`}
                        onClick={() => onDelete?.(contact)}
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  )}
                </td>
              )}

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
