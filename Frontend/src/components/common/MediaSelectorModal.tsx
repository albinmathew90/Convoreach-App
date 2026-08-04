import { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../../pages/Settings/MediaLibrarySection';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url: string; filename: string; originalName: string; mimetype: string }) => void;
  defaultFilter?: 'image' | 'video' | 'document' | 'audio' | 'all';
}

export default function MediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  defaultFilter = 'all'
}: MediaSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [filterType, setFilterType] = useState<string>(defaultFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('crm_token');
      const res = await fetch('/openwa-api/crm/media', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMediaItems(data.map((item: any) => ({
          ...item,
          url: `/openwa-api/crm/media/file/${item.filename}`,
          createdAt: new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        })));
      }
    } catch (e) {
      console.error('Failed to fetch media library', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setFilterType(defaultFilter);
      setSelectedItem(null);
    }
  }, [isOpen, defaultFilter]);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const token = sessionStorage.getItem('crm_token');
    let lastUploadedItem = null;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/openwa-api/crm/media/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          const item = await res.json();
          lastUploadedItem = {
            ...item,
            url: `/openwa-api/crm/media/file/${item.filename}`,
            createdAt: new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          };
        }
      }
      await fetchMedia();
      if (lastUploadedItem) {
        setSelectedItem(lastUploadedItem);
        setActiveTab('library');
      }
    } catch (e) {
      console.error('Upload error', e);
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'image') return item.mimetype.startsWith('image/');
    if (filterType === 'video') return item.mimetype.startsWith('video/');
    if (filterType === 'audio') return item.mimetype.startsWith('audio/');
    if (filterType === 'document') return !item.mimetype.startsWith('image/') && !item.mimetype.startsWith('video/') && !item.mimetype.startsWith('audio/');
    return true;
  });

  const getFileBadge = (originalName: string, mimetype: string) => {
    const extMatch = originalName?.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch && extMatch[1]) {
      return extMatch[1].toUpperCase();
    }
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'DOCX';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'XLSX';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'PPTX';
    if (mimetype.includes('zip') || mimetype.includes('archive')) return 'ZIP';
    if (mimetype.startsWith('audio/')) return 'AUDIO';
    if (mimetype.startsWith('video/')) return 'VIDEO';
    return 'DOC';
  };

  const formatFriendlyMimeType = (mimetype: string, originalName: string) => {
    if (mimetype.startsWith('image/')) {
      const sub = mimetype.split('/')[1] || 'image';
      return `Image (${sub.toUpperCase()})`;
    }
    if (mimetype.startsWith('video/')) {
      const sub = mimetype.split('/')[1] || 'video';
      return `Video (${sub.toUpperCase()})`;
    }
    if (mimetype.startsWith('audio/')) {
      const sub = mimetype.split('/')[1] || 'audio';
      return `Audio (${sub.toUpperCase()})`;
    }
    if (mimetype.includes('pdf') || originalName?.toLowerCase().endsWith('.pdf')) {
      return 'PDF Document';
    }
    if (mimetype.includes('word') || mimetype.includes('document') || originalName?.toLowerCase().endsWith('.doc') || originalName?.toLowerCase().endsWith('.docx')) {
      return 'Word Document (DOCX)';
    }
    if (mimetype.includes('sheet') || mimetype.includes('excel') || originalName?.toLowerCase().endsWith('.xls') || originalName?.toLowerCase().endsWith('.xlsx') || originalName?.toLowerCase().endsWith('.csv')) {
      return 'Spreadsheet (XLSX)';
    }
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint') || originalName?.toLowerCase().endsWith('.ppt') || originalName?.toLowerCase().endsWith('.pptx')) {
      return 'Presentation (PPTX)';
    }
    if (mimetype.includes('zip') || mimetype.includes('archive') || originalName?.toLowerCase().endsWith('.zip')) {
      return 'Archive (ZIP)';
    }
    return `Document (${getFileBadge(originalName, mimetype)})`;
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-gray-800 text-white">
          <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    if (mimetype.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-purple-900 text-white">
          <svg className="w-12 h-12 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <svg className="w-14 h-14 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1 14H9v-2h6v2zm0-4H9v-2h6v2zm-2-5V3.5L18.5 9H13z"/>
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Media</h2>
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'library'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Media Library
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Upload Files
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'upload' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
              <div className="max-w-md w-full p-10 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 flex flex-col items-center text-center shadow-sm">
                <svg className="w-16 h-16 text-blue-500 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">Drop files to upload</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">or select from your computer</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  multiple
                  className="hidden"
                />
                <button
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Select Files'}
                </button>
                <p className="text-[11px] text-gray-400 mt-4">Maximum upload file size: 50 MB.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Center Media Grid */}
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
                {/* Filter Toolbar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All media items</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                    <option value="audio">Audio</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                  />
                </div>

                {/* Grid Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {loading ? (
                    <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">Loading library...</div>
                  ) : filteredItems.length === 0 ? (
                    <div className="py-20 text-center text-sm text-gray-500 dark:text-gray-400">No media found. Switch to "Upload Files" to add items.</div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
                      {filteredItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={`group relative aspect-square rounded-sm overflow-hidden border bg-gray-100 dark:bg-gray-800 flex flex-col justify-between cursor-pointer transition-all ${
                            selectedItem?.id === item.id
                              ? 'border-2 border-blue-600 ring-2 ring-blue-600 shadow-md'
                              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                          }`}
                        >
                          <div className="h-3/4 w-full relative overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-800/80">
                            {item.mimetype.startsWith('image/') ? (
                              <img
                                src={item.url}
                                alt={item.originalName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              getFileIcon(item.mimetype)
                            )}
                          </div>
                          <div className="h-1/4 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-1 flex items-center justify-start">
                            <p className="text-[11px] text-gray-800 dark:text-gray-200 truncate font-normal leading-tight w-full" title={item.originalName}>
                              {item.originalName.replace(/\.[^/.]+$/, "")}
                            </p>
                          </div>
                          {selectedItem?.id === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded p-0.5 shadow z-10">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Details */}
              <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col justify-between shrink-0">
                {selectedItem ? (
                  <div className="p-5 overflow-y-auto flex-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                      Attachment Details
                    </h3>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-950 rounded-lg overflow-hidden mb-4 flex items-center justify-center border border-gray-200 dark:border-gray-800">
                      {selectedItem.mimetype.startsWith('image/') ? (
                        <img src={selectedItem.url} alt={selectedItem.originalName} className="max-w-full max-h-full object-contain" />
                      ) : (
                        getFileIcon(selectedItem.mimetype)
                      )}
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-semibold text-gray-400 block text-[10px] uppercase">Name:</span>
                        <span className="break-all font-medium">{selectedItem.originalName}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-400 block text-[10px] uppercase">Type:</span>
                        <span>{formatFriendlyMimeType(selectedItem.mimetype, selectedItem.originalName)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-400 block text-[10px] uppercase">Uploaded:</span>
                        <span>{selectedItem.createdAt}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 my-auto">
                    Select an item from the library to view details and insert it.
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!selectedItem}
                    onClick={() => {
                      if (selectedItem) {
                        onSelect({
                          url: selectedItem.url,
                          filename: selectedItem.filename,
                          originalName: selectedItem.originalName,
                          mimetype: selectedItem.mimetype,
                        });
                        onClose();
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:cursor-not-allowed"
                  >
                    Select Item
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
