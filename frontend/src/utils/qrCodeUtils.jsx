export const downloadAsPng = (qrCodeRef) => {
  const svg = qrCodeRef.current.querySelector('svg'); // Get the SVG element
  if (svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Create an Image element to load the SVG data
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      // Create a canvas and draw the image onto it
      const canvas = document.createElement('canvas');
      canvas.width = 250; // Match the QR Code size
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Export the canvas as a PNG
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      // Cleanup
      URL.revokeObjectURL(url);
    };

    img.src = url; // Set the image source to the generated Blob URL
  }
};

  
  export const downloadAsSvg = (qrCodeRef) => {
    const svg = qrCodeRef.current.querySelector('svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };
  
  export const printQrCode = (qrCodeRef, size = 250) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodeHtml = qrCodeRef.current.innerHTML;
  
      // Inline styles to control size during printing
      const qrCodeStyle = `
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          div {
            width: ${size}px;
            height: ${size}px;
          }
          svg, canvas {
            width: 100% !important;
            height: 100% !important;
          }
        </style>
      `;
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            ${qrCodeStyle}
          </head>
          <body>
            <div>${qrCodeHtml}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };
  
  