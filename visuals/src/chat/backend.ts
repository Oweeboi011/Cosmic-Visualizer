import type { Mood } from "../avatar/Avatar";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatReply {
  text: string;
  /** Optional expression for the avatar while it answers. */
  mood?: Mood;
}

/**
 * Where replies come from. Implementations must not hold provider API keys in the
 * browser: this is a static Vite app, so anything bundled is public. A real backend
 * should call your own server endpoint, which holds the key and calls the model.
 */
export interface ChatBackend {
  reply(history: readonly ChatMessage[]): Promise<ChatReply>;
}

/** Placeholder until a real backend is wired up; exercises the avatar's speech path. */
export class OfflineBackend implements ChatBackend {
  async reply(): Promise<ChatReply> {
    return {
      text: "I'm not connected to a chat service yet, but I can still show you around the galaxy. Try pressing C to cruise.",
      mood: "relaxed",
    };
  }
}
