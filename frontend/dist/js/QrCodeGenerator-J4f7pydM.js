import{r as N,d as v,e as A,k as R,i as j,u as k,j as n,n as I,bq as S,S as $,B as b}from"./index-DN6_br7R.js";import{Q as L}from"./index-CzKmsA29.js";import"./createForOfIteratorHelper-CSZ6hFQd.js";const C="/Sentinel-MIMS/img/SINSSI_LOGO-removebg-preview-ChleVzSE.png",z=e=>{const a=e.current.querySelector("svg");if(a){const c=new XMLSerializer().serializeToString(a),s=new Image,m=new Blob([c],{type:"image/svg+xml;charset=utf-8"}),u=URL.createObjectURL(m);s.onload=()=>{const r=document.createElement("canvas");r.width=250,r.height=250;const o=r.getContext("2d");o.clearRect(0,0,r.width,r.height),o.drawImage(s,0,0,r.width,r.height);const i=new Image;i.src=C,i.onload=()=>{const h=(r.width-60)/2,p=(r.height-60)/2;o.fillStyle="transparent",o.fillRect(h-4,p-4,68,68),o.drawImage(i,h,p,60,60);const d=document.createElement("a");d.download="qrcode.png",d.href=r.toDataURL("image/png"),d.click(),URL.revokeObjectURL(u)}},s.src=u}},q=async e=>{const a=e.current.querySelector("svg");if(!a)return;const c=new XMLSerializer().serializeToString(a),s=50,m=parseInt(a.getAttribute("width"))||250,u=parseInt(a.getAttribute("height"))||250,r=(m-s)/2,o=(u-s)/2,x=await(f=>new Promise((y,w)=>{const t=new Image;t.crossOrigin="anonymous",t.onload=()=>{const g=document.createElement("canvas");g.width=t.width,g.height=t.height,g.getContext("2d").drawImage(t,0,0),y(g.toDataURL("image/png"))},t.onerror=w,t.src=f}))(C),h=`
    <svg width="${m}" height="${u}" xmlns="http://www.w3.org/2000/svg">
      <g>
        ${c}
      </g>
      <rect x="${r-4}" y="${o-4}" width="${s+8}" height="${s+8}" fill="transparent"/>
      <image 
        href="${x}" 
        x="${r}" 
        y="${o}" 
        width="${s}" 
        height="${s}" 
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  `,p=new Blob([h],{type:"image/svg+xml"}),d=document.createElement("a");d.download="qrcode.svg",d.href=URL.createObjectURL(p),d.click(),setTimeout(()=>URL.revokeObjectURL(d.href),1e3)},E=(e,a=250)=>{const l=window.open("","_blank");if(l){const c=e.current.innerHTML,s=`
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
    `),l.document.close(),l.focus(),setTimeout(()=>l.print(),500)}},B=({itemDetails:e})=>{const[a,l]=N.useState("PNG"),c=N.useRef(null),{logUserActivity:s}=v(),{logUserNotification:m}=A(),{userData:u}=R(),{userData:r}=j(),{theme:o,currentTheme:i}=k(),x=(u==null?void 0:u.username)||(r==null?void 0:r.username)||"Unknown User",h=u||r,d=e?{Id:e.id||"N/A",Type:e.type||"N/A",Brand:e.brand||"N/A",remarks:e.remarks||"N/A",quantity:e.quantity||"N/A","Serial Number":e.serialNumber||"N/A","Issued Date":e.issuedDate||"N/A","Purchased Date":e.purchaseDate||"N/A",Condition:e.condition||"N/A",Location:e.location||"N/A",Status:e.status||"N/A"}:{Id:"N/A",Type:"N/A",Brand:"N/A",quantity:"N/A",remarks:"N/A","Serial Number":"N/A","Issued Date":"N/A","Purchased Date":"N/A",Condition:"N/A",Location:"N/A",Status:"N/A"},f=t=>{t==="PNG"?z(c):q(c),s(x,"Download QR Code",`Downloaded QR code in ${t} format`),m("Downloaded QR CODE",`You successfully downloaded QR code in ${t} format`)},y=()=>{E(c),s(x,"Print QR Code",`Printed QR code for item with serial number: ${e.serialNumber}`),m("Printed QR CODE",`You successfully printed QR code for item with serial number: ${e.serialNumber}`)},w=t=>{const g=a===t;return i==="default"?{backgroundColor:g?"#d9f99d":"#EAF4E2",color:"#072C1C"}:{backgroundColor:g?o.CardHead:o.componentBackground,color:o.text}};return n.jsx(I,{title:n.jsx("span",{className:"text-lgi sm:text-sm md:text-base lg:text-lgi xl:text-xl font-bold flex justify-center",children:"QR CODE"}),className:"flex flex-col w-full mx-auto rounded-xl shadow border-none",style:i!=="default"?{backgroundColor:o.componentBackground,color:o.text}:{backgroundColor:"#A8E1C5"},children:n.jsxs("div",{className:"flex flex-col md:flex-row md:justify-between md:items-start gap-6",children:[n.jsx("div",{className:"w-full md:w-1/2",children:n.jsx("div",{className:"p-4 rounded-lg shadow",style:i!=="default"?{backgroundColor:o.background,border:"1px solid",borderRadius:"8px"}:{backgroundColor:"#A8E1C5",border:"1px solid #072C1C",borderRadius:"8px"},children:n.jsx(S,{title:n.jsx("div",{className:"text-center font-bold md:text-lgi overflow-auto text-lgi",style:i!=="default"?{color:o.text}:{},children:"Item Details"}),className:"text-xs",bordered:!0,column:1,size:"small",labelStyle:i!=="default"?{fontWeight:"bold",color:o.text,width:"auto"}:{fontWeight:"bold",color:"#072C1C",width:"auto"},contentStyle:i!=="default"?{color:o.text}:{color:"#072C1C"},children:Object.entries(d).filter(([t])=>!(t==="quantity"&&d["Serial Number"]!=="N/A")).map(([t,g])=>n.jsx(S.Item,{label:t,children:n.jsx("span",{className:"text-xs overflow-auto wrap-text w-auto",children:g})},t))})})}),n.jsxs("div",{className:"w-full md:w-1/2 flex flex-col items-center space-y-4 mt-6 md:mt-0",children:[n.jsx("div",{ref:c,style:i!=="default"?{display:"inline-block",border:"1px solid",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"}:{display:"inline-block",border:"1px solid #072C1C",borderRadius:"8px",padding:"0",width:"250px",height:"250px",maxWidth:"100%"},children:n.jsx(L,{icon:$,iconSize:40,value:JSON.stringify(Object.fromEntries(Object.entries(e||{}).filter(([t])=>!(t==="quantity"&&(e!=null&&e.serialNumber))))),type:"svg",style:{width:"100%",height:"100%",border:"none"}})}),n.jsxs("div",{className:"flex flex-col items-center",children:[n.jsx("div",{className:"font-bold text-sm mb-2",style:i!=="default"?{color:o.text}:{color:"#072C1C"},children:"Image format:"}),n.jsxs(b.Group,{children:[n.jsx(b,{type:"primary",onClick:()=>l("PNG"),style:w("PNG"),disabled:!h,children:"PNG"}),n.jsx(b,{type:"primary",onClick:()=>l("SVG"),style:w("SVG"),disabled:!h,children:"SVG"})]})]}),n.jsxs(b,{onClick:()=>f(a),className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!h,children:["Download ",a]}),n.jsx(b,{onClick:y,className:"qr-action-btn shadow-md text-base sm:text-lg",type:"primary",style:{width:"100%",maxWidth:"177px",height:"31px"},disabled:!h,children:"Print QR Code"})]})]})})};export{B as default};
