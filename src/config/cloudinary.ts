import { v2 as cloudinary } from "cloudinary";
import { config as dotenvConfig } from "dotenv";
// MODULO DE CONFIGURACIÓN DE CLOUDINARY
dotenvConfig({ path: ".env.development" });

export const CloudinaryConfig = {
  provide: "CLOUDINARY", //Proveedor de cloudinary. Lo vamos a utilziar para la carga de imagenes.
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CL_NAME,
      api_key: process.env.CL_APIKEY,
      api_secret: process.env.CL_API_SECRET,
    });
  },
};
