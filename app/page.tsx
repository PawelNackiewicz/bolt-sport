import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const cookieStore = await cookies();
  const langCookie = cookieStore?.get("lang")?.value;
  const preferredLanguage = langCookie?.toLowerCase() ?? "pl";

  let redirectTo = "/pl";

  if (preferredLanguage === "de") {
    redirectTo = "/de";
  } else if (preferredLanguage === "en") {
    redirectTo = "/en";
  }

  redirect(redirectTo);
}
