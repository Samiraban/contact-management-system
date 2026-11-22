import { Edit3, Globe, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ContactTable({
  contacts,
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
        <div className="empty-icon"><UserRound size={25} /></div>
        <h3>No contacts found</h3>
        <p>
          {favouriteMode
            ? "Contacts marked as favourite will appear here."
            : "Add your first contact to get started."}
        </p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="contact-table">
        <thead>
          <tr>
            <th className="sn-col">SN</th>
            <th>CONTACT NAME</th>
            <th>MOBILE</th>
            <th>EMAIL ADDRESS</th>
            <th>ADDRESS</th>
            {!readOnly && <th className="action-col">ACTIONS</th>}
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact, index) => (
            <tr key={contact._id} className="row-anim" style={{ "--i": index }}>
              <td className="muted-cell">{startIndex + index + 1}</td>

              <td>
                <div className="contact-person">
                  <div className="contact-avatar">
                    {contact.contactName?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="name-row">
                      <strong>{contact.contactName}</strong>
                      {contact.websiteUrl && (
                        <a
                          className="site-link"
                          href={contact.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Visit ${contact.websiteUrl}`}
                        >
                          <Globe size={13} />
                        </a>
                      )}
                    </div>
                    <span>{contact.companyName}</span>
                  </div>
                </div>
              </td>

              <td className="nowrap">{contact.mobileNumber}</td>

              <td>
                <a className="email-link" href={`mailto:${contact.emailAddress}`}>
                  {contact.emailAddress}
                </a>
              </td>

              <td className="address-cell" title={contact.fullAddress}>
                {contact.fullAddress}
              </td>

              {!readOnly && (
                <td>
                  {favouriteMode ? (
                    <label className="unfav-check">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => onFavourite(contact, false)}
                      />
                      <span>Mark as unfavourite</span>
                    </label>
                  ) : (
                    <div className="action-buttons">
                      <button
                        className="action-icon"
                        title="Edit contact"
                        onClick={() => navigate(`/contacts/${contact._id}/edit`)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="action-icon delete-action"
                        title="Delete contact"
                        onClick={() => onDelete(contact)}
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