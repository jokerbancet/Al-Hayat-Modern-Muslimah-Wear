import { Ruler, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MOCK_SIZE_GUIDE } from '../../lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function SizeGuideSection() {
  return (
    <section id="size-guide" className="py-24 bg-background border-t">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold tracking-[0.3em] text-primary/60 uppercase">
                Find Your Perfect Fit
              </p>
              <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
                The Art of <br />
                <span className="italic">Measurement</span>
              </h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed max-w-md">
              At AL-HAYAT, we believe that modesty should never compromise on fit. Our garments are designed to drape beautifully, offering both coverage and a refined silhouette. Use our comprehensive guide to ensure your selection feels as good as it looks.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-2">Chest Measurement</h4>
                  <p className="text-xs text-muted-foreground">Measure around the fullest part of your chest, keeping the tape horizontal and snug but not tight.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-widest uppercase mb-2">Length Measurement</h4>
                  <p className="text-xs text-muted-foreground">Measure from the highest point of your shoulder down to your desired length (usually ankle or floor length).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-[1.5] w-full">
            <Tabs defaultValue="Abayas" className="w-full">
              <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-8">
                {MOCK_SIZE_GUIDE.map((guide) => (
                  <TabsTrigger
                    key={guide.category}
                    value={guide.category}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-8 py-4 text-[10px] font-bold tracking-widest uppercase transition-all"
                  >
                    {guide.category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {MOCK_SIZE_GUIDE.map((guide) => (
                <TabsContent key={guide.category} value={guide.category} className="mt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden rounded-xl border border-primary/5 shadow-sm bg-white"
                  >
                    <Table>
                      <TableHeader className="bg-primary text-white">
                        <TableRow>
                          <TableHead className="text-white font-bold tracking-widest uppercase text-[10px] py-6">Size</TableHead>
                          <TableHead className="text-white font-bold tracking-widest uppercase text-[10px] py-6">Chest (in)</TableHead>
                          <TableHead className="text-white font-bold tracking-widest uppercase text-[10px] py-6">Length (in)</TableHead>
                          <TableHead className="text-white font-bold tracking-widest uppercase text-[10px] py-6">Sleeve (in)</TableHead>
                          {guide.measurements[0].waist && (
                            <TableHead className="text-white font-bold tracking-widest uppercase text-[10px] py-6">Waist (in)</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guide.measurements.map((m) => (
                          <TableRow key={m.size} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-bold py-6">{m.size}</TableCell>
                            <TableCell className="py-6">{m.chest}</TableCell>
                            <TableCell className="py-6">{m.length}</TableCell>
                            <TableCell className="py-6">{m.sleeve}</TableCell>
                            {m.waist && <TableCell className="py-6">{m.waist}</TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
