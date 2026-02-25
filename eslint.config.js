import React, { useState } from 'react';
import { Download, Upload, X, CheckCircle, AlertCircle, FileJson } from 'lucide-react';
import { Property, Tenant, Receipt, CashMovement } from '../App';

interface ImportExportButtonsProps {
  properties: Property[];
  tenants: Tenant[];
  receipts: Receipt[];
  cashMovements: CashMovement[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  setCashMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
}

interface ExportData {
  version: string;
  exportDate: string;
  properties: Property[];
  tenants: Tenant[];
  receipts: Receipt[];
  cashMovements: CashMovement[];
  metadata: {
    totalProperties: number;
    totalTenants: number;
    totalReceipts: number;
    totalCashMovements: number;
  };
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  properties,
  tenants,
  receipts,
  cashMovements,
  setProperties,
  setTenants,
  setReceipts,
  setCashMovements
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);

  const handleExport = () => {
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      properties,
      tenants,
      receipts,
      cashMovements,
      metadata: {
        totalProperties: properties.length,
        totalTenants: tenants.length,
        totalReceipts: receipts.length,
        totalCashMovements: cashMovements.length
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sistema-alquileres-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setShowExportModal(true);
    setTimeout(() => setShowExportModal(false), 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportData;

        if (!data.version || !data.properties || !data.tenants || !data.receipts || !data.cashMovements) {
          setImportStatus('error');
          setImportMessage('Archivo inválido: formato incorrecto');
          return;
        }

        setImportPreview(data);
        setImportStatus('idle');
        setImportMessage('');
      } catch (error) {
        setImportStatus('error');
        setImportMessage('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!importPreview) return;

    try {
      setProperties(importPreview.properties);
      setTenants(importPreview.tenants);
      setReceipts(importPreview.receipts);
      setCashMovements(importPreview.cashMovements);

      setImportStatus('success');
      setImportMessage(`Datos importados exitosamente: ${importPreview.metadata.totalProperties} propiedades, ${importPreview.metadata.totalTenants} inquilinos, ${importPreview.metadata.totalReceipts} recibos, ${importPreview.metadata.totalCashMovements} movimientos de caja.`);

      setTimeout(() => {
        setShowImportModal(false);
        setImportPreview(null);
        setImportStatus('idle');
        setImportMessage('');
      }, 3000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage('Error al importar los datos. Por favor, intenta nuevamente.');
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          title="Importar datos desde archivo"
        >
          <Upload className="h-4 w-4" />
          <span>Importar</span>
        </button>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          title="Exportar todos los datos"
        >
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </button>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <Upload className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Importar Datos</h3>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                  setImportStatus('idle');
                  setImportMessage('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Advertencia</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Al importar datos, toda la información actual será reemplazada por los datos del archivo.
                      Asegúrate de haber exportado tus datos actuales antes de continuar.
                    </p>
                  </div>
                </div>
              </div>

              {!importPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileJson className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona el archivo de respaldo
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Debe ser un archivo JSON exportado desde este sistema
                  </p>
                  <label className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Seleccionar archivo</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Vista previa de datos</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Propiedades</p>
                        <p className="text-2xl font-bold text-gray-900">{importPreview.metadata.totalProperties}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Inquilinos</p>
                        <p className="text-2xl font-bold text-gray-900">{importPreview.metadata.totalTenants}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Recibos</p>
                        <p className="text-2xl font-bold text-gray-900">{importPreview.metadata.totalReceipts}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-gray-600">Movimientos de Caja</p>
                        <p className="text-2xl font-bold text-gray-900">{importPreview.metadata.totalCashMovements}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-blue-800">
                      <p>Fecha de exportación: {new Date(importPreview.exportDate).toLocaleString()}</p>
                      <p>Versión: {importPreview.version}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setImportPreview(null);
                        setImportStatus('idle');
                        setImportMessage('');
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmImport}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Confirmar Importación</span>
                    </button>
                  </div>
                </div>
              )}

              {importStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Importación exitosa</h4>
                      <p className="text-sm text-green-800 mt-1">{importMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Error al importar</h4>
                      <p className="text-sm text-red-800 mt-1">{importMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Exportación exitosa</h4>
                <p className="text-sm text-green-800 mt-1">
                  Todos los datos han sido exportados correctamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportExportButtons;
