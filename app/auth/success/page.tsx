import { redirect } from "next/navigation";

export default function AuthSuccessPage() {
  redirect("/dashboard");
}
