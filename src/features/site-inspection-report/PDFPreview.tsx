import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDF } from '@react-pdf/renderer';
import { InspectionPDFDocument } from './PDFDocument';
import type { InspectionForm } from './types';
import {
    ZoomIn,
    ZoomOut,
    Download,
    Loader2,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from 'lucide-react';

// Configuração do Worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFPreviewProps {
    data: InspectionForm;
}

export function PDFPreview({ data }: PDFPreviewProps) {
    // Inicializa o hook
    const [instance, updateInstance] = usePDF({ document: <InspectionPDFDocument data={data} /> });

    // Estados de controle da UI
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    // CORREÇÃO AQUI: Passamos o componente direto, sem envolver em chaves { document: ... }
    useEffect(() => {
        updateInstance(<InspectionPDFDocument data={data} />);
    }, [data, updateInstance]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Controles de Zoom
    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const resetZoom = () => setScale(1.0);

    if (instance.loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500">
                <Loader2 className="animate-spin mr-2" /> Gerando Preview...
            </div>
        );
    }

    if (instance.error) {
        return <div className="text-red-500">Erro ao gerar PDF: {instance.error}</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">

            {/* --- Custom Toolbar --- */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
                <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-2">
            Preview
          </span>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                        <button onClick={zoomOut} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Zoom Out">
                            <ZoomOut size={16} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <span className="text-xs w-12 text-center text-gray-600 dark:text-gray-300">
              {Math.round(scale * 100)}%
            </span>
                        <button onClick={zoomIn} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Zoom In">
                            <ZoomIn size={16} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <button onClick={resetZoom} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded ml-1" title="Reset Zoom">
                            <RotateCcw size={14} className="text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Paginação */}
                    {numPages > 1 && (
                        <div className="flex items-center gap-1 mr-4 bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                            <button
                                onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                disabled={pageNumber <= 1}
                                className="p-1 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-gray-600 dark:text-gray-300 px-2">
                {pageNumber} / {numPages}
              </span>
                            <button
                                onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                                disabled={pageNumber >= numPages}
                                className="p-1 disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Botão de Download */}
                    <a
                        href={instance.url || '#'}
                        download={`inspection-${data.header.projectName || 'report'}.pdf`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                        <Download size={16} />
                        Baixar PDF
                    </a>
                </div>
            </div>

            {/* --- PDF Canvas Area --- */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8 flex justify-center relative">
                <Document
                    file={instance.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex items-center gap-2 text-gray-500 mt-10">
                            <Loader2 className="animate-spin" /> Carregando visualização...
                        </div>
                    }
                    className="shadow-xl"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="bg-white shadow-lg"
                    />
                </Document>
            </div>
        </div>
    );
}