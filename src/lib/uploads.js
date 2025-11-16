
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * sube una imagen del usuario a atorage y  lo devuelve 
 * @param {string} uid  id del usuario (user.uid)
 * @param {File} file archivo de imagen
 * @param {"avatar" | "banner"} type  tipo de imagen
 */

// subir imagen usuario
export async function uploadUserImage(uid, file, type) {
  if (!uid || !file) return null;

  const ext = file.name.split(".").pop() || "jpg";
  
  const path = `users/${uid}/${type}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  // subir archivo
  await uploadBytes(storageRef, file);

  // obtener url de descarga
  const url = await getDownloadURL(storageRef);
  return url;
}
