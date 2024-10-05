import { QRCodeGenerator } from '@/components/qr-code-generator';
import { QRCodeReader } from '@/components/qr-code-reader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <div className="flex min-h-screen w-full justify-center px-4 py-12">
      <Tabs
        defaultValue="create"
        className="mx-auto w-full max-w-3xl"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <div className="rounded-lg border p-6">
            <QRCodeGenerator />
          </div>
        </TabsContent>
        <TabsContent value="read">
          <div className="rounded-lg border p-6">
            <QRCodeReader />
          </div>
        </TabsContent>
      </Tabs>
      <div className="fixed bottom-6 right-6">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default App;
