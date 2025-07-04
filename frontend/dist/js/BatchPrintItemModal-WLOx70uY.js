import{r as n,q as P,t as $,j as t,M as C,I as z,l as D,B as g}from"./index-CD2515kj.js";import{g as E}from"./addItemToInventory-C9oj-7GI.js";import{F as H}from"./index-DMt-9uzF.js";var B={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M820 436h-40c-4.4 0-8 3.6-8 8v40c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-40c0-4.4-3.6-8-8-8zm32-104H732V120c0-4.4-3.6-8-8-8H300c-4.4 0-8 3.6-8 8v212H172c-44.2 0-80 35.8-80 80v328c0 17.7 14.3 32 32 32h168v132c0 4.4 3.6 8 8 8h424c4.4 0 8-3.6 8-8V772h168c17.7 0 32-14.3 32-32V412c0-44.2-35.8-80-80-80zM360 180h304v152H360V180zm304 664H360V568h304v276zm200-140H732V500H292v204H160V412c0-6.6 5.4-12 12-12h680c6.6 0 12 5.4 12 12v292z"}}]},name:"printer",theme:"outlined"},R=function(s,d){return n.createElement(P,$({},s,{ref:d,icon:B}))},V=n.forwardRef(R);const A=r=>{const s=window.open("","_blank");if(!s){alert("Please allow pop-ups to print the document.");return}const d=`
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
  `,l=r.map(a=>`
    <tr>
      <td>${a.id}</td>
      <td>${a.type||"-"}</td>
      <td>${a.brand||"-"}</td>
      <td>${a.quantity||"0"}</td>
      <td>${a.remarks||"-"}</td>
      <td>${a.serialNumber||"-"}</td>
      <td>${a.issuedDate||"NO DATE"}</td>
      <td>${a.purchaseDate||"NO DATE"}</td>
      <td>${a.condition||"-"}</td>
      <td>${a.location||"-"}</td>
      <td>${a.status||"-"}</td>
    </tr>
  `).join("");s.document.write(`
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
          ${d}
          <tbody>
            ${l}
          </tbody>
        </table>
      </body>
    </html>
  `),s.document.close(),s.onload=function(){s.focus(),s.print(),s.close()}},{Text:w}=D;function q({visible:r,onClose:s,onConfirm:d,loading:l}){const[a,u]=n.useState([]),[i,p]=n.useState(""),[h,m]=n.useState([]),[o,x]=n.useState([]),[j,y]=n.useState(1),[S,I]=n.useState(10),[v,f]=n.useState(!1);n.useEffect(()=>{r&&(N(),m([]),x([]),p(""),y(1))},[r]);const N=async()=>{f(!0);try{const e=await E();u(e)}catch{u([])}finally{f(!1)}},b=n.useMemo(()=>i?a.filter(e=>Object.values(e).some(c=>c&&String(c).toLowerCase().includes(i.toLowerCase()))):a,[a,i]);n.useEffect(()=>{x(a.filter(e=>h.includes(e.id)))},[h,a]);const k=[{title:"ID",dataIndex:"id",key:"id",width:100},{title:"Type",dataIndex:"type",key:"type",width:120},{title:"Brand",dataIndex:"brand",key:"brand",width:120},{title:"Serial Number",dataIndex:"serialNumber",key:"serialNumber",width:150},{title:"Quantity",dataIndex:"quantity",key:"quantity",width:80},{title:"Location",dataIndex:"location",key:"location",width:150},{title:"Status",dataIndex:"status",key:"status",width:100}];return t.jsx(C,{open:r,onCancel:s,title:"Batch Print Items",width:1100,footer:null,centered:!0,children:t.jsxs("div",{className:"flex flex-col md:flex-row gap-4",children:[t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx(z,{placeholder:"Search items...",value:i,onChange:e=>p(e.target.value),className:"mb-2"}),t.jsx(H,{rowKey:"id",dataSource:b,columns:k,rowSelection:{selectedRowKeys:h,onChange:m},pagination:{current:j,pageSize:S,total:b.length,showSizeChanger:!0,pageSizeOptions:["10","20","50","100","200"],onChange:(e,c)=>{y(e),I(c)}},loading:v,size:"small",scroll:{x:"max-content",y:350}})]}),t.jsxs("div",{className:"w-full md:w-1/3 bg-white rounded-lg shadow p-3 min-h-[350px]",children:[t.jsxs(w,{strong:!0,children:["Preview (",o.length," selected):"]}),t.jsx("div",{className:"mt-2 max-h-[320px] overflow-auto",children:o.length===0?t.jsx(w,{type:"secondary",children:"No items selected."}):t.jsx("ul",{className:"text-xs space-y-1",children:o.map(e=>t.jsxs("li",{className:"border-b pb-1 mb-1",children:[t.jsx("b",{children:e.type})," - ",e.brand," (Qty: ",e.quantity,")",t.jsx("br",{}),t.jsxs("span",{children:["ID: ",e.id]}),t.jsx("br",{}),t.jsxs("span",{children:["Serial: ",e.serialNumber||"N/A"]}),t.jsx("br",{}),t.jsxs("span",{children:["Location: ",e.location]}),t.jsx("br",{}),t.jsxs("span",{children:["Status: ",e.status]})]},e.id))})}),t.jsxs("div",{className:"flex justify-end gap-2 mt-4",children:[t.jsx(g,{onClick:s,disabled:l,children:"Cancel"}),t.jsx(g,{type:"primary",onClick:()=>d(o),loading:l,disabled:o.length===0,children:"Print Selected"})]})]})]})})}export{q as B,V as R,A as h};
