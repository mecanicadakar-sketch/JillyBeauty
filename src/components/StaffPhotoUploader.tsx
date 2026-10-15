import React, { useState, useRef } from 'react';
import { Upload, Camera, Link as LinkIcon, X, Check, Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { compressAndResizeImage } from '../utils/image';

interface StaffPhotoUploaderProps {
  currentAvatar: string;
  onAvatarChange: (newAvatar: string) => void;
  staffName?: string;
  staffRoleLabel?: string;
  staffSpecialty?: string;
  mode?: 'add' | 'edit';
}

export const PRESET_AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    label: 'Directora / Jilly'
  },
  {
    url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80',
    label: 'Cosmiatra Facial'
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    label: 'Especialista Láser'
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    label: 'Nail & Micropigmentación'
  },
  {
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    label: 'Recepción & Caja'
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    label: 'Terapeuta Corporal'
  }
];

export const StaffPhotoUploader: React.FC<StaffPhotoUploaderProps> = ({
  currentAvatar,
  onAvatarChange,
  staffName = 'Nombre del Colaborador',
  staffRoleLabel = 'Especialista / Cosmiatra',
  staffSpecialty = 'Cosmiatra Facial & Láser'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const optimizedDataUrl = await compressAndResizeImage(file, 300, 0.85);
      onAvatarChange(optimizedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la foto');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setErrorMessage('');
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image/')) {
      setErrorMessage('Por favor ingresa una URL válida (inicia con https://)');
      return;
    }
    onAvatarChange(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="bg-[#16161c] border border-[#2d2d38] rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Foto de Perfil del Colaborador</span>
        </label>
        {currentAvatar && (
          <button
            type="button"
            onClick={() => onAvatarChange('')}
            className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Quitar foto</span>
          </button>
        )}
      </div>

      {/* LIVE PREVIEW: Exactly as shown next to the name in the demo */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#111115] to-[#181820] border border-[#d4af37]/30 shadow-inner">
        <div className="text-[10px] text-[#d4af37]/90 font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
          <span>Vista previa en la app (al lado del nombre):</span>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Avatar circle */}
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#d4af37] bg-[#22222a] shrink-0 shadow-lg shadow-[#d4af37]/15">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#d4af37] bg-black/60">
                <Camera className="w-5 h-5 opacity-80" />
                <span className="text-[8px] uppercase mt-0.5 text-zinc-400 font-medium">Sin foto</span>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[#d4af37] animate-spin" />
              </div>
            )}
          </div>

          {/* Name & Title right next to the photo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">
                {staffName.trim() || 'Nombre del Colaborador'}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 shrink-0">
                {staffRoleLabel}
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {staffSpecialty || 'Cosmiatra Facial & Láser'}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Visible en Citas, Caja y Reportes del Spa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Upload Method */}
      <div className="flex items-center gap-1 bg-[#101014] p-1 rounded-lg border border-[#27272a]">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload'
              ? 'bg-[#d4af37] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Archivo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'url'
              ? 'bg-[#d4af37] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Pegar Enlace Web</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'presets'
              ? 'bg-[#d4af37] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Fotos de la Demo</span>
        </button>
      </div>

      {/* Tab 1: Direct File Upload & Drag-and-drop */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#d4af37] bg-[#d4af37]/10 scale-[1.01]'
                : 'border-[#33333f] hover:border-[#d4af37]/70 bg-[#121217] hover:bg-[#15151c]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#1e1e26] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Haz clic para seleccionar o arrastra una imagen aquí
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Soporta JPG, PNG, WEBP de celular o computadora. Optimización automática a alta calidad.
                </p>
              </div>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs hover:brightness-110 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Explorar Dispositivo</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-[#22222a] hover:bg-[#2b2b36] border border-[#333340] text-zinc-300 font-medium text-xs flex items-center gap-1.5"
              title="Abrir cámara del dispositivo"
            >
              <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Cámara</span>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: URL Input */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <label className="block text-[11px] text-zinc-400">
            Pega el enlace directo de la imagen (Instagram, Google Fotos, Web):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://ejemplo.com/foto-colaborador.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
              className="flex-1 px-3 py-2 bg-[#121217] border border-[#2d2d38] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3.5 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg hover:brightness-110"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-2">
          <span className="text-[11px] text-zinc-400 block">
            Selecciona una foto profesional de estética y spa lista para usar:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {PRESET_AVATARS.map((preset, idx) => {
              const isSelected = currentAvatar === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onAvatarChange(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all p-1 text-center bg-[#131318] ${
                    isSelected
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/30 shadow-md scale-105'
                      : 'border-[#2d2d38] hover:border-zinc-500 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-zinc-700">
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </div>
                  <span className="block text-[9px] text-zinc-300 mt-1 truncate font-medium">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
