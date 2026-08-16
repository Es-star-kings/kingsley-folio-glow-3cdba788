const KEY = "kx_visitor_id";

export const getVisitorId = () => {
  if (typeof window === "undefined") return "server-session-id";
  let id = localStorage.getItem(KEY);
  if (!id || id.length < 8) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
};
