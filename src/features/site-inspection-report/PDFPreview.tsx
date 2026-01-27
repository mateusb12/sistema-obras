import { PDFViewer } from '@react-pdf/renderer';
import { InspectionPDFDocument } from './PDFDocument';
import type { InspectionForm } from './types';

interface PDFPreviewProps {
  data: InspectionForm;
}

export function PDFPreview({ data }: PDFPreviewProps) {
  return (
    <div className="w-full h-full">
      <PDFViewer className="w-full h-full border-0">
        <InspectionPDFDocument data={data} />
      </PDFViewer>
    </div>
  );
}
