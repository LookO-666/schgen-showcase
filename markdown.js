/* Local Markdown presentation. Saved model output and source files stay unchanged. */
"use strict";
(() => {
  const rendered = new WeakMap();
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
  let parser;

  function render(element, value) {
    const source = String(value ?? "");
    const rich = !!(window.marked?.Marked && window.DOMPurify?.isSupported);
    const previous = rendered.get(element);
    if (previous?.source === source && previous.rich === rich) return false;
    element.classList.add("markdown-body");
    element.classList.toggle("markdown-fallback", !rich);
    try {
      if (!rich) throw new Error("Markdown renderer unavailable");
      parser ||= new window.marked.Marked({
        gfm: true,
        breaks: true,
        renderer: {
          // Raw HTML and image references are displayed as text, never mounted.
          html({ text }) { return escapeHTML(text); },
          image({ text }) { return escapeHTML(text || "图片"); },
        },
      });
      const fragment = window.DOMPurify.sanitize(parser.parse(source), {
        RETURN_DOM_FRAGMENT: true,
        ALLOWED_TAGS: ["p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
          "strong", "em", "del", "blockquote", "ul", "ol", "li", "pre", "code",
          "a", "table", "thead", "tbody", "tr", "th", "td", "input"],
        ALLOWED_ATTR: ["href", "title", "align", "start", "type", "checked", "disabled"],
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
      });
      fragment.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (!/^(https?:\/\/|mailto:)/i.test(href)) link.removeAttribute("href");
        else {
          link.setAttribute("target", "_blank");
          link.setAttribute("rel", "noopener noreferrer");
        }
      });
      fragment.querySelectorAll("input").forEach((input) => {
        // GFM task lists are presentation only, not interactive controls.
        if (input.getAttribute("type") !== "checkbox") input.remove();
        else input.disabled = true;
      });
      fragment.querySelectorAll("table").forEach((table) => {
        const wrap = document.createElement("div");
        wrap.className = "markdown-table-scroll";
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "表格，可横向滚动");
        table.replaceWith(wrap);
        wrap.append(table);
      });
      element.replaceChildren(fragment);
      rendered.set(element, { source, rich: true });
    } catch {
      element.textContent = source;
      element.classList.add("markdown-fallback");
      rendered.set(element, { source, rich: false });
    }
    return true;
  }

  window.SchGenMarkdown = Object.freeze({ render });
})();
