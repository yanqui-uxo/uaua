import SourceList from "@/components/SourceList";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Sources() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <SourceList />
    </SafeAreaView>
  );
}
