import { Cloudinary } from 'cloudinary-react';


const cloudName = 'dukljwnwm';
const uploadPreset = 'Mascotas';

export const cloudinaryCore = new Cloudinary({
  cloud_name: cloudName,
  upload_preset: uploadPreset,
});
export { cloudName, uploadPreset };