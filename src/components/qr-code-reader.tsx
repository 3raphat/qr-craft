import { ImageIcon } from '@radix-ui/react-icons';
import { BrowserQRCodeReader } from '@zxing/browser';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn, isValidURL } from '@/lib/utils';

export function QRCodeReader() {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.src = e.target?.result as string;
        setQrCodeImage(img.src);

        img.onload = async () => {
          try {
            const codeReader = new BrowserQRCodeReader();
            const result = await codeReader.decodeFromImageElement(img);
            setQrCodeData(result.getText());
            setErrorMessage(null);
          } catch {
            setQrCodeData(null);
            setErrorMessage('No QR code found or unable to decode');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: false,
  });

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        {...getRootProps()}
        className={cn(
          'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragActive && 'border-muted-foreground/50 bg-muted/25',
          isDragReject && 'border-destructive bg-destructive/10'
        )}
  
      >
        <div className="text-center">
          <div
            className={cn(
              'mx-auto max-w-min rounded-md border p-2 transition',
              isDragReject && 'border-destructive',
              isDragActive && 'border-muted-foreground/60'
            )}
          >
            <ImageIcon className={cn('size-5', isDragReject && 'text-destructive')} />
          </div>
          {isDragReject ? (
            <div>
              <p className="mt-2 text-sm text-destructive">
                <span className="font-semibold">File type not accepted</span>
              </p>
              <p className="text-xs text-destructive/80">Please upload an image file</p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="mt-2 text-sm text-secondary-foreground">
                <span className="font-semibold">Release to upload</span>
              </p>
              <p className="text-xs text-muted-foreground">Your files are ready to be scanned</p>
            </div>
          ) : (
            <div>
              <p className="mt-2 text-sm text-secondary-foreground">
                <span className="font-semibold">Drag & drop files here</span>
              </p>
              <p className="text-xs text-muted-foreground">or click to select files</p>
            </div>
          )}
        </div>
        <input
          {...getInputProps()}
          className="hidden"
        />
      </div>
      {qrCodeImage && (
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <img
              src={qrCodeImage}
              alt="Uploaded QR Code"
              className="h-auto max-h-64 max-w-full"
            />
          </div>
        </motion.div>
      )}
      {qrCodeData && (
        <motion.div
          className="rounded-md bg-muted p-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          {isValidURL(qrCodeData) ? (
            <a
              href={qrCodeData}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {qrCodeData}
            </a>
          ) : (
            <p className="text-foreground">{qrCodeData}</p>
          )}
        </motion.div>
      )}
      {errorMessage && (
        <motion.div
          className="rounded-md bg-destructive/10 p-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <p className="font-medium text-destructive">{errorMessage}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default QRCodeReader;
