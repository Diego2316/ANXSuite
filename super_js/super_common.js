// Common constants

const d = document,
      ls = localStorage,
      ss = sessionStorage;

const $modalAlertBox = d.getElementById("modal-alert-box"),
      $closeAlertBox = d.getElementById("close-alert-box"),
      $alertContent = d.getElementById("alert-content");

// Service Worker

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js')
  .catch(err => console.warn(err));
}

//Topbar

const $user = d.getElementById("user-name"),
      $level = d.getElementById("user-level");

d.addEventListener("DOMContentLoaded",async()=>{
  try {
    let res = await fetch("/api/usuarioNivelCliente", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }),
        json = await res.json();
    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    ss.setItem("user",json.user);
    ss.setItem("level",json.level);
    ss.setItem("client", json.client);
    $user.textContent = ss.getItem("user");
   } catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $level.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
   }
})

// Dropdown

const $dropArchivo = d.getElementById("drop-archivo"),
      $dropVer = d.getElementById("drop-ver"),
      $dropOpciones = d.getElementById("drop-opciones"),
      $sideMenu = d.querySelector(".left-content"),
      $logo = d.querySelector(".logo"),
      $ocultarMenu = d.getElementById("ocultar-menu"),
      $modalSearchAnilox = d.getElementById("modal-search-anilox"),
      $buscarAnilox = d.getElementById("buscar-anilox"),
      $closeModalSearchAnilox = d.getElementById("close-search-anilox");

d.addEventListener("click",e=>{
  if(e.target.matches(".dropbtn")){
    let drop = e.target.nextElementSibling;
    if(drop.id == "drop-archivo"){
      $dropArchivo.classList.add("show");
      $dropVer.classList.remove("show");
      $dropOpciones.classList.remove("show");
    }
    else if(drop.id == "drop-ver"){
      $dropArchivo.classList.remove("show");
      $dropVer.classList.add("show");
      $dropOpciones.classList.remove("show");
    }
    else if(drop.id == "drop-opciones"){
      $dropArchivo.classList.remove("show");
      $dropVer.classList.remove("show");
      $dropOpciones.classList.add("show");
    }
    else if(drop.id == "drop-ayuda"){
      $dropArchivo.classList.remove("show");
      $dropVer.classList.remove("show");
      $dropOpciones.classList.remove("show");
    }
  }
  if(!e.target.matches(".dropbtn")){
    $dropArchivo.classList.remove("show");
    $dropVer.classList.remove("show");
    $dropOpciones.classList.remove("show");
  }
  if(e.target == $ocultarMenu){
    $sideMenu.classList.toggle("hide");
    $logo.classList.toggle("hide");
    if(ls.getItem("sidebar") == "show"){
      ls.setItem("sidebar","hide");
    }
    else if(ls.getItem("sidebar") == "hide"){
      ls.setItem("sidebar","show");
    }
  }
  if(e.target === $buscarAnilox){
    $modalSearchAnilox.style.display = "block";
  }
  if(e.target === $closeModalSearchAnilox){
    $modalSearchAnilox.style.display = "none";
  }
});

//Sidebar

const $logOut = d.getElementById("log-out"),
      $searchAnilox = d.getElementById("search-anilox"),
      $listado = d.getElementById("listado");

const logOut = e=>{
  ss.clear();
  e.stopPropagation();
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

const showSearchAnilox = e=>{
  e.stopPropagation();
  $modalSearchAnilox.style.display = "block";
}

const listado = e=>{
  e.stopPropagation();
  ss.setItem("client-list", "none")
}

$logOut.addEventListener("click",logOut);
$searchAnilox.addEventListener("click",showSearchAnilox);
$listado.addEventListener("click",listado);

// Alert Box

d.addEventListener("click", (e)=>{
  if(e.target === $closeAlertBox){
    $modalAlertBox.style.display = "none";
  }
});

//Error Message

const errorMessage = (error)=>{
  let errorCode = error.status || "2316",
      errorStatus = error.statusText || "No se pudo establecer contacto con el servidor",
      message1 = "Error " + errorCode,
      message2 = errorStatus;
  $alertContent.textContent = `${message1}: ${message2}`;
  $modalAlertBox.style.display = "block";
}

// Search Anilox

const $formSearch = d.querySelector(".form-search"),
      $searchId = d.getElementById("search-id");

d.addEventListener("submit",async(e)=>{
  if(e.target === $formSearch){
    e.preventDefault();
    let searchId = $searchId.value.toUpperCase();
    let clientsList = [], aniloxClient, aniloxBrand;
    let foundFlag;
    try {
      let res = await fetch("/api/clientes", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      json.forEach(el=>clientsList.push(el.name));
    } catch (err) {
      console.log(err);
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $formSearch.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $formSearch.nextElementSibling.remove()
      }, 2000);
    }
    for(let i = 0; i < clientsList.length; i++){
      try {
        let res = await fetch("/api/super-listado", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({client: clientsList[i], mensaje: "client"})
        }),
            json = await res.json();
        if(!res.ok) throw{status: res.status, statusText: res.statusText};
        json = json.result;
        json.forEach(el => {
          if(el.id === searchId){
            foundFlag = 1;
            aniloxBrand = el.brand;
            aniloxClient = el.empresa;
          }
        });
      } catch (err) {
        console.log(err);
        let errorCode = err.status || "2316",
            errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
            message1 = "Error " + errorCode + ": ",
            message2 = errorStatus;
        $formSearch.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
        setTimeout(()=>{
          $formSearch.nextElementSibling.remove()
        }, 2000);
      }
    }
    if(foundFlag === 1){
      ss.setItem("aniloxId", searchId);
      ss.setItem("aniloxBrand", aniloxBrand);
      ss.setItem("aniloxClient", aniloxClient.toUpperCase());
      window.location.href = 'super_anilox-detail.html';
    }
    if(foundFlag !== 1){
      $alertContent.textContent = `No se encontro ánilox con el código ingresado en su base de datos.`;
      $modalAlertBox.style.display = "block";
    }
    $searchId.value = "";
  }
});

// Base 64 to Blob

const b64toBlob = (b64Data, contentType='application/pdf', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}