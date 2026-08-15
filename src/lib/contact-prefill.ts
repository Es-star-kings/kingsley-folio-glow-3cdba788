export const CONTACT_PREFILL_EVENT = "portfolio:contact-prefill";

export const requestService = (service: string) => {
  window.dispatchEvent(
    new CustomEvent<string>(CONTACT_PREFILL_EVENT, {
      detail: `Hi Kingsley, I'd like to talk about "${service}". Here's what I have in mind: `,
    }),
  );
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
};
