import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TableLayoutType, HeadingLevel, AlignmentType } from 'docx';

export const exportToCSV = (data, filename = 'inventory_data', columns) => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    let filteredColumns = columns;
    if (columns) {
      filteredColumns = columns.filter(col => col.label !== 'Action');
    }

    const headers = filteredColumns ? filteredColumns.map(col => col.label) : Object.keys(data[0]);
    const keys = filteredColumns ? filteredColumns.map(col => col.key) : Object.keys(data[0]);
    
    const isUpdatedTab = filteredColumns && filteredColumns.some(col => col.label === "Changed Details");
    
    let finalHeaders = headers;
    let finalKeys = keys;
    
    if (isUpdatedTab) {
      const changedDetailsIndex = headers.findIndex(h => h === "Changed Details");
      if (changedDetailsIndex !== -1) {
        finalHeaders.splice(changedDetailsIndex, 1, "Old Value", "New Value");
        finalKeys.splice(changedDetailsIndex, 1, "old_value", "new_value");
      }
    }
    
    const csvContent = [
      finalHeaders.join(','),
      ...data.map(row => 
        finalKeys.map(key => {
          let value;
          if (isUpdatedTab && (key === "old_value" || key === "new_value")) {
            const fieldValue = row[key];
            if (Array.isArray(fieldValue)) {
              value = fieldValue.join(", ");
            } else {
              value = fieldValue ?? '';
            }
          } else {
            value = row[key] ?? '';
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'CSV exported successfully!' };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, message: `Error exporting to CSV: ${error.message}` };
  }
};

export const exportToPDF = (data, filename = 'inventory_data', columns) => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    let filteredColumns = columns;
    if (columns) {
      filteredColumns = columns.filter(col => col.label !== 'Action');
    }

    const headers = filteredColumns ? filteredColumns.map(col => col.label) : Object.keys(data[0]);
    const keys = filteredColumns ? filteredColumns.map(col => col.key) : Object.keys(data[0]);
    
    const isUpdatedTab = filteredColumns && filteredColumns.some(col => col.label === "Changed Details");
    
    let finalHeaders = headers;
    let finalKeys = keys;
    
    if (isUpdatedTab) {
      const changedDetailsIndex = headers.findIndex(h => h === "Changed Details");
      if (changedDetailsIndex !== -1) {
        finalHeaders.splice(changedDetailsIndex, 1, "Old Value", "New Value");
        finalKeys.splice(changedDetailsIndex, 1, "old_value", "new_value");
      }
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const rowHeight = 8;
    const titleHeight = 15;
    const subtitleHeight = 8;
    
    let currentY = margin;

    const wrapText = (text, maxWidth) => {
      const str = String(text ?? '');
      if (!str) return [''];
      
      const textWidth = doc.getTextWidth(str);
      if (textWidth <= maxWidth) {
        return [str];
      }
      
      const words = str.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (let word of words) {
        const wordWidth = doc.getTextWidth(word);
        if (wordWidth > maxWidth) {
          if (currentLine) {
            lines.push(currentLine.trim());
            currentLine = '';
          }
          
          let charLine = '';
          for (let char of word) {
            const testCharLine = charLine + char;
            const testWidth = doc.getTextWidth(testCharLine);
            
            if (testWidth > maxWidth) {
              if (charLine) {
                lines.push(charLine);
                charLine = char;
              } else {
                lines.push(char);
                charLine = '';
              }
            } else {
              charLine = testCharLine;
            }
          }
          
          if (charLine) {
            currentLine = charLine;
          }
        } else {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          const testWidth = doc.getTextWidth(testLine);
          
          if (testWidth > maxWidth && currentLine !== '') {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      
      return lines.length > 0 ? lines : [''];
    };

    const drawTitle = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      const title = 'Inventory Management System - Export Report';
      const titleWidth = doc.getTextWidth(title);
      doc.text(title, (pageWidth - titleWidth) / 2, currentY);
      currentY += titleHeight;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const subtitle = `Generated on: ${new Date().toLocaleString()}`;
      const subtitleWidth = doc.getTextWidth(subtitle);
      doc.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY);
      currentY += subtitleHeight;
    };

    const drawRow = (rowData, isHeader = false) => {
      let x = margin;
      let maxRowHeight = rowHeight;
      
      finalHeaders.forEach((header, index) => {
        const cellWidth = scaledWidths[header] || 20;
        let cellValue;
        
        if (isHeader) {
          cellValue = header;
        } else {
          const key = finalKeys[index];
          if (isUpdatedTab && (key === "old_value" || key === "new_value")) {
            const value = rowData[key];
            if (Array.isArray(value)) {
              cellValue = value.join(", ");
            } else {
              cellValue = value ?? '';
            }
          } else {
            cellValue = rowData[key] ?? '';
          }
        }
        
        const wrappedText = wrapText(cellValue, cellWidth - 2);
        const cellHeight = Math.max(rowHeight, wrappedText.length * 4);
        maxRowHeight = Math.max(maxRowHeight, cellHeight);
        
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.rect(x, currentY, cellWidth, cellHeight);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
        doc.setTextColor(0);
        
        wrappedText.forEach((line, lineIndex) => {
          const textY = currentY + 3 + (lineIndex * 4);
          if (textY < pageHeight - margin) {
            doc.text(line, x + 1, textY);
          }
        });
        
        x += cellWidth;
      });
      
      currentY += maxRowHeight;
    };

    const availableWidth = pageWidth - (margin * 2);
    const columnCount = finalHeaders.length;
    const baseWidth = availableWidth / columnCount;
    
    const scaledWidths = {};
    finalHeaders.forEach(header => {
      scaledWidths[header] = Math.max(baseWidth, 20);
    });

    drawTitle();
    
    drawRow(finalHeaders, true);
    
    data.forEach((row, index) => {
      if (currentY > pageHeight - margin - 20) {
        doc.addPage();
        currentY = margin;
        drawTitle();
        drawRow(finalHeaders, true);
      }
      drawRow(row, false);
    });

    doc.save(`${filename}.pdf`);
    return { success: true, message: 'PDF exported successfully!' };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, message: `Error exporting to PDF: ${error.message}` };
  }
};

export const exportToDOCX = async (data, filename = 'inventory_data', columns) => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    let filteredColumns = columns;
    if (columns) {
      filteredColumns = columns.filter(col => col.label !== 'Action');
    }

    const headers = filteredColumns ? filteredColumns.map(col => col.label) : Object.keys(data[0]);
    const keys = filteredColumns ? filteredColumns.map(col => col.key) : Object.keys(data[0]);
    
    const isUpdatedTab = filteredColumns && filteredColumns.some(col => col.label === "Changed Details");
    
    let finalHeaders = headers;
    let finalKeys = keys;
    
    if (isUpdatedTab) {
      const changedDetailsIndex = headers.findIndex(h => h === "Changed Details");
      if (changedDetailsIndex !== -1) {
        finalHeaders.splice(changedDetailsIndex, 1, "Old Value", "New Value");
        finalKeys.splice(changedDetailsIndex, 1, "old_value", "new_value");
      }
    }

    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          new Paragraph({
            text: "Inventory Management System - Export Report",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleString()}`,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            layout: TableLayoutType.AUTO,
            rows: [
              new TableRow({
                children: finalHeaders.map(header => 
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: header,
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: "CCCCCC",
                    },
                    width: {
                      size: 100 / finalHeaders.length,
                      type: WidthType.PERCENTAGE,
                    },
                  })
                ),
              }),
              ...data.map(row => 
                new TableRow({
                  children: finalKeys.map(key => {
                    let value;
                    if (isUpdatedTab && (key === "old_value" || key === "new_value")) {
                      const fieldValue = row[key];
                      if (Array.isArray(fieldValue)) {
                        value = fieldValue.join(", ");
                      } else {
                        value = fieldValue ?? '';
                      }
                    } else {
                      value = row[key] ?? '';
                    }
                    
                    return new TableCell({
                      children: [
                        new Paragraph({
                          text: String(value),
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      width: {
                        size: 100 / finalKeys.length,
                        type: WidthType.PERCENTAGE,
                      },
                    });
                  }),
                })
              ),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'DOCX exported successfully!' };
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    return { success: false, message: `Error exporting to DOCX: ${error.message}` };
  }
};

export const exportToImage = async (data, filename = 'inventory_data', columns) => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    let filteredColumns = columns;
    if (columns) {
      filteredColumns = columns.filter(col => col.label !== 'Action');
    }

    const headers = filteredColumns ? filteredColumns.map(col => col.label) : Object.keys(data[0]);
    const keys = filteredColumns ? filteredColumns.map(col => col.key) : Object.keys(data[0]);
    
    const isUpdatedTab = filteredColumns && filteredColumns.some(col => col.label === "Changed Details");
    
    let finalHeaders = headers;
    let finalKeys = keys;
    
    if (isUpdatedTab) {
      const changedDetailsIndex = headers.findIndex(h => h === "Changed Details");
      if (changedDetailsIndex !== -1) {
        finalHeaders.splice(changedDetailsIndex, 1, "Old Value", "New Value");
        finalKeys.splice(changedDetailsIndex, 1, "old_value", "new_value");
      }
    }

    const tableHTML = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white; 
            }
            .title { 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            .subtitle { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
              margin-bottom: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 10px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: center; 
              word-wrap: break-word; 
              word-break: break-word;
              max-width: 150px; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
          </style>
        </head>
        <body>
          <div class="title">Inventory Management System - Export Report</div>
          <div class="subtitle">Generated on: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                ${finalHeaders.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${finalKeys.map(key => {
                    let value;
                    if (isUpdatedTab && (key === "old_value" || key === "new_value")) {
                      const fieldValue = row[key];
                      if (Array.isArray(fieldValue)) {
                        value = fieldValue.join(", ");
                      } else {
                        value = fieldValue ?? '';
                      }
                    } else {
                      value = row[key] ?? '';
                    }
                    return `<td>${String(value)}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const container = document.createElement('div');
    container.innerHTML = tableHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: container.scrollWidth,
      height: container.scrollHeight,
    });

    document.body.removeChild(container);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');

    return { success: true, message: 'Image exported successfully!' };
  } catch (error) {
    console.error('Error exporting to image:', error);
    return { success: false, message: `Error exporting to image: ${error.message}` };
  }
};

export const exportData = async (data, format, filename, type = 'inventory', columns) => {
  switch (format.toLowerCase()) {
    case 'csv':
    case 'excel':
    case 'xlsx':
      return exportToCSV(data, filename, columns);
    
    case 'text':
    case 'txt':
      return exportToText(data, filename, columns);
    
    case 'pdf':
      return exportToPDF(data, filename, columns);
    
    case 'docx':
      return exportToDOCX(data, filename, columns);
    
    case 'image':
    case 'png':
      return exportToImage(data, filename, columns);
    
    default:
      return { success: false, message: 'Unsupported export format' };
  }
};

export const exportToText = (data, filename = 'inventory_data', columns) => {
  try {
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    let filteredColumns = columns;
    if (columns) {
      filteredColumns = columns.filter(col => col.label !== 'Action');
    }

    const headers = filteredColumns ? filteredColumns.map(col => col.label) : Object.keys(data[0]);
    const keys = filteredColumns ? filteredColumns.map(col => col.key) : Object.keys(data[0]);
    
    const isUpdatedTab = filteredColumns && filteredColumns.some(col => col.label === "Changed Details");
    
    let finalHeaders = headers;
    let finalKeys = keys;
    
    if (isUpdatedTab) {
      const changedDetailsIndex = headers.findIndex(h => h === "Changed Details");
      if (changedDetailsIndex !== -1) {
        finalHeaders.splice(changedDetailsIndex, 1, "Old Value", "New Value");
        finalKeys.splice(changedDetailsIndex, 1, "old_value", "new_value");
      }
    }

    const title = "Inventory Management System - Export Report";
    const subtitle = `Generated on: ${new Date().toLocaleString()}`;
    const separator = "=".repeat(80);
    
    let content = `${title}\n${subtitle}\n${separator}\n\n`;
    
    content += finalHeaders.join('\t') + '\n';
    content += "-".repeat(finalHeaders.join('\t').length) + '\n';
    
    data.forEach(row => {
      const rowData = finalKeys.map(key => {
        let value;
        if (isUpdatedTab && (key === "old_value" || key === "new_value")) {
          const fieldValue = row[key];
          if (Array.isArray(fieldValue)) {
            value = fieldValue.join(", ");
          } else {
            value = fieldValue ?? '';
          }
        } else {
          value = row[key] ?? '';
        }
        return String(value);
      });
      content += rowData.join('\t') + '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, message: 'Text file exported successfully!' };
  } catch (error) {
    console.error('Error exporting to text:', error);
    return { success: false, message: `Error exporting to text: ${error.message}` };
  }
}; 