import { 
  getFileExtension, 
  getFileExtensionWithDot, 
  shouldUseDocViewer, 
  canDisplayInline, 
  getFileTypeBadge,
  validateFileExtension 
} from '../file-utils';

describe('File Utils', () => {
  describe('getFileExtension', () => {
    it('should handle nested extensions correctly', () => {
      const fileInfo = {
        ext: '.docx.pdf',
        url: 'https://example.com/file.docx.pdf',
        name: 'Indi Email .docx.pdf',
        mime: 'application/pdf'
      };
      
      expect(getFileExtension(fileInfo)).toBe('pdf');
    });

    it('should prioritize ext property over other sources', () => {
      const fileInfo = {
        ext: '.pdf',
        url: 'https://example.com/file.docx',
        name: 'document.docx',
        mime: 'application/pdf'
      };
      
      expect(getFileExtension(fileInfo)).toBe('pdf');
    });

    it('should handle URLs with query parameters', () => {
      const fileInfo = {
        url: 'https://example.com/file.pdf?param=value',
        name: 'document.pdf'
      };
      
      expect(getFileExtension(fileInfo)).toBe('pdf');
    });

    it('should handle MIME type fallback', () => {
      const fileInfo = {
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      
      expect(getFileExtension(fileInfo)).toBe('docx');
    });

    it('should return empty string for unsupported files', () => {
      const fileInfo = {};
      
      expect(getFileExtension(fileInfo)).toBe('');
    });
  });

  describe('getFileExtensionWithDot', () => {
    it('should add leading dot to extension', () => {
      const fileInfo = { ext: 'pdf' };
      expect(getFileExtensionWithDot(fileInfo)).toBe('.pdf');
    });

    it('should handle empty extension', () => {
      const fileInfo = {};
      expect(getFileExtensionWithDot(fileInfo)).toBe('');
    });
  });

  describe('shouldUseDocViewer', () => {
    it('should return true for Office documents', () => {
      expect(shouldUseDocViewer({ ext: 'docx' })).toBe(true);
      expect(shouldUseDocViewer({ ext: 'xlsx' })).toBe(true);
      expect(shouldUseDocViewer({ ext: 'pptx' })).toBe(true);
    });

    it('should return false for non-Office documents', () => {
      expect(shouldUseDocViewer({ ext: 'pdf' })).toBe(false);
      expect(shouldUseDocViewer({ ext: 'txt' })).toBe(false);
    });
  });

  describe('canDisplayInline', () => {
    it('should return true for supported document types', () => {
      expect(canDisplayInline({ ext: 'pdf' })).toBe(true);
      expect(canDisplayInline({ ext: 'docx' })).toBe(true);
      expect(canDisplayInline({ ext: 'txt' })).toBe(true);
    });

    it('should return false for unsupported types', () => {
      expect(canDisplayInline({ ext: 'zip' })).toBe(false);
      expect(canDisplayInline({ ext: 'exe' })).toBe(false);
    });
  });

  describe('getFileTypeBadge', () => {
    it('should return correct badge for PDF files', () => {
      const result = getFileTypeBadge({ ext: 'pdf' });
      expect(result.label).toBe('PDF');
      expect(result.variant).toBe('destructive');
    });

    it('should return correct badge for Word files', () => {
      const result = getFileTypeBadge({ ext: 'docx' });
      expect(result.label).toBe('Word');
      expect(result.variant).toBe('default');
    });

    it('should handle unknown extensions', () => {
      const result = getFileTypeBadge({ ext: 'xyz' });
      expect(result.label).toBe('XYZ');
      expect(result.variant).toBe('secondary');
    });
  });

  describe('validateFileExtension', () => {
    it('should detect extension mismatches', () => {
      const fileInfo = {
        ext: '.docx',
        url: 'https://example.com/file.pdf',
        name: 'document.xlsx'
      };
      
      const result = validateFileExtension(fileInfo);
      expect(result.isValid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.detectedExt).toBe('docx'); // Should prioritize ext property
    });

    it('should handle consistent extensions', () => {
      const fileInfo = {
        ext: '.pdf',
        url: 'https://example.com/file.pdf',
        name: 'document.pdf'
      };
      
      const result = validateFileExtension(fileInfo);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBe(0);
      expect(result.detectedExt).toBe('pdf');
    });

    it('should handle files with no extension', () => {
      const fileInfo = {};
      
      const result = validateFileExtension(fileInfo);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('No file extension could be detected');
    });
  });
});
