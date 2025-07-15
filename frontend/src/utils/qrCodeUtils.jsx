import SINSSILogo from '../../assets/SINSSI_LOGO-removebg-preview.png?url';
import QRCode from 'qrcode';

export const QR_SIZES = {
  SMALL: 80,
  MEDIUM: 150,
  LARGE: 350
};

export const getStandardizedItemData = (item) => ({
  id: item.id || "N/A",
  type: item.type || "N/A",
  brand: item.brand || "N/A",
  remarks: item.remarks || "N/A",
  quantity: item.quantity || "N/A",
  serialNumber: item.serialNumber || "N/A",
  issuedDate: item.issuedDate || "N/A",
  purchaseDate: item.purchaseDate || "N/A",
  condition: item.condition || "N/A",
  location: item.location || "N/A",
  status: item.status || "N/A",
});

export const downloadAsPng = (qrCodeRef, itemId = null) => {
  const svg = qrCodeRef.current.querySelector('svg');
  if (svg) {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const qrSize = 250;
      const textHeight = 32;
      canvas.width = qrSize;
      canvas.height = qrSize + textHeight;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, qrSize, qrSize);

      const logoImg = new Image();
      logoImg.src = SINSSILogo;

      logoImg.onload = () => {
        const logoSize = 60;
        const centerX = (qrSize - logoSize) / 2;
        const centerY = (qrSize - logoSize) / 2;

        const bgSize = logoSize + 8;
        const bgX = centerX - 4;
        const bgY = centerY - 4;
        ctx.clearRect(bgX, bgY, bgSize, bgSize);
        ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);

        if (itemId) {
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#072C1C';
          ctx.fillText(`ID: ${itemId}`, qrSize / 2, qrSize + 24);
        }

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

export const downloadAsSvg = async (qrCodeRef, itemId = null) => {
  const svg = qrCodeRef.current.querySelector('svg');
  if (!svg) return;

  const serializer = new XMLSerializer();
  const qrSvgString = serializer.serializeToString(svg);

  const logoSize = 50;
  const width = parseInt(svg.getAttribute('width')) || 250;
  const height = parseInt(svg.getAttribute('height')) || 250;
  const textHeight = 32;
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
    <svg width="${width}" height="${height + textHeight}" xmlns="http://www.w3.org/2000/svg">
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
      ${itemId ? `<text x="${width / 2}" y="${height + 24}" text-anchor="middle" font-size="18" font-family="Arial" font-weight="bold" fill="#072C1C">ID: ${itemId}</text>` : ''}
    </svg>
  `;

  const blob = new Blob([combinedSvg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = 'qrcode.svg';
  link.href = URL.createObjectURL(blob);
  link.click();

  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
};

export const printQrCode = (qrCodeRef, size = QR_SIZES.MEDIUM, itemId = null) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const qrCodeHtml = qrCodeRef.current.innerHTML;

    const qrCodeStyle = `
      <style>
        body {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        div.qr {
          width: ${size}px;
          height: ${size}px;
        }
        svg, canvas {
          width: 100% !important;
          height: 100% !important;
        }
        .item-id {
          margin-top: 12px;
          font-size: ${size >= QR_SIZES.LARGE ? '24px' : size >= QR_SIZES.MEDIUM ? '18px' : '14px'};
          font-weight: bold;
          color: #072C1C;
          text-align: center;
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
          <div class="qr">${qrCodeHtml}</div>
          ${itemId ? `<div class="item-id">ID: ${itemId}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
};

export const batchPrintQrCodes = async (qrRefs, ids, size = QR_SIZES.SMALL, itemDataList = null) => {
  await new Promise(resolve => requestAnimationFrame(resolve));

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

  let base64Logo = '';
  try {
    base64Logo = await toBase64(SINSSILogo);
  } catch (e) {
    alert('Failed to load logo for QR code printing.');
    console.error('Logo base64 error:', e);
    return;
  }

  const fontSize = size >= QR_SIZES.LARGE ? '18px' : size >= QR_SIZES.MEDIUM ? '14px' : '12px';

  let html = `<html><head><title>Print QR Codes</title><style>
    body { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; margin: 0; padding: 24px; background: #fff; }
    .qr-block { display: flex; flex-direction: column; align-items: center; margin: 16px; }
    .qr-block span { margin-top: 8px; font-size: ${fontSize}; font-weight: bold; }
    img { width: ${size}px; height: ${size}px; }
  </style></head><body>`;

  if (itemDataList && itemDataList.length === ids.length) {
    for (let idx = 0; idx < ids.length; idx++) {
      const itemId = ids[idx];
      const qrValue = JSON.stringify(itemDataList[idx]);

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;

      await QRCode.toCanvas(canvas, qrValue, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const ctx = canvas.getContext('2d');
      const logoImg = new Image();
      logoImg.src = base64Logo;

      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoSize = size * 0.25;
          const centerX = (canvas.width - logoSize) / 2;
          const centerY = (canvas.height - logoSize) / 2;

          const bgSize = logoSize + 8;
          const bgX = centerX - 4;
          const bgY = centerY - 4;
          
          ctx.clearRect(bgX, bgY, bgSize, bgSize);
          
          ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);
          resolve();
        };
        logoImg.onerror = reject;
      });

      const qrWithLogoBase64 = canvas.toDataURL('image/png');

      html += `<div class='qr-block'>
        <img src="${qrWithLogoBase64}" alt="QR Code with Logo" />
        <span>ID: ${itemId}</span>
      </div>`;
    }
  } else {
    alert('Item data is missing.');
    return;
  }

  html += '</body></html>';
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
};
