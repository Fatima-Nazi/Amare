const cards = document.getElementById("cards");

if(cards && typeof perfumes !== "undefined"){

perfumes.forEach(p=>{

cards.innerHTML+=`

<div class="col-md-4">

<div class="card perfume-card text-center">

<img src="${p[2]}" class="card-img-top">

<div class="card-body">

<h5>${p[0]}</h5>
<p>Rs. ${p[1]}</p>

<button onclick="orderNow('${p[0]}',${p[1]})" class="btn btn-dark w-100">
Order Now
</button>

</div>

</div>

</div>

`;

});

}


// WHATSAPP ORDER

function orderNow(name,price){

let msg = `Order%0AProduct: ${name}%0APrice: Rs.${price}`;
window.open(`https://wa.me/923313077774?text=${msg}`,'_blank');

}


// CONTACT FORM

function sendOrder(){

let name = document.getElementById("name").value;
let phone = document.getElementById("phone").value;
let product = document.getElementById("product").value;

let msg = `New Order%0AName: ${name}%0APhone: ${phone}%0AProduct: ${product}`;

window.open(`https://wa.me/923313077774?text=${msg}`,'_blank');

}