import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Upload, FileText, Download, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';

const Import = () => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const { importEntries } = useData();

  const validateEntry = (entry) => {
    const errors = [];
    if (!entry.type || !['hadith', 'ayat'].includes(entry.type.toLowerCase())) {
      errors.push('Invalid or missing "type"');
    }
    if (!entry.arabic_text) errors.push('Missing "arabic_text"');
    if (!entry.urdu_translation) errors.push('Missing "urdu_translation"');
    return { isValid: errors.length === 0, errors };
  };

  const handleFileParse = (file) => {
    setFile(file);
    setPreviewData([]);
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      let parsedData = [];

      try {
        if (file.type === 'application/json') {
          parsedData = JSON.parse(content);
        } else if (file.type === 'text/csv') {
          const result = Papa.parse(content, { header: true, skipEmptyLines: true });
          parsedData = result.data;
        } else {
          toast({ title: 'Unsupported File Type', description: 'Please upload a JSON or CSV file.', variant: 'destructive' });
          return;
        }

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          toast({ title: 'Invalid File', description: 'The file is empty or not in the correct format.', variant: 'destructive' });
          return;
        }

        const dataWithValidation = parsedData.map(entry => ({
          ...entry,
          ...validateEntry(entry),
        }));
        setPreviewData(dataWithValidation);
        toast({ title: 'File Ready for Review', description: `Found ${parsedData.length} entries. Please review and confirm the import.` });

      } catch (error) {
        toast({ title: 'Parsing Error', description: 'Could not parse the file. Please check its format.', variant: 'destructive' });
      }
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileParse(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileParse(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    const validEntries = previewData.filter(entry => entry.isValid);
    if (validEntries.length === 0) {
      toast({ title: 'No Valid Entries', description: 'There are no valid entries to import.', variant: 'destructive' });
      return;
    }

    setImporting(true);
    const result = await importEntries(validEntries);
    setImporting(false);

    if (result.success) {
      const failedCount = previewData.length - validEntries.length;
      toast({
        title: 'Import Complete',
        description: `${result.count} entries imported successfully. ${failedCount} entries failed.`,
        variant: 'success',
      });
      setFile(null);
      setPreviewData([]);
    } else {
      toast({ title: 'Import Failed', description: 'An error occurred during import.', variant: 'destructive' });
    }
  };

  const sampleData = {
    json: [{ type: "hadith", arabic_text: "...", urdu_translation: "..." }],
    csv: `type,arabic_text,urdu_translation\nhadith,"...","..."`
  };

  const downloadSample = (format) => {
    const data = format === 'json' 
      ? JSON.stringify(sampleData.json, null, 2)
      : sampleData.csv;
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_data.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Import Data - Hadith & Quran CMS</title>
        <meta name="description" content="Import Islamic content in bulk from JSON or CSV files." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Data</h1>
          <p className="text-muted-foreground">Bulk import your content from JSON or CSV files.</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload & Preview</TabsTrigger>
            <TabsTrigger value="samples">Sample Formats</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Upload className="w-5 h-5" /><span>File Upload</span></CardTitle>
                <CardDescription>Upload a JSON or CSV file to begin the import process.</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept=".json,.csv" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Drop your file here or click to browse</h3>
                    <p className="text-muted-foreground">Supports JSON and CSV files</p>
                  </label>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {previewData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Import Preview</CardTitle>
                      <CardDescription>Review the entries before importing. Invalid entries will be skipped.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-hidden">
                        {previewData.map((entry, index) => (
                          <div key={index} className={`p-3 border rounded-md flex items-start gap-4 ${entry.isValid ? 'border-green-500/30' : 'border-red-500/30'}`}>
                            {entry.isValid ? <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />}
                            <div className="flex-grow">
                              <p className="font-mono text-sm truncate">
                                <span className="font-bold">{entry.type || 'N/A'}:</span> {entry.arabic_text || 'No Arabic text'}
                              </p>
                              {!entry.isValid && <p className="text-xs text-red-500 mt-1">{entry.errors.join(', ')}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardContent className="border-t pt-6">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {previewData.filter(e => e.isValid).length} valid entries out of {previewData.length} will be imported.
                        </p>
                        <Button onClick={handleConfirmImport} disabled={importing}>
                          {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {importing ? 'Importing...' : 'Confirm Import'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="samples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><AlertCircle className="w-5 h-5" /><span>Required Fields</span></CardTitle>
                <CardDescription>Your files must contain these fields for a successful import.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <code>type</code>: Must be either "hadith" or "ayat".</li>
                  <li>• <code>arabic_text</code>: The original Arabic text.</li>
                  <li>• <code>urdu_translation</code>: The Urdu translation.</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="w-5 h-5" /><span>JSON Sample</span></CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>{JSON.stringify(sampleData.json, null, 2)}</code></pre>
                <Button variant="outline" onClick={() => downloadSample('json')} className="w-full mt-4"><Download className="w-4 h-4 mr-2" />Download JSON Sample</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="w-5 h-5" /><span>CSV Sample</span></CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto"><code>{sampleData.csv}</code></pre>
                <Button variant="outline" onClick={() => downloadSample('csv')} className="w-full mt-4"><Download className="w-4 h-4 mr-2" />Download CSV Sample</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Import;