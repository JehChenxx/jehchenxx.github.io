"use strict";(self.webpackChunk=self.webpackChunk||[]).push([[717],{7438:function(L,u,n){n.d(u,{f:function(){return T}});var D=n(82092),A=n.n(D),M=n(48305),v=n.n(M),O=n(95744),c=n(19158),f=n(34505),g=n(53595),P=n(73844),C=n(64616),x=n(32699),m=n.n(x),_=n(93236),t=n(62086),e="encryptedKey",T=function(){var s=localStorage.getItem(e);return s&&window.atob(window.atob(s))},B=function(){var s=c.Z.useForm(),j=v()(s,1),a=j[0],h=(0,_.useState)(!1),o=v()(h,2),r=o[0],l=o[1];return(0,_.useEffect)(function(){r&&a.setFieldsValue(A()({},e,localStorage.getItem(e)))},[r]),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(O.Z,{onClick:function(){return l(!0)}}),(0,t.jsx)(f.Z,{open:r,title:"MongoDB Altas",footer:(0,t.jsx)(g.ZP,{type:"primary",onClick:function(){return a.validateFields().then(function(d){if((0,x.isEmpty)(d[e]))f.Z.confirm({title:"\u8B66\u544A",content:"\u786E\u8BA4\u540E\u5C06\u6E05\u9664Data Api Key\u7F13\u5B58",onOk:function(){return localStorage.removeItem(e)}});else try{d[e]!==localStorage.getItem(e)&&localStorage.setItem(e,window.btoa(window.btoa(d[e]))),l(!1)}catch(R){P.ZP.error({message:"\u4FDD\u5B58\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u8F93\u5165\u65E0\u7279\u6B8A\u5B57\u7B26\u540E\u5C1D\u8BD5\u4FDD\u5B58"})}})},children:"\u786E\u5B9A"}),onCancel:function(){return l(!1)},children:(0,t.jsx)(c.Z,{name:"mongodb",form:a,children:(0,t.jsx)(c.Z.Item,{label:"Data Api Key",name:e,children:(0,t.jsx)(C.Z.TextArea,{rows:10,allowClear:!0})})})})]})};u.Z=B},2207:function(L,u,n){n.r(u),n.d(u,{default:function(){return s}});var D=n(48305),A=n.n(D),M=n(38880),v=n(18192),O=n(87403),c=n(80416),f=n(27802),g=n(99069),P=n(62897),C=n(64616),x=n(93236),m=n(88331),_=n(26068),t=n.n(_),e=n(62086),T=function(a){var h=a.weight,o=h===void 0?64:h,r={rx:"5",ry:"5",style:{fill:"red",stroke:"black",strokeSidth:5,opacity:.5}};return(0,e.jsxs)("svg",{viewBox:"0 0 1024 1024",width:"1em",height:"1em",fill:"currentColor",children:[(0,e.jsx)("rect",t()(t()({},r),{},{x:"0",y:"0",width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:512-o,y:"0",width:o,height:"1024"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"0",y:1024-o,width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"0",y:"512",width:o,height:"512"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"0",y:"512",width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:512-o,width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:1024-o,y:"0",width:o,height:"512"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:"0",width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:"0",width:o,height:"768"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:768-o,width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:1024-o,y:"512",width:o,height:"246"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"768",y:"512",width:"256",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"768",y:"512",width:o,height:"512"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:1024-o,width:"256",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:"768",width:o,height:"256"})),(0,e.jsx)("rect",t()(t()({},r),{},{x:"512",y:"768",width:"512",height:o})),(0,e.jsx)("rect",t()(t()({},r),{},{x:1024-o,y:"768",width:o,height:"256"}))]})},B=T,I=n(7438);function s(){var j=(0,m.Ov)(),a=j.clientRoutes,h=(0,m.TH)(),o=(0,x.useState)(0),r=A()(o,2),l=r[0],y=r[1],d=[g.Z.defaultAlgorithm,g.Z.darkAlgorithm,g.Z.compactAlgorithm],R=[M.Z,v.Z,O.Z],Z=function(){return y((l+1)%d.length)};return(0,e.jsx)(P.ZP,{theme:{algorithm:d[l]},children:(0,e.jsx)(f.f,{layout:"mix",logo:(0,e.jsx)(c.Z,{component:function(){return(0,e.jsx)(B,{})}}),title:"JehChen",avatarProps:{src:"https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",size:"small",title:"Jeh"},actionsRender:function(i){return i.isMobile?[]:[i.layout!=="side"&&document.body.clientWidth>1400?(0,e.jsx)(C.Z,{}):void 0,(0,e.jsx)(I.Z,{}),(0,x.createElement)(R[l],{onClick:Z})]},route:a[0],location:h,menuItemRender:function(i,K){return i.isUrl||i.children?K:i.path&&h.pathname!==i.path?(0,e.jsx)(m.rU,{to:i.path,target:i.target,children:K}):K},menuFooterRender:function(){return"@JehChen"},children:(0,e.jsx)(m.j3,{})})})}}}]);