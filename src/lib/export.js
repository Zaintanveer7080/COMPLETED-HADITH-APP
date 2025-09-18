import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format as formatDate } from 'date-fns';

const generatePdf = (title, head, body) => {
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  doc.autoTable({
    head,
    body,
    startY: 20,
    styles: { font: 'helvetica', fontSize: 8 },
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}_${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`);
};

const generateExcel = (sheets) => {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  });
  XLSX.writeFile(wb, `islamic_cms_export_${formatDate(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportData = (exportFileFormat, type, data) => {
  const { entries, collections } = data;

  const exportAll = () => {
    const allEntries = entries.map(e => ({
      id: e.id,
      type: e.type,
      arabic_text: e.arabic_text,
      urdu_translation: e.urdu_translation,
      reference: e.reference_full || e.quran_reference,
      created_at: e.created_at ? formatDate(new Date(e.created_at), 'PPP p') : 'N/A',
    }));
    if (exportFileFormat === 'pdf') {
      generatePdf('All Content', [['ID', 'Type', 'Arabic', 'Urdu', 'Reference', 'Created At']], allEntries.map(Object.values));
    } else {
      generateExcel([{ name: 'All Content', data: allEntries }]);
    }
  };

  const exportHadith = () => {
    const hadithEntries = entries.filter(e => e.type === 'hadith').map(e => ({
      id: e.id,
      arabic_text: e.arabic_text,
      urdu_translation: e.urdu_translation,
      reference: e.reference_full,
      created_at: e.created_at ? formatDate(new Date(e.created_at), 'PPP p') : 'N/A',
    }));
    if (exportFileFormat === 'pdf') {
      generatePdf('All Hadith', [['ID', 'Arabic', 'Urdu', 'Reference', 'Created At']], hadithEntries.map(Object.values));
    } else {
      generateExcel([{ name: 'All Hadith', data: hadithEntries }]);
    }
  };

  const exportAyat = () => {
    const ayatEntries = entries.filter(e => e.type === 'ayat').map(e => ({
      id: e.id,
      arabic_text: e.arabic_text,
      urdu_translation: e.urdu_translation,
      reference: e.quran_reference,
      created_at: e.created_at ? formatDate(new Date(e.created_at), 'PPP p') : 'N/A',
    }));
    if (exportFileFormat === 'pdf') {
      generatePdf('All Ayat', [['ID', 'Arabic', 'Urdu', 'Reference', 'Created At']], ayatEntries.map(Object.values));
    } else {
      generateExcel([{ name: 'All Ayat', data: ayatEntries }]);
    }
  };

  const exportCollections = () => {
    if (exportFileFormat === 'pdf') {
      const collectionsData = collections.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        entry_count: (c.entryIds || []).length,
      }));
      generatePdf('Collections', [['ID', 'Name', 'Description', 'Entries']], collectionsData.map(Object.values));
    } else {
      const sheets = collections.map(collection => {
        const collectionEntries = (collection.entryIds || [])
          .map(id => entries.find(e => e.id === id))
          .filter(Boolean)
          .map(e => ({
            id: e.id,
            type: e.type,
            arabic_text: e.arabic_text,
            urdu_translation: e.urdu_translation,
            reference: e.reference_full || e.quran_reference,
          }));
        return { name: collection.name.substring(0, 31), data: collectionEntries };
      });
      generateExcel(sheets);
    }
  };

  switch (type) {
    case 'all':
      exportAll();
      break;
    case 'hadith':
      exportHadith();
      break;
    case 'ayat':
      exportAyat();
      break;
    case 'collections':
      exportCollections();
      break;
    default:
      break;
  }
};