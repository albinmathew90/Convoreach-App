
interface ButtonProps {
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  value?: string;
}

interface WhatsAppPreviewProps {
  type: string;
  headerText?: string;
  bodyText?: string;
  footerText?: string;
  mediaUrl?: string;
  buttons?: ButtonProps[];
  locationData?: {
    locationName: string;
    locationAddress: string;
    locationLat: string;
    locationLong: string;
  };
  carouselCards?: any[];
  catalogData?: {
    catalogId: string;
    catalogThumbnail: string;
  };
}

export default function WhatsAppPreview({ 
  type, 
  headerText, 
  bodyText, 
  footerText, 
  mediaUrl, 
  buttons,
  locationData,
  carouselCards,
  catalogData
}: WhatsAppPreviewProps) {
  
  const hasContent = headerText || bodyText || footerText || mediaUrl || (buttons && buttons.length > 0) ||
    (type === 'Location' && (locationData?.locationName || locationData?.locationAddress)) ||
    (type === 'Carousel' && carouselCards && carouselCards.length > 0) ||
    (type === 'Catalog' && catalogData?.catalogId);

  // Replace variable syntax with highlighted spans for preview
  const formatText = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(\{\{.*?\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        return <span key={i} className="bg-brand-100 text-brand-700 px-1 py-0.5 rounded text-xs mx-0.5 dark:bg-brand-500/20 dark:text-brand-300 font-mono">{part}</span>;
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2rem] border-[8px] border-gray-900 bg-[#E5DDD5] dark:border-gray-800 dark:bg-[#0B141A] shadow-xl relative aspect-[9/19]">
      
      {/* WhatsApp Header Mock */}
      <div className="bg-[#075E54] dark:bg-[#202C33] h-16 flex items-center px-4 gap-3 text-white shadow-sm z-10 relative">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        </div>
        <div>
          <p className="font-semibold text-[15px] leading-tight">Customer</p>
          <p className="text-xs text-white/70">online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar flex flex-col gap-2 pb-20">
        
        {!hasContent ? (
          <div className="flex justify-center mt-10">
            <span className="bg-[#D4EAF6] dark:bg-[#182229] text-gray-600 dark:text-gray-400 text-xs py-1.5 px-3 rounded-lg shadow-sm">
              Preview will appear here
            </span>
          </div>
        ) : type === 'Carousel' ? (
          <div className="flex flex-col gap-1 w-full">
            {/* Global Body/Footer/Buttons */}
            {(bodyText || footerText || (buttons && buttons.length > 0)) && (
              <div className="self-start max-w-[85%] relative mb-1">
                {(bodyText || footerText) && (
                  <div className="bg-white dark:bg-[#202C33] rounded-lg rounded-tl-none p-1.5 shadow-sm text-[#111B21] dark:text-[#E9EDEF]">
                    <div className="px-1.5 pb-2 pt-1 flex flex-col gap-1.5">
                      {bodyText && <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{formatText(bodyText)}</p>}
                      {footerText && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{formatText(footerText)}</p>}
                    </div>
                  </div>
                )}
                {buttons && buttons.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 w-full">
                    {buttons.map((btn, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#202C33] rounded-lg p-2.5 text-center text-[14px] text-[#00A884] shadow-sm flex items-center justify-center gap-2 cursor-default">
                         {btn.type === 'url' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                         ) : btn.type === 'phone' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                         ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                         )}
                         {btn.text || 'Button'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Carousel Cards */}
            <div className="w-full overflow-x-auto pb-2 flex gap-2 snap-x snap-mandatory">
              {carouselCards?.map((card, idx) => (
                <div key={idx} className="shrink-0 w-[85%] snap-center self-start flex flex-col">
                  <div className="bg-white dark:bg-[#202C33] rounded-lg p-1.5 shadow-sm text-[#111B21] dark:text-[#E9EDEF]">
                    {card.mediaUrl && (
                      <div className="rounded-md overflow-hidden mb-1.5 bg-gray-100 dark:bg-gray-800 aspect-video w-full min-w-[180px] flex items-center justify-center relative">
                        <img src={card.mediaUrl} alt="Card Media" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="px-1.5 pb-2 pt-1 flex flex-col gap-1.5">
                      {card.body && <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{formatText(card.body)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="self-start max-w-[85%] relative">
            <div className="bg-white dark:bg-[#202C33] rounded-lg rounded-tl-none p-1.5 shadow-sm text-[#111B21] dark:text-[#E9EDEF]">
              
              {/* Media */}
              {(type === 'Image' || type === 'Video' || type === 'Document' || type === 'image' || type === 'video' || type === 'file' || type === 'document') && mediaUrl && (
                <>
                  {(type === 'Image' || type === 'image') && (
                    <div className="rounded-md overflow-hidden mb-1.5 bg-gray-100 dark:bg-gray-800 aspect-video w-full min-w-[240px] flex items-center justify-center relative">
                      <img src={mediaUrl} alt="Template Media" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {(type === 'Video' || type === 'video') && (
                    <div className="rounded-md overflow-hidden mb-1.5 bg-black/90 aspect-video w-full min-w-[240px] flex items-center justify-center relative group">
                      <video src={mediaUrl} className="w-full h-full object-cover opacity-85" preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition">
                        <div className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center pl-0.5 shadow-lg border border-white/20">
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </div>
                  )}
                  {(type === 'Document' || type === 'file' || type === 'document') && (
                    <div className="w-full min-w-[240px] bg-[#F0F2F5] dark:bg-[#111B21] rounded-lg p-3 flex items-center justify-between gap-3 border border-black/5 dark:border-white/5 mb-1.5 shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {mediaUrl.split('/').pop() || 'Document.pdf'}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                            {mediaUrl.endsWith('.pdf') ? 'PDF' : mediaUrl.endsWith('.docx') || mediaUrl.endsWith('.doc') ? 'DOCX' : mediaUrl.split('.').pop()?.toUpperCase() || 'DOCUMENT'} • Document
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 shrink-0 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </div>
                    </div>
                  )}
                </>
              )}

              {type === 'Location' && (
                <div className="rounded-md overflow-hidden mb-1.5 bg-gray-200 dark:bg-gray-800 aspect-video flex flex-col items-center justify-center relative relative">
                  <svg className="w-10 h-10 text-brand-500 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Map View</span>
                </div>
              )}

              {type === 'Catalog' && (
                <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-2 mb-2">
                  <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {catalogData?.catalogThumbnail ? (
                      <img src={catalogData.catalogThumbnail} alt="Catalog Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight truncate">View catalog on WhatsApp</span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 break-words">Browse pictures and details of our offerings.</span>
                  </div>
                </div>
              )}

              <div className="px-1.5 pb-1 pt-1 flex flex-col gap-1.5">
                {/* Header */}
                {headerText && type === 'Text' && (
                  <p className="font-bold text-[15px]">{formatText(headerText)}</p>
                )}
                {type === 'Location' && (
                  <>
                    {locationData?.locationName && <p className="font-bold text-[15px]">{formatText(locationData.locationName)}</p>}
                    {locationData?.locationAddress && <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-snug">{formatText(locationData.locationAddress)}</p>}
                  </>
                )}


                {/* Body */}
                {bodyText && (
                  <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">{formatText(bodyText)}</p>
                )}

                {/* Footer */}
                {footerText && (
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">{formatText(footerText)}</p>
                )}
                
                {/* Timestamp placeholder */}
                <div className="flex justify-end mt-[-8px]">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">12:00 PM</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            {type === 'Catalog' ? (
              <div className="flex flex-col gap-[2px] mt-[2px]">
                <div className="bg-white dark:bg-[#202C33] rounded-lg shadow-sm py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition">
                  <span className="text-[14px] text-[#00A884] font-medium truncate">View catalog</span>
                </div>
              </div>
            ) : (
              buttons && buttons.length > 0 && (
                <div className="flex flex-col gap-[2px] mt-[2px]">
                  {buttons.map((btn, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#202C33] rounded-lg shadow-sm py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition">
                      {btn.type === 'url' ? (
                        <svg className="w-4 h-4 text-[#00A884]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      ) : btn.type === 'phone' ? (
                        <svg className="w-4 h-4 text-[#00A884]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#00A884]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                      )}
                      <span className="text-[14px] text-[#00A884] font-medium truncate">{formatText(btn.text)}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}
