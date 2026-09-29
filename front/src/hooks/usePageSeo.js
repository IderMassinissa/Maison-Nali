import { useEffect } from "react";

export default function usePageSeo(title, description) {
  useEffect(() => {
    document.title = title;

    let balise = document.querySelector('meta[name="description"]');
    if (!balise) {
      balise = document.createElement("meta");
      balise.setAttribute("name", "description");
      document.head.appendChild(balise);
    }
    balise.setAttribute("content", description);
  }, [title, description]);
}
