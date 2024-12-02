import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { StyleSheet, View, Alert, Image, Button } from "react-native";
import DocumentPicker, {
  isCancel,
  isInProgress,
  types,
} from "react-native-document-picker";

interface Props {
  size: number;
  url: string | null;
  onUpload: (filePath: string) => void;
}

export default function Avatar({ url, size = 150, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data as Blob);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const file = await DocumentPicker.pickSingle({
        presentationStyle: "fullScreen",
        copyTo: "cachesDirectory",
        type: types.images,
      });

      const formData = new FormData();
      formData.append("file", {
        uri: file.fileCopyUri || "",
        type: file.type || "application/octet-stream",
        name: file.name || "upload.jpg",
      } as any);

      const fileExt = file.name?.split(".").pop() || "jpg";
      const filePath = `${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, formData);

      if (error) {
        throw error;
      }

      onUpload(filePath);
    } catch (error) {
      if (isCancel(error)) {
        console.warn("User cancelled the picker.");
      } else if (isInProgress(error)) {
        console.warn(
          "Multiple pickers were opened, only the last one will be considered."
        );
      } else if (error instanceof Error) {
        Alert.alert("Error", error.message);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <View>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]} />
      )}
      <Button
        title={uploading ? "Uploading ..." : "Upload"}
        onPress={uploadAvatar}
        disabled={uploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: "hidden",
    maxWidth: "100%",
  },
  image: {
    resizeMode: "cover", // Correct `objectFit`
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: "#333",
    borderWidth: 1, // Replace invalid `border`
    borderColor: "rgb(200, 200, 200)", // Use valid `borderColor`
    borderRadius: 5,
  },
});
