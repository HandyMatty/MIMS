import{R as v,r as C,u as A,b as R,d as j,c as I,j as t,S as $,B as p}from"./index-CvNWCSBk.js";import{C as L}from"./index-CJlEdl2c.js";import{D as N}from"./index-eqT48hrU.js";import{Q as k}from"./index-By7wAoBB.js";import"./PlusOutlined-BYHHjC0-.js";import"./responsiveObserver-CmNDpH0p.js";import"./useBreakpoint-Dkqa_54G.js";import"./useForceUpdate-Ca9qVhq8.js";import"./createForOfIteratorHelper-AgibUOrS.js";const y="/Sentinel-MIMS/img/SINSSI_LOGO-removebg-preview-ChleVzSE.png",z=e=>{const s=e.current.querySelector("svg");if(s){const c=new XMLSerializer().serializeToString(s),n=new Image,g=new Blob([c],{type:"image/svg+xml;charset=utf-8"}),l=URL.createObjectURL(g);n.onload=()=>{const o=document.createElement("canvas");o.width=250,o.height=250;const i=o.getContext("2d");i.clearRect(0,0,o.width,o.height),i.drawImage(n,0,0,o.width,o.height);const m=new Image;m.src=y,m.onload=()=>{const h=(o.width-60)/2,x=(o.height-60)/2;i.fillStyle="transparent",i.fillRect(h-4,x-4,68,68),i.drawImage(m,h,x,60,60);const d=document.createElement("a");d.download="qrcode.png",d.href=o.toDataURL("image/png"),d.click(),URL.revokeObjectURL(l)}},n.src=l}},E=async e=>{const s=e.current.querySelector("svg");if(!s)return;const c=new XMLSerializer().serializeToString(s),n=50,g=parseInt(s.getAttribute("width"))||250,l=parseInt(s.getAttribute("height"))||250,o=(g-n)/2,i=(l-n)/2,b=await(r=>new Promise((f,S)=>{const u=new Image;u.crossOrigin="anonymous",u.onload=()=>{const w=document.createElement("canvas");w.width=u.width,w.height=u.height,w.getContext("2d").drawImage(u,0,0),f(w.toDataURL("image/png"))},u.onerror=S,u.src=r}))(y),h=`
    <svg width="${g}" height="${l}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${c}
      </g>
      <rect x="${o-4}" y="${i-4}" width="${n+8}" height="${n+8}" fill="transparent"/>
      <image 
        href="${b}" 
        x="${o}" 
        y="${i}" 
        width="${n}" 
        height="${n}" 
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  `,x=new Blob([h],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(x),d.click(),setTimeout(()=>URL.revokeObjectURL(d.href),1e3)},P=(e,s=250)=>{const a=window.open("","_blank");if(a){const c=e.current.innerHTML,n=`
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
    `;a.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          ${n}
        </head>
        <body>
          <div>${c}</div>
        </body>
      </html>
    `),a.document.close(),a.focus(),setTimeout(()=>a.print(),500)}},F=({itemDetails:e})=>{const[s,a]=v.useState("PNG"),c=C.useRef(null),{logUserActivity:n}=A(),{logUserNotification:g}=R(),{userData:l}=j(),{userData:o}=I(),i=(l==null?void 0:l.username)||(o==null?void 0:o.username)||"Unknown User",m=l||o,h=e?{Id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{Id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},x=r=>{r==="PNG"?z(c):E(c),n(i,"Download QR Code",`Downloaded QR code in ${r} format`),g("Downloaded QR CODE",`You successfully downloaded QR code in ${r} format`)},d=()=>{P(c),n(i,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),g("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)};return t.jsx(L,{title:t.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto bg-[#A8E1C5] rounded-xl shadow border-none",children:t.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[t.jsx("div",{className:"w-full md:w-1/2",children:t.jsx("div",{className:"p-4 rounded-lg bg-[#A8E1C5] shadow",style:{border:"1px solid #072C1C",borderRadius:"8px"},children:t.jsx(N,{title:t.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",labelStyle:{fontWeight:"bold",color:"#072C1C",width:"auto"},contentStyle:{color:"#072C1C"},children:Object.entries(h).filter(([r])=>!(r==="quantity"&&h["Serial Number"]!=="N/A")).map(([r,f])=>t.jsx(N.Item,{label:r,children:t.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:f})},r))})})}),t.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[t.jsx("div",{ref:c,style:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:t.jsx(k,{icon:$,iconSize:40,value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([r])=>!(r==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx("div",{className:"font-bold text-sm text-[#072C1C] mb-2",children:"Image format:"}),t.jsxs(p.Group,{children:[t.jsx(p,{type:"primary",onClick:()=>a("PNG"),className:`text-black ${s==="PNG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!m,children:"PNG"}),t.jsx(p,{type:"primary",onClick:()=>a("SVG"),className:`text-black ${s==="SVG"?"bg-lime-200":"bg-[#EAF4E2]"}`,disabled:!m,children:"SVG"})]})]}),t.jsxs(p,{onClick:()=>x(s),className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!m,children:["Download ",s]}),t.jsx(p,{onClick:d,className:"bg-lime-200 shadow-md text-[#072C1C] text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!m,children:"Print QR Code"})]})]})})};export{F as default};
