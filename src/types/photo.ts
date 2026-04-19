// src/types/photo.ts
// EventSnap — Photo type definitions

export interface Photo {
  id: string;
  event_id: string;
  guest_id: string;
  storage_path: string;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  is_deleted: boolean;
  uploaded_at: string;
}

export interface PhotoWithUrl extends Photo {
  url: string;
  photographer_name: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  photoId: string;
}

export interface ConfirmPhotoPayload {
  photoId: string;
  fileSize: number;
  width: number;
  height: number;
}

export type UploadState =
  | 'idle'
  | 'getting-url'
  | 'uploading'
  | 'confirming'
  | 'success'
  | 'failed';

export interface UploadJob {
  id: string;
  blob: Blob;
  state: UploadState;
  progress: number; // 0–100
  attempts: number; // 0–3
  error?: string;
}

export interface GalleryPage {
  photos: PhotoWithUrl[];
  nextCursor: string | null;
  totalCount: number;
}
