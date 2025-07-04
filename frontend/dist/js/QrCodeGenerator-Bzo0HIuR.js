import{r as N,d as v,e as A,k as R,i as j,u as k,j as r,n as I,bs as S,S as $,B as w}from"./index-D2rseGsh.js";import{Q as L}from"./index-D-zY3c_a.js";import{S as z}from"./index-DdnPzlhZ.js";import"./createForOfIteratorHelper-CdqatU5H.js";const C="/Sentinel-MIMS/img/SINSSI_LOGO-removebg-preview-ChleVzSE.png",q=e=>{const a=e.current.querySelector("svg");if(a){const l=new XMLSerializer().serializeToString(a),s=new Image,g=new Blob([l],{type:"image/svg+xml;charset=utf-8"}),u=URL.createObjectURL(g);s.onload=()=>{const n=document.createElement("canvas");n.width=250,n.height=250;const o=n.getContext("2d");o.clearRect(0,0,n.width,n.height),o.drawImage(s,0,0,n.width,n.height);const i=new Image;i.src=C,i.onload=()=>{const h=(n.width-60)/2,p=(n.height-60)/2;o.fillStyle="transparent",o.fillRect(h-4,p-4,68,68),o.drawImage(i,h,p,60,60);const d=document.createElement("a");d.download="qrcode.png",d.href=n.toDataURL("image/png"),d.click(),URL.revokeObjectURL(u)}},s.src=u}},E=async e=>{const a=e.current.querySelector("svg");if(!a)return;const l=new XMLSerializer().serializeToString(a),s=50,g=parseInt(a.getAttribute("width"))||250,u=parseInt(a.getAttribute("height"))||250,n=(g-s)/2,o=(u-s)/2,x=await(f=>new Promise((y,b)=>{const t=new Image;t.crossOrigin="anonymous",t.onload=()=>{const m=document.createElement("canvas");m.width=t.width,m.height=t.height,m.getContext("2d").drawImage(t,0,0),y(m.toDataURL("image/png"))},t.onerror=b,t.src=f}))(C),h=`
    <svg width="${g}" height="${u}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${l}
      </g>
      <rect x="${n-4}" y="${o-4}" width="${s+8}" height="${s+8}" fill="transparent"/>
      <image 
        href="${x}" 
        x="${n}" 
        y="${o}" 
        width="${s}" 
        height="${s}" 
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  `,p=new Blob([h],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(p),d.click(),setTimeout(()=>URL.revokeObjectURL(d.href),1e3)},P=(e,a=250)=>{const c=window.open("","_blank");if(c){const l=e.current.innerHTML,s=`
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        div {
          width: ${a}px;
          height: ${a}px;
        }
        svg, canvas {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
    `;c.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          ${s}
        </head>
        <body>
          <div>${l}</div>
        </body>
      </html>
    `),c.document.close(),c.focus(),setTimeout(()=>c.print(),500)}},T=({itemDetails:e})=>{const[a,c]=N.useState("PNG"),l=N.useRef(null),{logUserActivity:s}=v(),{logUserNotification:g}=A(),{userData:u}=R(),{userData:n}=j(),{theme:o,currentTheme:i}=k(),x=(u==null?void 0:u.username)||(n==null?void 0:n.username)||"Unknown User",h=u||n,d=e?{Id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{Id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},f=t=>{t==="PNG"?q(l):E(l),s(x,"Download QR Code",`Downloaded QR code in ${t} format`),g("Downloaded QR CODE",`You successfully downloaded QR code in ${t} format`)},y=()=>{P(l),s(x,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),g("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)},b=t=>{const m=a===t;return i==="default"?{backgroundColor:m?"#d9f99d":"#EAF4E2",color:"#072C1C"}:{backgroundColor:m?o.CardHead:o.componentBackground,color:o.text}};return r.jsx(I,{title:r.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto rounded-xl shadow border-none",style:i!=="default"?{backgroundColor:o.componentBackground,color:o.text}:{backgroundColor:"#A8E1C5"},children:r.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[r.jsx("div",{className:"w-full md:w-1/2",children:r.jsx("div",{className:"p-4 rounded-lg shadow",style:i!=="default"?{backgroundColor:o.background,border:"1px solid",borderRadius:"8px"}:{backgroundColor:"#A8E1C5",border:"1px solid #072C1C",borderRadius:"8px"},children:r.jsx(S,{title:r.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",style:i!=="default"?{color:o.text}:{},children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",styles:{label:i!=="default"?{fontWeight:"bold",color:o.text,width:"auto"}:{fontWeight:"bold",color:"#072C1C",width:"auto"},content:i!=="default"?{color:o.text}:{color:"#072C1C"}},children:Object.entries(d).filter(([t])=>!(t==="quantity"&&d["Serial Number"]!=="N/A")).map(([t,m])=>r.jsx(S.Item,{label:t,children:r.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:m})},t))})})}),r.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[r.jsx("div",{ref:l,style:i!=="default"?{display:"inline-block",border:"1px solid",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"}:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:r.jsx(L,{icon:$,iconSize:40,value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([t])=>!(t==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),r.jsxs("div",{className:"flex flex-col items-center",children:[r.jsx("div",{className:"font-bold text-sm mb-2",style:i!=="default"?{color:o.text}:{color:"#072C1C"},children:"Image format:"}),r.jsxs(z.Compact,{children:[r.jsx(w,{type:"primary",onClick:()=>c("PNG"),style:b("PNG"),disabled:!h,children:"PNG"}),r.jsx(w,{type:"primary",onClick:()=>c("SVG"),style:b("SVG"),disabled:!h,children:"SVG"})]})]}),r.jsxs(w,{onClick:()=>f(a),className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!h,children:["Download ",a]}),r.jsx(w,{onClick:y,className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!h,children:"Print QR Code"})]})]})})};export{T as default};
