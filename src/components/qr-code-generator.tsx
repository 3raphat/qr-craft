import { zodResolver } from '@hookform/resolvers/zod';
import { CopyIcon, DownloadIcon } from '@radix-ui/react-icons';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
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

const formSchema = z.object({
  value: z.string(),
  format: z.enum(['png', 'svg']),
  size: z.number(),
  margin: z.number().array().length(1),
  fgColor: z.string(),
  bgColor: z.string(),
});

export function QRCodeGenerator() {
  const [qrValue, setQrValue] = useState('');
  const qrRef = useRef<HTMLCanvasElement | SVGSVGElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
      format: 'png',
      size: 1024,
      margin: [2],
      fgColor: '#000000',
      bgColor: '#FFFFFF',
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
    <>
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
                <FormLabel>Margin - {field.value[0]}</FormLabel>
                <FormControl>
                  <Slider
                    min={0}
                    max={4}
                    step={1}
                    value={field.value}
                    defaultValue={[2]}
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
        </form>
      </Form>
      {qrValue && (
        <div className="mx-auto mt-4 max-w-[256px]">
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
                marginSize={form.getValues('margin')[0]}
                fgColor={form.getValues('fgColor')}
                bgColor={form.getValues('bgColor')}
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
                marginSize={form.getValues('margin')[0]}
                fgColor={form.getValues('fgColor')}
                bgColor={form.getValues('bgColor')}
              />
            )}
          </div>
          <div className="mt-4 flex flex-col gap-2">
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
          </div>
        </div>
      )}
    </>
  );
}
