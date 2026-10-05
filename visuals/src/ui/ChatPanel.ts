import type { Avatar } from "../avatar/Avatar";
import type { ChatBackend, ChatMessage } from "../chat/backend";

/**
 * Transcript plus input. Replies are spoken by the avatar (lip sync and mood) when one
 * is loaded. Message text is only ever set via textContent, never parsed as HTML.
 */
export function createChatPanel(backend: ChatBackend, avatar: Avatar) {
  const history: ChatMessage[] = [];

  const panel = document.createElement("section");
  panel.id = "chat";
  panel.setAttribute("aria-label", "Chat");

  const log = document.createElement("ol");
  log.className = "chat-log";
  log.setAttribute("aria-live", "polite");

  const form = document.createElement("form");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ask the cosmos…";
  input.setAttribute("aria-label", "Message");
  input.autocomplete = "off";
  const send = document.createElement("button");
  send.type = "submit";
  send.textContent = "Send";
  form.append(input, send);

  const hint = document.createElement("p");
  hint.className = "chat-hint";
  hint.textContent = "Drop a .vrm file anywhere to load an avatar.";

  panel.append(log, form, hint);
  document.body.append(panel);

  function append(role: ChatMessage["role"], text: string) {
    const item = document.createElement("li");
    item.className = `chat-${role}`;
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    history.push({ role: "user", content: text });
    append("user", text);

    send.disabled = true;
    try {
      const reply = await backend.reply(history);
      history.push({ role: "assistant", content: reply.text });
      append("assistant", reply.text);
      avatar.setMood(reply.mood ?? "neutral");
      await avatar.speak(reply.text);
      avatar.setMood("neutral");
    } catch {
      append("assistant", "Sorry, I couldn't reach the chat service.");
    } finally {
      send.disabled = false;
      input.focus();
    }
  });

  // Keys typed into the chat must not trigger scene shortcuts (C, H, Esc).
  input.addEventListener("keydown", (e) => e.stopPropagation());

  return {
    setAvatarHint(text: string | null) {
      hint.hidden = text === null;
      if (text) hint.textContent = text;
    },
  };
}
