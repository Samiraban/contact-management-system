import { useEffect, useState } from "react";
import { Heart, Search, X } from "lucide-react";
import api, { errorMessage } from "../api";
import ContactTable from "../components/ContactTable";
import Pagination from "../components/Pagination";
import Toast from "../components/Toast";

export default function Favourites() {
  const [contacts,setContacts]=useState([]),[pagination,setPagination]=useState(null),[page,setPage]=useState(1);
  const [search,setSearch]=useState(""),[query,setQuery]=useState(""),[loading,setLoading]=useState(true),[toast,setToast]=useState(null);
  const load=async(p=page,q=query)=>{setLoading(true);try{const {data}=await api.get("/contacts",{params:{page:p,limit:8,search:q,favourite:true}});setContacts(data.contacts);setPagination(data.pagination);}catch(e){setToast({type:"error",message:errorMessage(e)});}finally{setLoading(false);}};
  useEffect(()=>{load(page,query);},[page,query]);
  const toggle=async(contact,value)=>{try{const {data}=await api.patch(`/contacts/${contact._id}/favourite`,{isFavourite:value});setToast({message:data.message});if(contacts.length===1&&page>1)setPage(page-1);else load(page,query);}catch(e){setToast({type:"error",message:errorMessage(e)});}};
  const submit=e=>{e.preventDefault();setPage(1);setQuery(search.trim());};
  return <><Toast toast={toast} onClose={()=>setToast(null)}/><div className="page-toolbar"><div><div className="eyebrow">YOUR PRIORITY NETWORK</div><h2>Favourite contacts <Heart size={22} className="inline-heart" fill="currentColor"/></h2><p>Quickly access the people who matter most.</p></div></div><section className="content-card"><div className="table-toolbar"><div className="table-title"><h3>Favourite directory</h3><span className="count-pill">{pagination?.total ?? 0} favourites</span></div><form className="search-box" onSubmit={submit}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search favourites..."/>{search&&<button type="button" onClick={()=>{setSearch("");setPage(1);setQuery("");}}><X size={15}/></button>}<button type="submit" className="search-submit">Search</button></form></div>{loading?<div className="loading-state">Loading favourites...</div>:<ContactTable contacts={contacts} favouriteMode onFavourite={toggle} startIndex={((pagination?.page||1)-1)*(pagination?.limit||8)}/>}<Pagination pagination={pagination} onPage={setPage}/></section></>;
}
