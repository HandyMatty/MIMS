export const handlePrint = (selectedItems) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print the document.');
    return;
  }

  const tableHeaders = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Brand</th>
        <th>Qty</th>
        <th>Remarks</th>
        <th>Serial Number</th>
        <th>Issued Date</th>
        <th>Purchased Date</th>
        <th>Condition</th>
        <th>Detachment/Office</th>
        <th>Status</th>
      </tr>
    </thead>
  `;

  const tableRows = selectedItems.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.type || '-'}</td>
      <td>${item.brand || '-'}</td>
      <td>${item.quantity || '0'}</td>
      <td>${item.remarks || '-'}</td>
      <td>${item.serialNumber || '-'}</td>
      <td>${item.issuedDate || 'NO DATE'}</td>
      <td>${item.purchaseDate || 'NO DATE'}</td>
      <td>${item.condition || '-'}</td>
      <td>${item.location || '-'}</td>
      <td>${item.status || '-'}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Inventory</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          h1 { text-align: center; }
          @page { size: auto; margin: 20mm; }
        </style>
      </head>
      <body>
        <h1>Inventory Items</h1>
        <table>
          ${tableHeaders}
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          }
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}; 