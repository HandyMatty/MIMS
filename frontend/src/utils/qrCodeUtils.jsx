import SINSSILogo from '../../assets/SINSSI_LOGO-removebg-preview.png?url';

export const downloadAsPng = (qrCodeRef) => {
  const svg = qrCodeRef.current.querySelector('svg');
  if (svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 250;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const logoImg = new Image();
      logoImg.src = SINSSILogo;

      logoImg.onload = () => {
        const logoSize = 60;
        const centerX = (canvas.width - logoSize) / 2;
        const centerY = (canvas.height - logoSize) / 2;

        ctx.fillStyle = 'transparent';
        ctx.fillRect(centerX - 4, centerY - 4, logoSize + 8, logoSize + 8);

        ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        URL.revokeObjectURL(url);
      };
    };

    img.src = url;
  }
};

export const downloadAsSvg = async (qrCodeRef) => {
  const svg = qrCodeRef.current.querySelector('svg');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const qrSvgString = serializer.serializeToString(svg);

  const logoSize = 50;

  const width = parseInt(svg.getAttribute('width')) || 250;
  const height = parseInt(svg.getAttribute('height')) || 250;

  const centerX = (width - logoSize) / 2;
  const centerY = (height - logoSize) / 2;

  const toBase64 = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });

  const base64Logo = await toBase64(SINSSILogo);

  const combinedSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${qrSvgString}
      </g>
      <rect x="${centerX - 4}" y="${centerY - 4}" width="${logoSize + 8}" height="${logoSize + 8}" fill="transparent"/>
      <image 
        href="${base64Logo}" 
        x="${centerX}" 
        y="${centerY}" 
        width="${logoSize}" 
        height="${logoSize}" 
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  `;

  const blob = new Blob([combinedSvg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = 'qrcode.svg';
  link.href = URL.createObjectURL(blob);
  link.click();

  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};


export const printQrCode = (qrCodeRef, size = 250) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const qrCodeHtml = qrCodeRef.current.innerHTML;

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
