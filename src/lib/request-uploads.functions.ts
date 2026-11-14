import { createServerFn } from "@tanstack/react-start";

const MAX = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

/** Public booking uploads go through the server so anonymous visitors never write to storage directly. */
export const uploadRequestDoc = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("invalid input");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("missing file");
    if (file.size === 0 || file.size > MAX) throw new Error("> 10 MB");
    if (!ALLOWED.includes(file.type)) throw new Error("invalid file type");
    return { file };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = data.file.type === "application/pdf" ? "pdf" : (data.file.type.split("/")[1] ?? "jpg");
    const path = `requests/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage.from("documents").upload(path, await data.file.arrayBuffer(), { contentType: data.file.type });
    if (error) throw new Error("upload failed");
    return { path };
  });
