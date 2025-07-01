import{r as N,b as v,c as A,e as R,d as j,u as k,j as r,S as I,B as b}from"./index-D5m7brAQ.js";import{C as $}from"./index-ON6h34Ee.js";import{D as S}from"./index-Ci4uZYU6.js";import{Q as L}from"./index-C2TXOVcJ.js";import"./PlusOutlined-CVr93bVs.js";import"./Dropdown-CFoEwfhM.js";import"./responsiveObserver-DoXGIqhg.js";import"./useBreakpoint-ChVOYjk2.js";import"./useForceUpdate-BMu-K6_i.js";import"./createForOfIteratorHelper-CP7F4EYd.js";const C="/Sentinel-MIMS/img/SINSSI_LOGO-removebg-preview-ChleVzSE.png",z=e=>{const i=e.current.querySelector("svg");if(i){const c=new XMLSerializer().serializeToString(i),s=new Image,g=new Blob([c],{type:"image/svg+xml;charset=utf-8"}),m=URL.createObjectURL(g);s.onload=()=>{const n=document.createElement("canvas");n.width=250,n.height=250;const o=n.getContext("2d");o.clearRect(0,0,n.width,n.height),o.drawImage(s,0,0,n.width,n.height);const a=new Image;a.src=C,a.onload=()=>{const u=(n.width-60)/2,p=(n.height-60)/2;o.fillStyle="transparent",o.fillRect(u-4,p-4,68,68),o.drawImage(a,u,p,60,60);const d=document.createElement("a");d.download="qrcode.png",d.href=n.toDataURL("image/png"),d.click(),URL.revokeObjectURL(m)}},s.src=m}},q=async e=>{const i=e.current.querySelector("svg");if(!i)return;const c=new XMLSerializer().serializeToString(i),s=50,g=parseInt(i.getAttribute("width"))||250,m=parseInt(i.getAttribute("height"))||250,n=(g-s)/2,o=(m-s)/2,x=await(f=>new Promise((y,w)=>{const t=new Image;t.crossOrigin="anonymous",t.onload=()=>{const h=document.createElement("canvas");h.width=t.width,h.height=t.height,h.getContext("2d").drawImage(t,0,0),y(h.toDataURL("image/png"))},t.onerror=w,t.src=f}))(C),u=`
    <svg width="${g}" height="${m}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${c}
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
  `,p=new Blob([u],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(p),d.click(),setTimeout(()=>URL.revokeObjectURL(d.href),1e3)},E=(e,i=250)=>{const l=window.open("","_blank");if(l){const c=e.current.innerHTML,s=`
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        div {
          width: ${i}px;
          height: ${i}px;
        }
        svg, canvas {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
    `;l.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          ${s}
        </head>
        <body>
          <div>${c}</div>
        </body>
      </html>
    `),l.document.close(),l.focus(),setTimeout(()=>l.print(),500)}},V=({itemDetails:e})=>{const[i,l]=N.useState("PNG"),c=N.useRef(null),{logUserActivity:s}=v(),{logUserNotification:g}=A(),{userData:m}=R(),{userData:n}=j(),{theme:o,currentTheme:a}=k(),x=(m==null?void 0:m.username)||(n==null?void 0:n.username)||"Unknown User",u=m||n,d=e?{Id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{Id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},f=t=>{t==="PNG"?z(c):q(c),s(x,"Download QR Code",`Downloaded QR code in ${t} format`),g("Downloaded QR CODE",`You successfully downloaded QR code in ${t} format`)},y=()=>{E(c),s(x,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),g("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)},w=t=>{const h=i===t;return a==="default"?{backgroundColor:h?"#d9f99d":"#EAF4E2",color:"#072C1C"}:{backgroundColor:h?o.CardHead:o.componentBackground,color:o.text}};return r.jsx($,{title:r.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto rounded-xl shadow border-none",style:a!=="default"?{backgroundColor:o.componentBackground,color:o.text}:{backgroundColor:"#A8E1C5"},children:r.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[r.jsx("div",{className:"w-full md:w-1/2",children:r.jsx("div",{className:"p-4 rounded-lg shadow",style:a!=="default"?{backgroundColor:o.background,border:"1px solid",borderRadius:"8px"}:{backgroundColor:"#A8E1C5",border:"1px solid #072C1C",borderRadius:"8px"},children:r.jsx(S,{title:r.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",style:a!=="default"?{color:o.text}:{},children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",labelStyle:a!=="default"?{fontWeight:"bold",color:o.text,width:"auto"}:{fontWeight:"bold",color:"#072C1C",width:"auto"},contentStyle:a!=="default"?{color:o.text}:{color:"#072C1C"},children:Object.entries(d).filter(([t])=>!(t==="quantity"&&d["Serial Number"]!=="N/A")).map(([t,h])=>r.jsx(S.Item,{label:t,children:r.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:h})},t))})})}),r.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[r.jsx("div",{ref:c,style:a!=="default"?{display:"inline-block",border:"1px solid",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"}:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:r.jsx(L,{icon:I,iconSize:40,value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([t])=>!(t==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),r.jsxs("div",{className:"flex flex-col items-center",children:[r.jsx("div",{className:"font-bold text-sm mb-2",style:a!=="default"?{color:o.text}:{color:"#072C1C"},children:"Image format:"}),r.jsxs(b.Group,{children:[r.jsx(b,{type:"primary",onClick:()=>l("PNG"),style:w("PNG"),disabled:!u,children:"PNG"}),r.jsx(b,{type:"primary",onClick:()=>l("SVG"),style:w("SVG"),disabled:!u,children:"SVG"})]})]}),r.jsxs(b,{onClick:()=>f(i),className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!u,children:["Download ",i]}),r.jsx(b,{onClick:y,className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!u,children:"Print QR Code"})]})]})})};export{V as default};
