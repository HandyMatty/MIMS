import{R as N,r as f,u as w,b as y,d as C,c as A,j as t,B as m}from"./index-1bUjThPI.js";import{C as v}from"./index-yJHKc8mb.js";import{D as h}from"./index-Cui3dGfa.js";import{Q as j}from"./index-DGCx2TAR.js";import"./PlusOutlined-DjyVkQwf.js";import"./responsiveObserver-D0DgaF8s.js";import"./useBreakpoint-GvLrBt9J.js";import"./useForceUpdate-CHj89O7T.js";import"./createForOfIteratorHelper-CS5FNHVX.js";const R=e=>{const s=e.current.querySelector("svg");if(s){const r=new XMLSerializer().serializeToString(s),n=new Image,d=new Blob([r],{type:"image/svg+xml;charset=utf-8"}),c=URL.createObjectURL(d);n.onload=()=>{const i=document.createElement("canvas");i.width=250,i.height=250,i.getContext("2d").drawImage(n,0,0);const l=document.createElement("a");l.download="qrcode.png",l.href=i.toDataURL("image/png"),l.click(),URL.revokeObjectURL(c)},n.src=c}},S=e=>{const s=e.current.querySelector("svg");if(s){const r=new XMLSerializer().serializeToString(s),n=new Blob([r],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(n),d.click()}},k=(e,s=250)=>{const o=window.open("","_blank");if(o){const r=e.current.innerHTML,n=`
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
      `;o.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            ${n}
          </head>
          <body>
            <div>${r}</div>
          </body>
        </html>
      `),o.document.close(),o.focus(),setTimeout(()=>o.print(),500)}},z=({itemDetails:e})=>{const[s,o]=N.useState("PNG"),r=f.useRef(null),{logUserActivity:n}=w(),{logUserNotification:d}=y(),{userData:c}=C(),{userData:i}=A(),u=(c==null?void 0:c.username)||(i==null?void 0:i.username)||"Unknown User",l=c||i,x=e?{id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},p=a=>{a==="PNG"?R(r):S(r),n(u,"Download QR Code",`Downloaded QR code in ${a} format`),d("Downloaded QR CODE",`You successfully downloaded QR code in ${a} format`)},g=()=>{k(r),n(u,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),d("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)};return t.jsx(v,{title:t.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none",children:t.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[t.jsx("div",{className:"w-full md:w-1/2",children:t.jsx("div",{className:"p-4 rounded-lg bg-[#A8E1C5] shadow",style:{border:"1px solid #072C1C",borderRadius:"8px"},children:t.jsx(h,{title:t.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",labelStyle:{fontWeight:"bold",color:"#072C1C",width:"auto"},contentStyle:{color:"#072C1C"},children:Object.entries(x).filter(([a])=>!(a==="quantity"&&x["Serial Number"]!=="N/A")).map(([a,b])=>t.jsx(h.Item,{label:a,children:t.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:b})},a))})})}),t.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[t.jsx("div",{ref:r,style:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:t.jsx(j,{value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([a])=>!(a==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx("div",{className:"font-bold text-sm text-[#072C1C] mb-2",children:"Image format:"}),t.jsxs(m.Group,{children:[t.jsx(m,{type:"primary",onClick:()=>o("PNG"),className:`text-black ${s==="PNG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!l,children:"PNG"}),t.jsx(m,{type:"primary",onClick:()=>o("SVG"),className:`text-black ${s==="SVG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!l,children:"SVG"})]})]}),t.jsxs(m,{onClick:()=>p(s),className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!l,children:["Download ",s]}),t.jsx(m,{onClick:g,className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!l,children:"Print QR Code"})]})]})})};export{z as default};
