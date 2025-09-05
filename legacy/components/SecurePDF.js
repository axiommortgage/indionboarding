import { useState, useEffect } from 'react'
import getAccessibleUrl from '../helpers/getAccessibleUrl'

const SecurePDF = ({ src, title, className, style, ...props }) => {
  const [pdfSrc, setPdfSrc] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPdf = () => {
      if (!src) {
        setLoading(false)
        setError('No source URL provided')
        return
      }

      try {
        // Use the same helper function that SecureImage uses
        const accessibleUrl = getAccessibleUrl(src)
        setPdfSrc(accessibleUrl)
      } catch (err) {
        console.error('Error getting accessible URL for PDF:', err)
        setError(err.message || 'Failed to load PDF')
      } finally {
        setLoading(false)
      }
    }

    fetchPdf()
  }, [src])

  if (loading) {
    return <div className="pdf-loading">Loading PDF...</div>
  }

  if (error) {
    return <div className="pdf-error">Error loading PDF: {error}</div>
  }

  return (
    <iframe
      src={pdfSrc}
      title={title || 'PDF Document'}
      className={className}
      style={{ width: '100%', height: '500px', border: 'none', ...style }}
      {...props}
    />
  )
}

export default SecurePDF
