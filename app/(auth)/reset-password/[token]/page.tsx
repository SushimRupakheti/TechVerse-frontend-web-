import ResetPasswordForm from "../../_components/ResetPasswordForm";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div>
      <ResetPasswordForm token={decodeURIComponent(token || "")} />
    </div>
  );
}
