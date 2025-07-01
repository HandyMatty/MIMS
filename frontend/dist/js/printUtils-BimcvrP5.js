import{r as d,q as r,t as h}from"./index-DN6_br7R.js";var l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M820 436h-40c-4.4 0-8 3.6-8 8v40c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-40c0-4.4-3.6-8-8-8zm32-104H732V120c0-4.4-3.6-8-8-8H300c-4.4 0-8 3.6-8 8v212H172c-44.2 0-80 35.8-80 80v328c0 17.7 14.3 32 32 32h168v132c0 4.4 3.6 8 8 8h424c4.4 0 8-3.6 8-8V772h168c17.7 0 32-14.3 32-32V412c0-44.2-35.8-80-80-80zM360 180h304v152H360V180zm304 664H360V568h304v276zm200-140H732V500H292v204H160V412c0-6.6 5.4-12 12-12h680c6.6 0 12 5.4 12 12v292z"}}]},name:"printer",theme:"outlined"},s=function(e,o){return d.createElement(r,h({},e,{ref:o,icon:l}))},i=d.forwardRef(s);const p=a=>{const e=window.open("","_blank");if(!e){alert("Please allow pop-ups to print the document.");return}const o=`
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
  `,n=a.map(t=>`
    <tr>
      <td>${t.id}</td>
      <td>${t.type||"-"}</td>
      <td>${t.brand||"-"}</td>
      <td>${t.quantity||"0"}</td>
      <td>${t.remarks||"-"}</td>
      <td>${t.serialNumber||"-"}</td>
      <td>${t.issuedDate||"NO DATE"}</td>
      <td>${t.purchaseDate||"NO DATE"}</td>
      <td>${t.condition||"-"}</td>
      <td>${t.location||"-"}</td>
      <td>${t.status||"-"}</td>
    </tr>
  `).join("");e.document.write(`
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
          ${o}
          <tbody>
            ${n}
          </tbody>
        </table>
      </body>
    </html>
  `),e.document.close(),e.onload=function(){e.focus(),e.print(),e.close()}};export{i as R,p as h};
