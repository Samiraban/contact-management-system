import { ChevronLeft, ChevronRight } from "lucide-react";
export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = total ? (page - 1) * limit + 1 : 0;
  const end = Math.min(page * limit, total);
  return <div className="pagination"><span>Showing <b>{start}–{end}</b> of <b>{total}</b> contacts</span><div className="page-controls"><button disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={17}/></button><span>Page <b>{page}</b> of {totalPages}</span><button disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={17}/></button></div></div>;
}
