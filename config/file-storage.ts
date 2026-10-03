export const fileStorageConfig = {
  root: process.env.LOCAL_FILE_STORAGE_DIRECTORY,
  documentMaxBytes: Number(process.env.FILE_DOCUMENT_MAX_BYTES ?? 10 * 1024 * 1024),
  mediaMaxBytes: Number(process.env.FILE_MEDIA_MAX_BYTES ?? 50 * 1024 * 1024),
} as const;

export const fileTypes = {
  document: { pdf: ["application/pdf"], doc: ["application/msword"], docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], xls: ["application/vnd.ms-excel"], xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], csv: ["text/csv"], txt: ["text/plain"] },
  image: { jpg: ["image/jpeg"], jpeg: ["image/jpeg"], png: ["image/png"], webp: ["image/webp"] },
  video: { mp4: ["video/mp4"], webm: ["video/webm"] },
} as const;
