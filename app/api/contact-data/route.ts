import { getContactData } from "@/src/lib/storyblok";

export async function GET() {
  try {
    const contactData = await getContactData();
    return Response.json(contactData);
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Unexpected error";

    return Response.json({ error: message }, { status: 500 });
  }
}
