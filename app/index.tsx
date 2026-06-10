import { Redirect } from "expo-router";

import { useSession } from "@/store/session-provider";

export default function Index() {
  const { session } = useSession();

  return <Redirect href={session ? "/today" : "/login"} />;
}
