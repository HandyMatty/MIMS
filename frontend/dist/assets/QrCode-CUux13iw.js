import{R as f,r as g,J as y,K as w,L as C,N as A,k as t,n as v,Q as j,B as u,O as S}from"./index-Bf7Skixl.js";import{D as h}from"./index-CS2U6cW7.js";const R=e=>{const s=e.current.querySelector("svg");if(s){const o=new XMLSerializer().serializeToString(s),r=new Image,l=new Blob([o],{type:"image/svg+xml;charset=utf-8"}),c=URL.createObjectURL(l);r.onload=()=>{const i=document.createElement("canvas");i.width=250,i.height=250,i.getContext("2d").drawImage(r,0,0);const d=document.createElement("a");d.download="qrcode.png",d.href=i.toDataURL("image/png"),d.click(),URL.revokeObjectURL(c)},r.src=c}},k=e=>{const s=e.current.querySelector("svg");if(s){const o=new XMLSerializer().serializeToString(s),r=new Blob([o],{type:"image/svg+xml"}),l=document.createElement("a");l.download="qrcode.svg",l.href=URL.createObjectURL(r),l.click()}},Q=(e,s=250)=>{const n=window.open("","_blank");if(n){const o=e.current.innerHTML,r=`
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
      `),n.document.close(),n.focus(),setTimeout(()=>n.print(),500)}},E=({itemDetails:e})=>{const[s,n]=f.useState("PNG"),o=g.useRef(null),{logUserActivity:r}=y(),{logUserNotification:l}=w(),{userData:c}=C(),{userData:i}=A(),m=(c==null?void 0:c.username)||(i==null?void 0:i.username)||"Unknown User",d=c||i,x=e?{id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},b=a=>{a==="PNG"?R(o):k(o),r(m,"Download QR Code",`Downloaded QR code in ${a} format`),l("Downloaded QR CODE",`You successfully downloaded QR code in ${a} format`)},p=()=>{Q(o),r(m,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),l("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)};return t.jsx(v,{title:t.jsx("span",{className:"text-5xl-6 font-bold flex justify-center",children:"DETAILS"}),className:"flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none",children:t.jsxs("div",{className:"flex flex-row justify-between gap-8",children:[t.jsx("div",{className:"w-1/2 space-y-4",style:{maxWidth:"50%"},children:t.jsx("div",{className:"p-4 rounded-lg bg-[#A8E1C5] shadow",style:{border:"1px solid #072C1C",borderRadius:"8px"},children:t.jsx(h,{title:t.jsx("div",{style:{textAlign:"center",fontWeight:"bold",fontSize:"18px"},children:"Latest Item Info"}),bordered:!0,column:1,size:"small",labelStyle:{fontWeight:"bold",color:"#072C1C",width:"120px"},contentStyle:{color:"#072C1C"},children:Object.entries(x).filter(([a])=>!(a==="quantity"&&x["Serial Number"]!=="N/A")).map(([a,N])=>t.jsx(h.Item,{label:a,children:N},a))})})}),t.jsxs("div",{className:"w-1/2 flex flex-col items-center space-y-4",children:[t.jsx("div",{ref:o,style:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px"},children:t.jsx(j,{value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([a])=>!(a==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx("div",{className:"font-bold text-sm text-[#072C1C] mb-2",children:"Image format:"}),t.jsxs(u.Group,{children:[t.jsx(u,{type:"primary",onClick:()=>n("PNG"),className:`text-black ${s==="PNG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!d,children:"PNG"}),t.jsx(u,{type:"primary",onClick:()=>n("SVG"),className:`text-black ${s==="SVG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!d,children:"SVG"})]})]}),t.jsxs(u,{onClick:()=>b(s),className:"bg-lime-200 shadow-md text-[#072C1C] text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!d,children:["Download ",s]}),t.jsx(u,{onClick:p,className:"bg-lime-200 shadow-md text-[#072C1C] text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!d,children:"Print QR Code"})]})]})})},q=()=>{const[e,s]=g.useState(null),n=o=>{s(o)};return t.jsxs("div",{className:"flex flex-col w-full p-8",children:[t.jsx("div",{children:t.jsx(E,{itemDetails:e})}),t.jsx("div",{className:"mt-5",children:t.jsx(S,{onItemSelect:n})})]})};export{q as default};
