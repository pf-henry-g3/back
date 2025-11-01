import { v2 as cloudinary } from "cloudinary";
import { config as dotenvConfig } from "dotenv";
// MODULO DE CONFIGURACIÓN DE CLOUDINARY
dotenvConfig({ path: ".env.development" });

export const CloudinaryConfig = {
  provide: "CLOUDINARY", //Proveedor de cloudinary. Lo vamos a utilziar para la carga de archivos.
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });
  },
};
