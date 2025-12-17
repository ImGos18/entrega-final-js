"use strict";
import L from "../node_modules/leaflet";
import Swal from "sweetalert2";
import "dotenv/config";

//Select elements
const overlay = document.querySelector(".overlay");
const modalAddRoute = document.querySelector(".add-route-window");
const closeModalBtn = document.querySelector("#closeModal");
const addRouteBtn = document.querySelector(".add-route");
const submitRouteBtn = document.querySelector(".createRideBtn");
const form = document.querySelector(".upload");
const routeContainer = document.querySelector(".routes-container");
let initialCoords;
let lat, lng;
let map;
let marker;
let routes = JSON.parse(localStorage.getItem("travels")) || [];

//JSON.parse(localStorage.getItem("travels")) ||

//Functions
function resetMapView(lat, lng) {
  setTimeout(() => {
    map.setView([...initialCoords], 15);
  }, 1000);
}
function openCloseModal() {
  modalAddRoute.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
  if (marker) {
    marker.remove();
    lat = null;
    lng = null;
    resetMapView(...initialCoords);
  }
}
function loadMap(position) {
  const { latitude, longitude } = position.coords;

  initialCoords = [latitude, longitude];

  map = L.map("map").setView([latitude, longitude], 15);
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
  ).addTo(map);

  map.on("click", function (e) {
    lat = e.latlng.lat;
    lng = e.latlng.lng;

    marker = L.popup()
      .setLatLng(e.latlng)
      .setContent("ride point selected")
      .openOn(map);
  });
}

function renderRoutes(routes) {
  routeContainer.innerHTML = "";
  if (routes.length === 0) {
    routeContainer.innerHTML = `<p style="">No rides booked yet  <i class="bi bi-emoji-smile"></i></p>`;

    return;
  }

  const key = process.env.KEY;
  routes.forEach(async (route) => {
    const location = await getPlace(route.coords.lat, route.coords.lng);

    let html = ``;
    const img = `https://maps.googleapis.com/maps/api/staticmap
?center=${route.lat},${route.lng}
&zoom=17
&size=600x400
&markers=color:red|${route.coords.lat},${route.coords.lng}
&key=${key}`;
    html += `
  <div class="card-route-info" data-route-id="${route.id}">
    <img
      src="${img}"
      alt=""
      class="route-img"
    />
    <div class="name-status">
      <h2>${route.rideName}</h2>
      <p class="confirmed"><i class="bi bi-check-circle"></i>confirmed</p>
    </div>
    <div class="date">
      <i class="bi bi-calendar"></i>
      <p>${new Date(route.date).toDateString()}, ${route.time}</p>
       <i class="bi bi-trash ms-auto delete-route"></i>
    </div>
    <div class="distance">
      <i class="bi bi-globe-americas"></i>
      <p>${location.locality}, ${location.countryName}</p>
    </div>
    <a href="https://www.google.com/maps?q=${route.coords.lat},${
      route.coords.lng
    }" class="btn btn-primary open-map" target="_blank">
    
    <i class="bi bi-map-fill"> open in maps</i> 
  
    </a>
</div>`;
    routeContainer.insertAdjacentHTML("afterbegin", html);
  });
}

async function getPlace(lat, lng) {
  const req = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
  );
  const data = await req.json();

  return data;
}

function init() {
  navigator.geolocation.getCurrentPosition(loadMap, () =>
    Swal.fire({
      icon: "error",
      title: "We could'nt get your location",
      text: "give the app permission to your location in order to continue",
    })
  );

  renderRoutes(routes);
}
//handlers
closeModalBtn.addEventListener("click", () => {
  resetMapView(lat, lng);
  openCloseModal();
});

addRouteBtn.addEventListener("click", function () {
  openCloseModal();
});

submitRouteBtn.addEventListener("click", function (e) {});

document.addEventListener("click", function (e) {
  if (!e.target.classList.contains("overlay")) return;
  openCloseModal();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const inputs = document.querySelectorAll("input");
  const routeArr = [...new FormData(this)];
  const data = Object.fromEntries(routeArr);

  const rideData = {
    rideName: data.rideName,
    date: data.date,
    time: data.time,
    description: data.description,
    coords: { lat, lng },
    id: Date.now(),
  };
  if (
    !data.rideName ||
    !data.date ||
    !data.time ||
    !data.description ||
    !lat ||
    !lng
  ) {
    Swal.fire({
      icon: "error",
      title: "Missing data",
      text: "You must complete all the fields and select a destination point on the map",
      confirmButtonColor: "#0b5ed7",
    });

    return;
  }

  resetMapView(...initialCoords);
  routes.push(rideData);
  localStorage.setItem("travels", JSON.stringify(routes));
  Swal.fire({
    icon: "success",
    title: "Ride booked",
    confirmButtonColor: "green",
  });

  this.querySelectorAll("input").forEach((input) => (input.value = ""));
  this.querySelector("textarea").value = "";
  openCloseModal();

  renderRoutes(routes);
  console.log(routes);
});

routeContainer.addEventListener("click", function (e) {
  if (!e.target.classList.contains("delete-route")) return;
  const route = e.target.closest(".card-route-info");

  const idDelete = Number(route.dataset.routeId);

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleted!",
        text: "Your ride has been deleted.",
        icon: "success",
        confirmButtonColor: "#0b5ed7",
      });

      const newRoutes = routes.filter((route) => route.id !== idDelete);

      routes = newRoutes;
      localStorage.setItem("travels", JSON.stringify(routes));
      renderRoutes(routes);
    }
  });

  // routes = routes.filter((route) => route.id !== idDelete);
});

init();

function clearStorage() {
  localStorage.clear();
}

// getPlace(-33.726122, -70.32036);

// clearStorage();

/*


  
//elementos
const nombreEl = document.getElementById("nombre-ruta");
const destinoEl = document.getElementById("destino-ruta");
const descripcionEl = document.getElementById("descripcion-ruta");
const enviar = document.getElementById("guardar");
const contenedorRutas = document.querySelector(".list-group");
const listarutas = document.querySelector(".lista-rutas");
const borrarTodo = document.querySelector(".borrar-todo");

//Variables
let rutas = JSON.parse(localStorage.getItem("rutas")) || [];

//Funciones
function guardarRuta() {
  let nombreRuta = nombreEl.value;
  let destinoRuta = destinoEl.value;
  let descripcionRuta = descripcionEl.value;
  let confirmacion = confirm("¿Quieres agregar esta ruta?");
  const id = (new Date().getTime() + "").slice(-9);
  
  if (!nombreRuta || !descripcionRuta || !destinoRuta) {
    alert("debes rellenar todos los campos para enviar una ruta ");
    return;
  }
  if (!confirmacion) return;
  else {
    const ruta = {
  nombre: nombreRuta,
  destino: destinoRuta,
  descripcion: descripcionRuta,
  id,
};

rutas.push(ruta);
mostrarRutas(rutas);
alert("ruta agendada");
nombreEl.value = destinoEl.value = descripcionEl.value = "";
console.log("Tus rutas agendadas son: ", rutas);
}
}

function mostrarRutas(arrRutas) {
  if (arrRutas.length === 0) {
    contenedorRutas.innerHTML = "";
    const html = `  <li class="list-group-item">
    <h4 style="color: lightgray">
    Aqui apareceran tus rutas cuando las agendes
    </h4>
    </li>`;
    
    contenedorRutas.insertAdjacentHTML("afterbegin", html);
    return;
  }
  contenedorRutas.innerHTML = "";
  console.log(rutas);
  for (const ruta of arrRutas) {
    const html = `
    <li class="list-group-item item-ruta" data-id-ruta="${ruta.id}">
    <h3>${ruta.nombre}</h3>
    <p><strong>Destino: </strong>${ruta.destino}</p>
    <p><strong>Descripcion: </strong><br>${ruta.descripcion}</p>
    <svg xmlns="http://www.w3.org/2000/svg" class="borrar" width="30" height="30" viewBox="0 0 24 24"><g fill="none" stroke="#dc2626" data-ruteId="${ruta.id}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="24" stroke-dashoffset="24" d="M12 20h5c0.5 0 1 -0.5 1 -1v-14M12 20h-5c-0.5 0 -1 -0.5 -1 -1v-14"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0"/></path><path stroke-dasharray="20" stroke-dashoffset="20" d="M4 5h16"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.2s" values="20;0"/></path><path stroke-dasharray="8" stroke-dashoffset="8" d="M10 4h4M10 9v7M14 9v7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="8;0"/></path></g></svg>
    </li>`;
    contenedorRutas.insertAdjacentHTML("afterbegin", html);
  }
}

//listeners
enviar.addEventListener("click", function (e) {
  e.preventDefault();
  guardarRuta();
  
  localStorage.setItem("rutas", JSON.stringify(rutas));
});

//borrar alguna ruta
listarutas.addEventListener("click", function (e) {
  if (!e.target.classList.contains("borrar")) {
    return;
  }
  
  const eliminarRuta = Number(e.target.closest(".item-ruta").dataset.idRuta);
  
  // console.log(eliminarRuta);
  if (!confirm("seguro que quieres eliminarla?")) return;
  const nuevaLista = rutas.filter((ruta) => ruta.id != eliminarRuta);
  console.log(nuevaLista, "hola");
  
  rutas = nuevaLista;
  
  localStorage.setItem("rutas", JSON.stringify(rutas));
  mostrarRutas(rutas);
});

//Borrar Todo
borrarTodo.addEventListener("click", function (e) {
  e.preventDefault();
  if (rutas.length === 0) {
    alert("la lista ya esta vacia ");
    return;
  }
  if (!confirm("seguro que quieres eliminar todo?")) return;
  localStorage.clear();
  rutas = [];
  mostrarRutas(rutas);
});

//app

//mostrar rutas al iniciar la app
rutas && mostrarRutas(rutas);

*/
