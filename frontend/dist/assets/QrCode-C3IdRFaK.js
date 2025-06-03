import{R as f,r as g,L as w,N as y,O as C,Q as v,k as t,n as A,U as j,B as m,V as S}from"./index-BSDLooyg.js";import{D as h}from"./index-DjuWmSOf.js";const R=e=>{const s=e.current.querySelector("svg");if(s){const o=new XMLSerializer().serializeToString(s),r=new Image,d=new Blob([o],{type:"image/svg+xml;charset=utf-8"}),c=URL.createObjectURL(d);r.onload=()=>{const l=document.createElement("canvas");l.width=250,l.height=250,l.getContext("2d").drawImage(r,0,0);const i=document.createElement("a");i.download="qrcode.png",i.href=l.toDataURL("image/png"),i.click(),URL.revokeObjectURL(c)},r.src=c}},k=e=>{const s=e.current.querySelector("svg");if(s){const o=new XMLSerializer().serializeToString(s),r=new Blob([o],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(r),d.click()}},Q=(e,s=250)=>{const n=window.open("","_blank");if(n){const o=e.current.innerHTML,r=`
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          div {
            width: ${s}px;
            height: ${s}px;
          }
          svg, canvas {
            width: 100% !important;
            height: 100% !important;
          }
        </style>
      `;n.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            ${r}
          </head>
          <body>
            <div>${o}</div>
          </body>
        </html>
      `),n.document.close(),n.focus(),setTimeout(()=>n.print(),500)}},E=({itemDetails:e})=>{const[s,n]=f.useState("PNG"),o=g.useRef(null),{logUserActivity:r}=w(),{logUserNotification:d}=y(),{userData:c}=C(),{userData:l}=v(),x=(c==null?void 0:c.username)||(l==null?void 0:l.username)||"Unknown User",i=c||l,u=e?{id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},b=a=>{a==="PNG"?R(o):k(o),r(x,"Download QR Code",`Downloaded QR code in ${a} format`),d("Downloaded QR CODE",`You successfully downloaded QR code in ${a} format`)},N=()=>{Q(o),r(x,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),d("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)};return t.jsx(A,{title:t.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none",children:t.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[t.jsx("div",{className:"w-full md:w-1/2",children:t.jsx("div",{className:"p-4 rounded-lg bg-[#A8E1C5] shadow",style:{border:"1px solid #072C1C",borderRadius:"8px"},children:t.jsx(h,{title:t.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",labelStyle:{fontWeight:"bold",color:"#072C1C",width:"auto"},contentStyle:{color:"#072C1C"},children:Object.entries(u).filter(([a])=>!(a==="quantity"&&u["Serial Number"]!=="N/A")).map(([a,p])=>t.jsx(h.Item,{label:a,children:t.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:p})},a))})})}),t.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[t.jsx("div",{ref:o,style:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:t.jsx(j,{value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([a])=>!(a==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx("div",{className:"font-bold text-sm text-[#072C1C] mb-2",children:"Image format:"}),t.jsxs(m.Group,{children:[t.jsx(m,{type:"primary",onClick:()=>n("PNG"),className:`text-black ${s==="PNG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!i,children:"PNG"}),t.jsx(m,{type:"primary",onClick:()=>n("SVG"),className:`text-black ${s==="SVG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!i,children:"SVG"})]})]}),t.jsxs(m,{onClick:()=>b(s),className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!i,children:["Download ",s]}),t.jsx(m,{onClick:N,className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!i,children:"Print QR Code"})]})]})})},q=()=>{const[e,s]=g.useState(null),n=o=>{s(o)};return t.jsxs("div",{className:"container max-w-full",children:[t.jsx("div",{className:"mt-5",children:t.jsx(E,{itemDetails:e})}),t.jsx("div",{className:"mt-5",children:t.jsx(S,{onItemSelect:n})})]})};export{q as default};
