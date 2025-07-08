// Utility function untuk menghitung panjang text dari content markdown/HTML
// Digunakan untuk validasi form dan rich text editor

// Utility function untuk menghitung panjang text dari content markdown/HTML
// Digunakan untuk validasi form dan rich text editor

/**
 * Menghitung panjang karakter dari content markdown atau HTML
 * @param {string} content - Content yang akan dihitung
 * @returns {number} - Jumlah karakter
 */
export const getTextLength = (content) => {
  if (!content || typeof content !== 'string') return 0;
  
  try {
    // Jika content berupa markdown, remove markdown syntax
    if (content.includes('#') || content.includes('*') || content.includes('_') || content.includes('`')) {
      return content
        .replace(/#{1,6}\s*/g, '') // Remove heading syntax (# ## ### etc)
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold syntax **text** -> text
        .replace(/\*(.*?)\*/g, '$1') // Remove italic syntax *text* -> text
        .replace(/_(.*?)_/g, '$1') // Remove italic syntax _text_ -> text
        .replace(/`(.*?)`/g, '$1') // Remove inline code syntax `text` -> text
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image syntax
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove link syntax
        .replace(/^>\s*/gm, '') // Remove blockquote syntax
        .replace(/^[-*+]\s*/gm, '') // Remove list syntax
        .replace(/^\d+\.\s*/gm, '') // Remove numbered list syntax
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim().length;
    }
    
    // Jika content berupa HTML, gunakan DOM parsing (hanya di browser)
    if (content.includes('<') && content.includes('>')) {
      // Check if we're in browser environment
      if (typeof document !== 'undefined') {
        const div = document.createElement("div");
        div.innerHTML = content;
        return (div.textContent || div.innerText || "").trim().length;
      } else {
        // Server-side: simple HTML tag removal
        return content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
          .replace(/&amp;/g, '&') // Replace &amp; with &
          .replace(/&lt;/g, '<') // Replace &lt; with <
          .replace(/&gt;/g, '>') // Replace &gt; with >
          .replace(/&quot;/g, '"') // Replace &quot; with "
          .replace(/&#39;/g, "'") // Replace &#39; with '
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim().length;
      }
    }
    
    // Jika content berupa plain text
    return content.trim().length;
    
  } catch (error) {
    console.error('Error getting text length:', error);
    return 0;
  }
};

/**
 * Validasi panjang text untuk form
 * @param {string} content - Content yang akan divalidasi
 * @param {number} minLength - Panjang minimum (default: 50)
 * @param {number} maxLength - Panjang maximum (default: 1000) 
 * @returns {object} - Hasil validasi
 */
export const validateTextLength = (content, minLength = 50, maxLength = 1000) => {
  const length = getTextLength(content);
  
  return {
    length,
    isValid: length >= minLength && length <= maxLength,
    isTooShort: length > 0 && length < minLength,
    isTooLong: length > maxLength,
    isEmpty: length === 0
  };
};
