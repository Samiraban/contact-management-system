import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Pagination from "../components/Pagination";
import Toast from "../components/Toast";

export default function Contacts() {
  const [contacts,setContacts]=useState([]), [pagination,setPagination]=useState(null);
  const [page,setPage]=useState(1), [search,setSearch]=useState(""), [query,setQuery]=useState("");
  const [loading,setLoading]=useState(true), [toast,setToast]=useState(null);
  const load=async(p=page,q=query)=>{setLoading(true);try{const {data}=await api.get("/contacts",{params:{page:p,limit:8,search:q}});setContacts(data.contacts);setPagination(data.pagination);}catch(e){setToast({type:"error",message:errorMessage(e)});}finally{setLoading(false);}};
  useEffect(()=>{load(page,query);},[page,query]);
  const searchSubmit=e=>{e.preventDefault();setPage(1);setQuery(search.trim());};
  const remove=async contact=>{if(!window.confirm(`Delete ${contact.contactName}? This action cannot be undone.`))return;try{const {data}=await api.delete(`/contacts/${contact._id}`);setToast({message:data.message});if(contacts.length===1&&page>1)setPage(page-1);else load(page,query);}catch(e){setToast({type:"error",message:errorMessage(e)});}};
  return <><Toast toast={toast} onClose={()=>setToast(null)}/><div className="page-toolbar"><div><div className="eyebrow">DIRECTORY</div><h2>All contacts</h2><p>Manage and organise every contact in your network.</p></div><Link to="/contacts/new" className="primary-button"><Plus size={18}/> Add contact</Link></div><section className="content-card"><div className="table-toolbar"><div className="table-title"><h3>Contact directory</h3><span className="count-pill">{pagination?.total ?? 0} total</span></div><form className="search-box" onSubmit={searchSubmit}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts..."/>{search&&<button type="button" onClick={()=>{setSearch("");setPage(1);setQuery("");}}><X size={15}/></button>}<button type="submit" className="search-submit">Search</button></form></div>{loading?<div className="loading-state">Loading contacts...</div>:<ContactTable contacts={contacts} onDelete={remove} startIndex={((pagination?.page||1)-1)*(pagination?.limit||8)}/>}<Pagination pagination={pagination} onPage={setPage}/></section></>;
}
