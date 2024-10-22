import { motion } from 'framer-motion';

import { QRCodeGenerator } from '@/components/qr-code-generator';
import { QRCodeReader } from '@/components/qr-code-reader';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  return (
    <motion.div
      className="flex min-h-screen w-full justify-center px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs
        defaultValue="create"
        className="mx-auto w-full max-w-3xl"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
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
        </motion.div>
      </Tabs>
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <ThemeToggle />
      </motion.div>
    </motion.div>
  );
}

export default App;
