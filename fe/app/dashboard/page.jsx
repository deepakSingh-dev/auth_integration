import { PageHeader } from "@/components/custom/dashboard/page-header";
import { Summary } from "@/components/custom/dashboard/summary";
import { getUser } from "@/api/user-data";
import { auth } from "../(auth)/auth";

export default async function Page() {
  try {
    const [session] = await Promise.all([auth()]);

    if (!session || !session.accessToken) {
      console.error(" Error: No token found in session.");
      throw new Error("Unauthorized - No token provided");
    }

   
    const user = await getUser(session.accessToken); //  Pass token, not email

    const breadcrumbItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Summary", current: true },
    ];

    return (
      <div>
        <PageHeader items={breadcrumbItems} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Summary user={user} />
        </div>
      </div>
    );
  } catch (error) {
    console.error(" Error loading dashboard:", error);
    return <div className="text-red-500 text-center mt-10">Error: {error.message}</div>;
  }
}
