import{a}from"./auth-CMvdZPx9.js";const t=async()=>(await a.get("/user/orders")).data.data,o=async r=>(await a.get("/admin/orders",{params:{order_id:r}})).data.data;export{t as a,o as g};
