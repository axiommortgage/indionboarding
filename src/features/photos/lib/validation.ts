import * as z from "zod";

const photosSchema = z.object({
  photo: z.string().optional(), // Digital photo
  printPhoto: z.string().optional(), // Print photo
  useDefaultPhoto: z.boolean().default(false),
});

export type PhotosFormData = z.infer<typeof photosSchema>;
export { photosSchema };