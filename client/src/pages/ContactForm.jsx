import { useEffect, useState } from "react";
import { ArrowLeft, Check, Globe, Heart, Mail, MapPin, Phone, Save, User, Building2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorMessage } from "../api";
import Toast from "../components/Toast";
// ---- phone number rules (built in, no extra file needed) ----
// Country-aware phone number checks.
// - No "+" at the start  -> treated as a NEPAL number (exactly 10 digits, starts with 96/97/98)
// - Starts with "+" or "00" -> international, checked against the country's digit rules
// - Countries not in the list below are accepted if they are 8-15 digits in total (E.164)

const COUNTRIES = [
  { code: "977", name: "Nepal",          lengths: [10], pattern: /^9[6-8]\d{8}$/ },
  { code: "91",  name: "India",          lengths: [10], pattern: /^[6-9]\d{9}$/ },
  { code: "1",   name: "USA / Canada",   lengths: [10], pattern: /^[2-9]\d{2}[2-9]\d{6}$/ },
  { code: "44",  name: "United Kingdom", lengths: [9, 10] },
  { code: "61",  name: "Australia",      lengths: [9] },
  { code: "971", name: "UAE",            lengths: [9] },
  { code: "974", name: "Qatar",          lengths: [8] },
  { code: "966", name: "Saudi Arabia",   lengths: [9] },
  { code: "965", name: "Kuwait",         lengths: [8] },
  { code: "968", name: "Oman",           lengths: [8] },
  { code: "973", name: "Bahrain",        lengths: [8] },
  { code: "972", name: "Israel",         lengths: [9] },
  { code: "60",  name: "Malaysia",       lengths: [9, 10] },
  { code: "65",  name: "Singapore",      lengths: [8] },
  { code: "880", name: "Bangladesh",     lengths: [10] },
  { code: "92",  name: "Pakistan",       lengths: [10] },
  { code: "94",  name: "Sri Lanka",      lengths: [9] },
  { code: "975", name: "Bhutan",         lengths: [8] },
  { code: "86",  name: "China",          lengths: [11] },
  { code: "852", name: "Hong Kong",      lengths: [8] },
  { code: "81",  name: "Japan",          lengths: [10] },
  { code: "82",  name: "South Korea",    lengths: [9, 10] },
  { code: "66",  name: "Thailand",       lengths: [9] },
  { code: "63",  name: "Philippines",    lengths: [10] },
  { code: "62",  name: "Indonesia",      lengths: [9, 10, 11, 12] },
  { code: "49",  name: "Germany",        lengths: [10, 11] },
  { code: "33",  name: "France",         lengths: [9] },
  { code: "90",  name: "Turkey",         lengths: [10] },
  { code: "7",   name: "Russia",         lengths: [10] },
  { code: "27",  name: "South Africa",   lengths: [9] },
  { code: "55",  name: "Brazil",         lengths: [10, 11] }
];

const BY_CODE = new Map(COUNTRIES.map(c => [c.code, c]));

function cleanPhone(raw) {
  return String(raw ?? "").trim().replace(/[\s().-]/g, "");
}

const fail = (message) => ({ ok: false, message });
const lengthText = (lengths) =>
  lengths.length === 1 ? `exactly ${lengths[0]}` : `${lengths[0]} to ${lengths[lengths.length - 1]}`;

/** Returns { ok, message?, e164? } */
function checkPhone(raw) {
  let value = cleanPhone(raw);
  if (!value) return fail("Mobile number is required.");
  if (value.startsWith("00")) value = "+" + value.slice(2);
  if (!/^\+?\d+$/.test(value)) {
    return fail("Use digits only. For another country, start with + and the country code.");
  }

  // ---- No country code: Nepal ----
  if (!value.startsWith("+")) {
    if (value.length !== 10) {
      return fail("Nepal numbers must be exactly 10 digits (e.g. 98XXXXXXXX). For another country, start with + and the country code.");
    }
    if (!/^9[6-8]/.test(value)) return fail("Nepal mobile numbers start with 96, 97 or 98.");
    return { ok: true, e164: "+977" + value };
  }

  // ---- International ----
  const digits = value.slice(1);
  let country = null;
  for (const size of [3, 2, 1]) {
    const found = BY_CODE.get(digits.slice(0, size));
    if (found) { country = found; break; }
  }

  if (!country) {
    if (digits.length < 8 || digits.length > 15) {
      return fail("Enter a valid international number (8 to 15 digits including the country code).");
    }
    return { ok: true, e164: "+" + digits };
  }

  const national = digits.slice(country.code.length);
  if (!country.lengths.includes(national.length)) {
    return fail(`${country.name} (+${country.code}) numbers must have ${lengthText(country.lengths)} digits after the country code.`);
  }
  if (country.pattern && !country.pattern.test(national)) {
    return fail(`That is not a valid ${country.name} (+${country.code}) mobile number.`);
  }
  return { ok: true, e164: "+" + digits };
}
// ---- end phone rules ----


const empty={contactName:"",companyName:"",mobileNumber:"",emailAddress:"",fullAddress:"",websiteUrl:"",isFavourite:false};
const labels={contactName:"Contact name",companyName:"Company name",mobileNumber:"Mobile number",emailAddress:"Email address",fullAddress:"Full address",websiteUrl:"Website URL"};
function validate(form){
  const errors={};
  Object.entries(labels).forEach(([key,label])=>{if(!String(form[key]||"").trim())errors[key]=`${label} is required.`;});
  if(form.emailAddress&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim()))errors.emailAddress="Enter a valid email address.";
  if(form.mobileNumber){const phone=checkPhone(form.mobileNumber);if(!phone.ok)errors.mobileNumber=phone.message;}
  if(form.websiteUrl){try{const u=new URL(form.websiteUrl);if(!["http:","https:"].includes(u.protocol))throw Error();}catch{errors.websiteUrl="Enter a valid URL starting with https:// or http://.";}}
  if(form.contactName.length>100)errors.contactName="Maximum 100 characters.";
  if(form.companyName.length>120)errors.companyName="Maximum 120 characters.";
  if(form.fullAddress.length>500)errors.fullAddress="Maximum 500 characters.";
  return errors;
}
export default function ContactForm(){
  const {id}=useParams(),navigate=useNavigate(),editing=Boolean(id);
  const [form,setForm]=useState(empty),[errors,setErrors]=useState({}),[loading,setLoading]=useState(editing),[saving,setSaving]=useState(false),[toast,setToast]=useState(null);
  useEffect(()=>{if(!editing)return;api.get(`/contacts/${id}`).then(({data})=>{const c=data.contact;setForm({contactName:c.contactName,companyName:c.companyName,mobileNumber:c.mobileNumber,emailAddress:c.emailAddress,fullAddress:c.fullAddress,websiteUrl:c.websiteUrl,isFavourite:c.isFavourite});}).catch(e=>setToast({type:"error",message:errorMessage(e)})).finally(()=>setLoading(false));},[id,editing]);
  const change=e=>{const {name,type,checked}=e.target;const value=name==="mobileNumber"?e.target.value.replace(/[^\d+\s()-]/g,""):e.target.value;setForm(prev=>({...prev,[name]:type==="checkbox"?checked:value}));setErrors(prev=>({...prev,[name]:""}));};
  const submit=async e=>{e.preventDefault();const next=validate(form);setErrors(next);if(Object.keys(next).length)return;setSaving(true);try{const {data}=editing?await api.put(`/contacts/${id}`,form):await api.post("/contacts",form);setToast({message:data.message});setTimeout(()=>navigate("/contacts"),650);}catch(err){const responseErrors=err.response?.data?.errors||{};if(err.response?.status===409){const m=err.response.data.message||"";responseErrors[m.toLowerCase().includes("mobile")?"mobileNumber":"emailAddress"]=m;}setErrors(responseErrors);setToast({type:"error",message:errorMessage(err)});}finally{setSaving(false);}};
  const fields=[
    {name:"contactName",label:"Contact name",placeholder:"e.g. Alex Morgan",icon:User,required:true},
    {name:"companyName",label:"Company name",placeholder:"e.g. Acme Corporation",icon:Building2,required:true},
    {name:"mobileNumber",label:"Mobile number",placeholder:"+977 9800000000",icon:Phone,required:true},
    {name:"emailAddress",label:"Email address",placeholder:"alex@company.com",icon:Mail,required:true,type:"email"},
    {name:"websiteUrl",label:"Website URL",placeholder:"https://example.com",icon:Globe,required:true},
    {name:"fullAddress",label:"Full address",placeholder:"Street, city, state, country",icon:MapPin,required:true,wide:true}
  ];
  if(loading)return <div className="loading-state">Loading contact details...</div>;
  return <><Toast toast={toast} onClose={()=>setToast(null)}/><div className="page-toolbar form-page-toolbar"><div><div className="eyebrow">CONTACT DIRECTORY</div><h2>{editing?"Edit contact":"Add a new contact"}</h2><p>{editing?"Update the information for this contact.":"Enter the details below to add someone to your directory."}</p></div><Link to="/contacts" className="secondary-button"><ArrowLeft size={17}/> Back to contacts</Link></div><form className="content-card contact-form-card" onSubmit={submit} noValidate><div className="form-section-heading"><div className="form-section-icon"><User size={19}/></div><div><h3>Contact information</h3><p>Fields marked with <span className="required-star">*</span> are required.</p></div></div><div className="form-grid">{fields.map(field=><div className={`field-group ${field.wide?"field-wide":""}`} key={field.name}><label htmlFor={field.name}>{field.label} <span className="required-star">*</span></label><div className={`form-input-wrap ${errors[field.name]?"has-error":""}`}><field.icon size={17}/>{field.wide?<textarea id={field.name} name={field.name} value={form[field.name]} onChange={change} placeholder={field.placeholder} rows="3"/>:<input id={field.name} name={field.name} type={field.type||"text"} value={form[field.name]} onChange={change} placeholder={field.placeholder} maxLength={field.name==="contactName"?100:field.name==="companyName"?120:field.name==="mobileNumber"?20:undefined} inputMode={field.name==="mobileNumber"?"tel":undefined}/>}</div>{errors[field.name]&&<span className="field-error">{errors[field.name]}</span>}{field.name==="mobileNumber"&&!errors.mobileNumber&&<span className="field-hint">Nepal: 10 digits (98XXXXXXXX). Other countries: start with + and the country code.</span>}</div>)}</div><div className="favourite-setting"><div className="favourite-setting-icon"><Heart size={19}/></div><div className="favourite-setting-copy"><strong>Favourite contact</strong><span>Mark this person as a priority contact.</span></div><label className="switch"><input type="checkbox" name="isFavourite" checked={form.isFavourite} onChange={change}/><span className="switch-slider"/></label></div><div className="form-actions"><Link to="/contacts" className="secondary-button">Cancel</Link><button type="submit" className="primary-button" disabled={saving}>{saving?"Saving...":<>{editing?"Update contact":"Save contact"} <Check size={17}/></>}</button></div></form></>;
}