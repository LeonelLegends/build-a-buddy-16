import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ slug: z.string().min(1).max(255) });

export const incrementBlogView = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("increment_blog_view", { _slug: data.slug });
    return { ok: true };
  });
