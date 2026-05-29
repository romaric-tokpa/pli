// Uploader — zone de glisser-déposer + sélection de fichier.
// Bornes UI : `accept` (extensions), `tailleMaxMo` (affichée dans le hint),
// `erreur` (texte rouge sous la zone). La VALIDATION RÉELLE de taille/type
// est faite par l'appelant (préparation à l'ingestion Phase 2) : ce composant
// AFFICHE les bornes et l'erreur, il ne décide pas.

import { useState, type DragEvent, type ChangeEvent } from 'react';
import { Icon } from './icon.js';
import { cn } from '../lib/cn.js';

export interface UploaderProps {
  /** Liste d'extensions séparées par virgule, ex. ".csv,.xlsx,.xls". */
  accept?: string;
  onFiles?: (files: File[]) => void;
  /** Texte d'aide affiché sous la zone (ex. types autorisés + taille). */
  hint?: string;
  multiFile?: boolean;
  label?: string;
  /**
   * Affiche un état d'erreur (bordure rouge + message sous la zone).
   * La validation (type/taille/contenu) reste de la responsabilité du
   * caller — typiquement, l'écran d'import branchera un IngestionService
   * en Phase 2.
   */
  erreur?: string;
}

export function Uploader({
  accept = '.csv,.xlsx,.xls',
  onFiles,
  hint,
  multiFile,
  label = 'Déposez vos fichiers ici ou cliquez pour parcourir',
  erreur,
}: UploaderProps) {
  const [drag, setDrag] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDrag(true);
  };
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDrag(true);
  };
  const handleDragLeave = () => setDrag(false);
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDrag(false);
    if (onFiles && e.dataTransfer.files) {
      onFiles(Array.from(e.dataTransfer.files));
    }
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onFiles && e.target.files) {
      onFiles(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <label
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'block cursor-pointer rounded-lg border-2 border-dashed px-6 py-12 text-center transition',
          erreur && 'border-erreur bg-erreur/5',
          !erreur && drag && 'border-encre bg-encre/5',
          !erreur && !drag && 'border-bordure hover:border-[#B8C0CE] bg-surface/40',
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={!!multiFile}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={cn(
            'mx-auto h-12 w-12 rounded-full bg-white border flex items-center justify-center',
            erreur ? 'border-erreur text-erreur' : 'border-bordure text-encre',
          )}
        >
          <Icon name={erreur ? 'TriangleAlert' : 'CloudUpload'} size={22} />
        </div>
        <div className="mt-3 text-[14px] font-medium text-encre">{label}</div>
        {hint && <div className="mt-1 text-[12px] text-texte-secondaire">{hint}</div>}
      </label>
      {erreur && (
        <p className="mt-2 text-[12px] text-erreur flex items-center gap-1">
          <Icon name="TriangleAlert" size={12} />
          {erreur}
        </p>
      )}
    </div>
  );
}
