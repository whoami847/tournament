// This file is a mock for demo purposes as Firebase Storage is not used.

/**
 * Mocks uploading a file. In a real scenario, this would interact with Firebase Storage.
 * @param file The file to "upload".
 * @param path The path where the file should be stored.
 * @param onProgress A callback function to track upload progress.
 * @returns A promise that resolves with a placeholder image URL.
 */
export const uploadImage = (
  file: File,
  path: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    onProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadstart = () => {
      onProgress(30);
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = 30 + (event.loaded / event.total) * 60;
        onProgress(progress);
      }
    };

    reader.onload = () => {
      setTimeout(() => {
        onProgress(100);
        // In a real app, this would be the Firebase downloadURL.
        // For the demo, we return the base64 string directly.
        resolve(reader.result as string);
      }, 500); // Simulate network latency
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
};
