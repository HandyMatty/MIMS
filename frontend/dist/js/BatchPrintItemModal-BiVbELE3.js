import{r as n,d as C,e as D,g as R,j as t,M as B,I as z,aK as E,w as T,B as f}from"./index-Cq9w5H2m.js";const K=r=>{const a=window.open("","_blank");if(!a){alert("Please allow pop-ups to print the document.");return}const c=`
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
  `,d=r.map(s=>`
    <tr>
      <td>${s.id}</td>
      <td>${s.type||"-"}</td>
      <td>${s.brand||"-"}</td>
      <td>${s.quantity||"0"}</td>
      <td>${s.remarks||"-"}</td>
      <td>${s.serialNumber||"-"}</td>
      <td>${s.issuedDate||"NO DATE"}</td>
      <td>${s.purchaseDate||"NO DATE"}</td>
      <td>${s.condition||"-"}</td>
      <td>${s.location||"-"}</td>
      <td>${s.status||"-"}</td>
    </tr>
  `).join("");a.document.write(`
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
          ${c}
          <tbody>
            ${d}
          </tbody>
        </table>
      </body>
    </html>
  `),a.document.close(),a.onload=function(){a.focus(),a.print(),a.close()}},{Text:w}=T;function M({visible:r,onClose:a,onConfirm:c,loading:d}){const[s,u]=n.useState([]),[o,x]=n.useState(""),[h,m]=n.useState([]),[l,p]=n.useState([]),[j,y]=n.useState(1),[N,S]=n.useState(10),[I,b]=n.useState(!1),{logUserActivity:k}=C(),{logUserNotification:P}=D();n.useEffect(()=>{r&&($(),m([]),p([]),x(""),y(1))},[r]);const $=async()=>{b(!0);try{const e=await R();u(e)}catch{u([])}finally{b(!1)}},g=n.useMemo(()=>o?s.filter(e=>Object.values(e).some(i=>i&&String(i).toLowerCase().includes(o.toLowerCase()))):s,[s,o]);n.useEffect(()=>{p(s.filter(e=>h.includes(e.id)))},[h,s]);const v=[{title:"ID",dataIndex:"id",key:"id",className:"text-xs",width:100},{title:"Type",dataIndex:"type",key:"type",className:"text-xs",width:120},{title:"Brand",dataIndex:"brand",key:"brand",className:"text-xs",width:120},{title:"Serial Number",dataIndex:"serialNumber",key:"serialNumber",className:"text-xs",width:150},{title:"Remarks",dataIndex:"remarks",key:"remarks",className:"text-xs",width:100},{title:"Quantity",dataIndex:"quantity",key:"quantity",className:"text-xs",width:80},{title:"Location",dataIndex:"location",key:"location",className:"text-xs",width:150},{title:"Status",dataIndex:"status",key:"status",className:"text-xs",width:100}];return t.jsx(B,{open:r,onCancel:a,title:"Batch Print Items",width:1100,footer:null,centered:!0,children:t.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx(z.Search,{placeholder:"Search items...",value:o,onChange:e=>x(e.target.value),allowClear:!0,style:{width:300},size:"small",className:"text-xs mb-2"}),t.jsx(E,{bordered:!0,rowKey:"id",dataSource:g,columns:v,rowSelection:{selectedRowKeys:h,onChange:m,preserveSelectedRowKeys:!0},pagination:{current:j,pageSize:N,total:g.length,showSizeChanger:!0,pageSizeOptions:["10","20","50","100","200"],onChange:(e,i)=>{y(e),S(i)}},loading:I,size:"small",scroll:{x:"max-content",y:350}})]}),t.jsxs("div",{className:"w-full md:w-1/3 bg-white rounded-lg shadow p-3 min-h-[350px]",children:[t.jsxs(w,{strong:!0,children:["Preview (",l.length," selected):"]}),t.jsx("div",{className:"mt-2 max-h-[320px] overflow-auto",children:l.length===0?t.jsx(w,{type:"secondary",children:"No items selected."}):t.jsx("ul",{className:"text-xs space-y-1",children:l.map(e=>t.jsxs("li",{className:"border-b pb-1 mb-1",children:[t.jsx("b",{children:e.type})," - ",e.brand," (Qty: ",e.quantity,")",t.jsx("br",{}),t.jsxs("span",{children:["ID: ",e.id]}),t.jsx("br",{}),t.jsxs("span",{children:["Serial: ",e.serialNumber||"N/A"]}),t.jsx("br",{}),t.jsxs("span",{children:["Location: ",e.location]}),t.jsx("br",{}),t.jsxs("span",{children:["Remarks: ",e.remarks]}),t.jsx("br",{}),t.jsxs("span",{children:["Status: ",e.status]})]},e.id))})}),t.jsxs("div",{className:"flex justify-end gap-2 mt-4",children:[t.jsx(f,{size:"small",onClick:a,disabled:d,className:"custom-button-cancel text-xs",children:"Cancel"}),t.jsx(f,{size:"small",type:"primary",onClick:()=>{c(l),k("Batch Print",`Printed ${l.length} item(s) QR codes.`),P("Batch Print",`Printed ${l.length} item(s) QR codes.`)},loading:d,disabled:l.length===0,className:"custom-button text-xs",children:"Print Selected"})]})]})]})})}export{M as B,K as h};
