import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { default as FilerobotImageEditor, TABS, TOOLS } from 'react-filerobot-image-editor';

type UploadImagesProps = {
  onImagesUploaded?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  uploadText?: string;
}

export default function UploadImages({ 
  onImagesUploaded, 
  maxFiles = 5,
  maxSize = 5000000, // 5MB default
  uploadText
}: UploadImagesProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<{ 
    src: string; 
    index: number 
  } | null>(null);


  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {    
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(file => {
        if (file.errors[0].code === 'file-too-large') {
          return `File ${file.file.name} is too large. Max size is ${maxSize / 1000000}MB`;
        }
        return `File ${file.file.name} was rejected. ${file.errors[0].message}`;
      });
      setError(errorMessages.join('\n'));
      return;
    }

    setError(null);

    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }

    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
   
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Call the callback to update parent component
    if (onImagesUploaded) {
      onImagesUploaded(newFiles);
    }
  }, [files, maxFiles, maxSize, onImagesUploaded]);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    
    if (onImagesUploaded) {
      onImagesUploaded(newFiles);
    }
  };



  const editImage = (index: number) => {
    setCurrentEditingImage({
      src: previews[index],
      index: index
    });
    setShowEditor(true);
  };

  const handleEditorSave = async (editedImageObject: any) => {
    if (currentEditingImage === null) return;
    
    try {      
      const res = await fetch(editedImageObject.imageBase64);
      const blob = await res.blob();
    
      const editedFile = new File([blob], files[currentEditingImage.index].name, {
        type: blob.type,
        lastModified: new Date().getTime()
      });
      
      const newFiles = [...files];
      newFiles[currentEditingImage.index] = editedFile;
      setFiles(newFiles);
      
      URL.revokeObjectURL(previews[currentEditingImage.index]); 
      const newPreviews = [...previews];
      newPreviews[currentEditingImage.index] = URL.createObjectURL(blob);
      setPreviews(newPreviews);
      
      if (onImagesUploaded) {
        onImagesUploaded(newFiles);
      }
      
      setShowEditor(false);
      setCurrentEditingImage(null);
    } catch (error) {
      console.error('Error saving edited image:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize,
  });

  return (
    <div className="mx-auto p-4 w-full">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer mb-5 transition-all duration-200 ${
          isDragActive ? 'bg-green-50 border-green-300 scale-[1.02]' : 'bg-gray-50 border-gray-300 hover:border-green-400 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <svg 
            className={`w-12 h-12 transition-colors ${isDragActive ? 'text-green-500' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isDragActive ? (
            <p className="text-green-500 font-medium text-lg">Drop the images here</p>
          ) : (
            <div>
              <p className="text-gray-700 font-medium text-lg">{uploadText || "Drag & drop images here"}</p>
              <p className="text-sm text-green-600 mt-1">or Click To Select</p>
            </div>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: JPEG, PNG, GIF, WEBP. Max size: {maxSize / 1000000}MB
          </p>
          <div className="mt-2 text-xs text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
            {files.length} / {maxFiles} images uploaded
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}





      {/* Show old UI if maxFiles is 1 */}
      {maxFiles === 1 && previews.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {previews.map((preview, index) => (
            <div 
              key={index} 
              className="relative w-24 h-24"
            >
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded-md"
              />
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <button
                  onClick={() => editImage(index)}
                  className="bg-white rounded-full text-black w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors shadow-md"
                  title="Edit Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="bg-white text-red-700 rounded-full text-2xl w-6 h-6 flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors shadow-md"
                  title="Remove Image"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slot-based Grid Layout for multiple files */}
      {maxFiles > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: maxFiles }).map((_, index) => {
          const hasImage = index < previews.length;
          
          return (
            <div
              key={index}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                hasImage 
                  ? 'border-green-500 shadow-md hover:shadow-lg' 
                  : 'border-dashed border-gray-300 bg-gray-50'
              }`}
            >
              {hasImage ? (
                // Filled slot with image
                <>
                  <img
                    src={previews[index]}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Desktop hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 hidden md:flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                    <button
                      onClick={() => editImage(index)}
                      className="bg-white rounded-full text-green-600 w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Edit Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      title="Remove Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {/* Mobile visible buttons */}
                  <div className="md:hidden absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => editImage(index)}
                      className="bg-white rounded-full text-green-600 w-7 h-7 flex items-center justify-center shadow-lg active:scale-95 transition-transform border"
                      title="Edit Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="bg-white text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow-lg active:scale-95 transition-transform border"
                      title="Remove Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {/* Image number badge */}
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md text-center">
                     Main Image
                    </div>
                  )}
                </>
              ) : (
                // Empty slot
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">Slot {index + 1}</span>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {showEditor && currentEditingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] overflow-hidden">
            <div className="h-full">
              <FilerobotImageEditor
                source={currentEditingImage.src}
                onSave={handleEditorSave}
                onClose={() => setShowEditor(false)}
                annotationsCommon={{
                  fill: '#ff0000'
                }}
                tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE, TABS.RESIZE]}
                defaultTabId={TABS.ANNOTATE}
                defaultToolId={TOOLS.TEXT}
                savingPixelRatio={4}
                previewPixelRatio={window.devicePixelRatio}
                theme={{
                  palette: {
                    'bg-primary': '#FFFFFF',
                    'accent-primary': '#16a34a',
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}