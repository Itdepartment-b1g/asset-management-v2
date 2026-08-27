import SettingsList from "@/components/settings/list";
import { require_app_user } from "@/server/auth/dashboard";

export default async function SettingsPage() {
  await require_app_user();
  return <SettingsList />;
}
