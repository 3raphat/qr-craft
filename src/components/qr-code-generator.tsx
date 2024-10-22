import { zodResolver } from '@hookform/resolvers/zod';
import { CopyIcon, DownloadIcon, ImageIcon, ReloadIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  value: z.string().min(1, {
    message: 'QR Code value is required.',
  }),
  format: z.enum(['png', 'svg']),
  size: z.number().min(128).max(4096),
  margin: z.number().min(0).max(4),
  fgColor: z.string(),
  bgColor: z.string(),
  logoSize: z.number().min(1).max(50),
});

export function QRCodeGenerator() {
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<HTMLCanvasElement | SVGSVGElement>(null);
  const [logo, setLogo] = useState<string | null>(null); // For storing the uploaded logo

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
      format: 'png',
      size: 1024,
      margin: 2,
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      logoSize: 20,
    },
  });

  const handleSubmit = useCallback(() => {
    const values = form.getValues();
    try {
      setQrValue(values.value);
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }, [form, setQrValue]);

  const debouncedHandleSubmit = useDebouncedCallback(handleSubmit, 500);

  const formValues = form.watch();

  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name === 'value') {
        debouncedHandleSubmit();
      } else {
        handleSubmit();
      }
    });
    return () => subscription.unsubscribe();
  }, [handleSubmit, debouncedHandleSubmit, formValues, form]);

  const handleLogoUpload = useCallback((acceptedFiles: File[] | string) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;

        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);

        const croppedDataUrl = canvas.toDataURL('image/png');
        setLogo(croppedDataUrl);
      };
      img.src = src;
    };

    if (typeof acceptedFiles === 'string') {
      processImage(acceptedFiles);
    } else if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        processImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleLogoUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    multiple: false,
  });

  const downloadFile = (url: string, filename: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadQRCode = () => {
    const format = form.getValues('format');
    if (qrRef.current) {
      const canvas = qrRef.current as HTMLCanvasElement;
      if (format === 'png' && canvas instanceof HTMLCanvasElement) {
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        downloadFile(pngUrl, 'qrcode.png');
      } else if (format === 'svg' && canvas instanceof SVGSVGElement) {
        const svgString = new XMLSerializer().serializeToString(canvas);
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        downloadFile(svgUrl, 'qrcode.svg');
      } else {
        console.error('Invalid format or canvas type');
        toast.error('Failed to generate QR code. Please try again.');
      }
    }
  };

  const copyQRCode = async () => {
    const format = form.getValues('format');
    if (!qrRef.current) return;

    try {
      if (format === 'png' && qrRef.current instanceof HTMLCanvasElement) {
        const canvas = qrRef.current as HTMLCanvasElement;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('QR Code copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Error copying QR Code: ', error);
      toast.error('Failed to copy QR Code. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your URL or text"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="256">256x256 px</SelectItem>
                      <SelectItem value="512">512x512 px</SelectItem>
                      <SelectItem value="1024">1024x1024 px</SelectItem>
                      <SelectItem value="2048">2048x2048 px</SelectItem>
                      <SelectItem value="4096">4096x4096 px</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="margin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margin - {field.value}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={4}
                    step={1}
                    value={[field.value]}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormDescription>Margin is the space around the QR Code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foreground Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      onChange={(value) => field.onChange(value)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      onChange={(value) => field.onChange(value)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Upload Logo</FormLabel>
              <div
                {...getRootProps()}
                className={cn(
                  'group relative grid h-32 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
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
                      <p className="text-xs text-muted-foreground">
                        Your logo is ready to be added
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mt-2 text-sm text-secondary-foreground">
                        <span className="font-semibold">Drag & drop logo here</span>
                      </p>
                      <p className="text-xs text-muted-foreground">or click to select logo</p>
                    </div>
                  )}
                </div>
                <input {...getInputProps()} />
              </div>
            </div>

            {logo && (
              <div className="flex flex-col items-center justify-center">
                <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
                  <img
                    src={logo}
                    alt="Logo Preview"
                    className="size-32 object-cover object-center"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    title="Reload Logo"
                  >
                    <ReloadIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLogo(null);
                    }}
                  >
                    Remove Logo
                  </Button>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="logoSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Size - {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={50}
                      step={1}
                      value={[field.value]}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Adjust the size of the logo inside the QR code.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      {qrValue && (
        <motion.div
          className="mx-auto mt-4 max-w-[256px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            {form.getValues('format') === 'png' ? (
              <QRCodeCanvas
                size={form.getValues('size')}
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                  width: '100%',
                }}
                value={qrValue}
                ref={qrRef as RefObject<HTMLCanvasElement>}
                marginSize={form.getValues('margin')}
                fgColor={form.getValues('fgColor')}
                bgColor={form.getValues('bgColor')}
                imageSettings={
                  logo
                    ? {
                        src: logo,
                        height: (form.getValues('size') * form.getValues('logoSize')) / 100,
                        width: (form.getValues('size') * form.getValues('logoSize')) / 100,
                        excavate: true,
                      }
                    : undefined
                }
              />
            ) : (
              <QRCodeSVG
                size={form.getValues('size')}
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                  width: '100%',
                }}
                value={qrValue}
                ref={qrRef as RefObject<SVGSVGElement>}
                marginSize={form.getValues('margin')}
                fgColor={form.getValues('fgColor')}
                bgColor={form.getValues('bgColor')}
                imageSettings={
                  logo
                    ? {
                        src: logo,
                        height: (form.getValues('size') * form.getValues('logoSize')) / 100,
                        width: (form.getValues('size') * form.getValues('logoSize')) / 100,
                        excavate: true,
                      }
                    : undefined
                }
              />
            )}
          </div>
          <motion.div
            className="mt-4 flex flex-col gap-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Button
              variant="outline"
              onClick={copyQRCode}
              disabled={form.getValues('format') === 'svg'}
            >
              <CopyIcon className="mr-2 size-4" />
              Copy QR Code
            </Button>
            <Button onClick={downloadQRCode}>
              <DownloadIcon className="mr-2 size-4" />
              Download QR Code
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
