import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Main", headerShown: false }}
      />
      <Tabs.Screen
        name="sources"
        options={{ title: "Sources", headerShown: false }}
      />
    </Tabs>
  );
}
