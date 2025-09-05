import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import html2canvas from 'html-to-image';

export interface FormData {
  [key: string]: any;
}

export class PDFGenerator {
  private static async createBasePDF(): Promise<PDFDocument> {
    const pdfDoc = await PDFDocument.create();
    return pdfDoc;
  }

  private static async addFormDataToPDF(
    pdfDoc: PDFDocument,
    formData: FormData,
    title: string
  ): Promise<void> {
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;
    const leftMargin = 50;
    const lineHeight = 20;

    // Title
    page.drawText(title, {
      x: leftMargin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 40;

    // Form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && key !== 'signature' && key !== 'isFormComplete' && key !== 'lastUpdated') {
        // Format field name
        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        page.drawText(`${fieldName}:`, {
          x: leftMargin,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;

        // Handle long text
        const maxWidth = 500;
        const words = value.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const textWidth = font.widthOfTextAtSize(testLine, 10);
          
          if (textWidth > maxWidth && currentLine) {
            page.drawText(currentLine, {
              x: leftMargin + 20,
              y: yPosition,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          page.drawText(currentLine, {
            x: leftMargin + 20,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }

        yPosition -= 10; // Extra space between fields
      }
    });

    // Add signature if present
    if (formData.signature) {
      yPosition -= 20;
      page.drawText('Signature:', {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 30;
      page.drawText('[Digital Signature Applied]', {
        x: leftMargin + 20,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Add timestamp
    yPosition -= 40;
    const timestamp = new Date().toLocaleString();
    page.drawText(`Generated on: ${timestamp}`, {
      x: leftMargin,
      y: yPosition,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  public static async generateFormPDF(
    formData: FormData,
    formTitle: string
  ): Promise<Uint8Array> {
    try {
      const pdfDoc = await this.createBasePDF();
      await this.addFormDataToPDF(pdfDoc, formData, formTitle);
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  public static async downloadPDF(pdfBytes: Uint8Array, filename: string): Promise<void> {
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  public static async generateAllFormsPDF(
    allForms: { [key: string]: FormData },
    userInfo: { firstName?: string; lastName?: string }
  ): Promise<Uint8Array> {
    try {
      const pdfDoc = await this.createBasePDF();
      
      // Cover page
      const coverPage = pdfDoc.addPage([612, 792]);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      coverPage.drawText('Onboarding Package', {
        x: 200,
        y: 700,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      if (userInfo.firstName && userInfo.lastName) {
        coverPage.drawText(`${userInfo.firstName} ${userInfo.lastName}`, {
          x: 200,
          y: 650,
          size: 18,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      coverPage.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
        x: 200,
        y: 600,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // Add each form
      const formTitles: { [key: string]: string } = {
        brokerInfo: 'Broker Information',
        unlicensedInfo: 'Unlicensed Information',
        businessCardInfo: 'Business Card Information',
        contractAndSchedule: 'Contract and Schedule',
        letterOfDirection: 'Letter of Direction',
        mpcApplication: 'MPC Application',
        paymentAuthorization: 'Payment Authorization',
        photos: 'Photos',
        policiesAndProcedure: 'Policies and Procedures',
        unlicensedPolicies: 'Unlicensed Policies',
        websiteInfo: 'Website Information',
      };

      Object.entries(allForms).forEach(([formKey, formData]) => {
        if (formData && Object.keys(formData).length > 0) {
          const title = formTitles[formKey] || formKey;
          this.addFormDataToPDF(pdfDoc, formData, title);
        }
      });

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error generating complete PDF:', error);
      throw new Error('Failed to generate complete PDF package');
    }
  }
}

// Utility functions for form-specific PDF generation
export const generateBrokerInfoPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Broker Information Form');

export const generateUnlicensedInfoPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Unlicensed Information Form');

export const generateBusinessCardPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Business Card Information Form');

export const generateContractPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Contract and Schedule Form');

export const generateLetterOfDirectionPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Letter of Direction Form');

export const generateMpcApplicationPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'MPC Application Form');

export const generatePaymentAuthPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Payment Authorization Form');

export const generatePoliciesPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Policies and Procedures Form');

export const generateWebsiteInfoPDF = (formData: FormData) => 
  PDFGenerator.generateFormPDF(formData, 'Website Information Form');

export const downloadFormPDF = async (formData: FormData, formTitle: string, filename: string) => {
  const pdfBytes = await PDFGenerator.generateFormPDF(formData, formTitle);
  await PDFGenerator.downloadPDF(pdfBytes, filename);
};

export const downloadAllFormsPDF = async (
  allForms: { [key: string]: FormData },
  userInfo: { firstName?: string; lastName?: string },
  filename: string = 'onboarding-package.pdf'
) => {
  const pdfBytes = await PDFGenerator.generateAllFormsPDF(allForms, userInfo);
  await PDFGenerator.downloadPDF(pdfBytes, filename);
};
