// Temporary redirect from old path /admin/manage-users to /admin/manage-admins
import { redirect } from "next/navigation";

export default function RedirectManageUsers() {
  redirect("/admin/manage-admins");
}
