import type { ContentRenderer } from "../windowChrome.ts";
import { canSend, buildMailtoUrl } from "../../logic/mailValidation.ts";

// [CONTENT GAP] Placeholder recipient - replace with the site owner's real address
// before deploy. Never send from the page itself; mailto: only.
const OWNER_EMAIL = "owner@example.com";

export const renderMail: ContentRenderer = (_win, el) => {
  el.classList.add("mail");

  const toField = field("To", inputEl("email", OWNER_EMAIL, true));
  const subjectInput = inputEl("text", "", false);
  const subjectField = field("Subject", subjectInput);

  const bodyInput = document.createElement("textarea");
  bodyInput.className = "mail__body";
  const bodyField = field("Body", bodyInput);

  const send = document.createElement("button");
  send.type = "button";
  send.className = "mail__send";
  send.textContent = "Send";
  send.disabled = true;

  const confirm = document.createElement("div");
  confirm.className = "mail__confirm";

  const refreshSendState = () => {
    send.disabled = !canSend(subjectInput.value);
  };
  subjectInput.addEventListener("input", refreshSendState);

  send.addEventListener("click", () => {
    if (!canSend(subjectInput.value)) return;
    const url = buildMailtoUrl({
      to: OWNER_EMAIL,
      subject: subjectInput.value,
      body: bodyInput.value,
    });
    // Hand off to the visitor's own mail client. The page never sends email.
    window.location.href = url;
    // Inline confirmation so the interaction is never a silent no-op.
    confirm.textContent = "Opening your mail client...";
  });

  el.append(toField, subjectField, bodyField, send, confirm);

  function field(label: string, control: HTMLElement): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "mail__field";
    const lab = document.createElement("label");
    lab.textContent = label;
    wrap.append(lab, control);
    return wrap;
  }

  function inputEl(type: string, value: string, readOnly: boolean): HTMLInputElement {
    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.readOnly = readOnly;
    return input;
  }
};
