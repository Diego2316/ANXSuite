// Common Constants

const d = document,
      ls = localStorage,
      ss = sessionStorage;

const $modalAlertBox = d.getElementById("modal-alert-box"),
      $closeAlertBox = d.getElementById("close-alert-box"),
      $alertContent = d.getElementById("alert-content");

// Unit text

const $volumeText = d.querySelectorAll(".volumeUnit"),
      $screenText = d.querySelectorAll(".screenUnit"),
      $volumeTitle = d.querySelectorAll(".volumeTitle");

let volMulti, screenMulti;

d.addEventListener("DOMContentLoaded",()=>{
  if(ls.getItem("volumeUnit") === null){
    ls.setItem("volumeUnit","BCM");
    volMulti = 1;
  }
  if(ls.getItem("screenUnit") === null){
    ls.setItem("screenUnit","LPI");
    screenMulti = 1;
  }
  if(ls.getItem("volumeUnit") === "BCM"){
    volMulti = 1;
  }
  if(ls.getItem("screenUnit") === "LPI"){
    screenMulti = 1;
  }
  if(ls.getItem("volumeUnit") === "cm3/m2"){
    volMulti = 1.55;
  }
  if(ls.getItem("screenUnit") === "LPCM"){
    screenMulti = 2.54;
  }
  $volumeText.forEach(el=>{
    el.textContent = `(${ls.getItem("volumeUnit")}):`;
  })
  $screenText.forEach(el=>{
    el.textContent = `(${ls.getItem("screenUnit")}):`;
  })
  $volumeTitle.forEach(el=>{
    el.title = `Volumen de celda de ánilox (${ls.getItem("volumeUnit")})`;
  });
});

// Unit Config

const $modalConfigUnits = d.getElementById("modal-config-units"),
      $openConfigUnits = d.getElementById("open-config-units"),
      $closeConfigUnits = d.getElementById("close-config-units"),
      $unitBCM = d.getElementById("unit-BCM"),
      $unitCM3M2 = d.getElementById("unit-cm3m2"),
      $unitLPI = d.getElementById("unit-LPI"),
      $unitLPCM = d.getElementById("unit-LPCM");

d.addEventListener("click", (e)=>{
  if(e.target === $openConfigUnits){
    $modalConfigUnits.style.display = "block";
    if(ls.getItem("volumeUnit") === "BCM"){
      $unitBCM.checked = true;
      $unitCM3M2.checked = false;
    }
    if(ls.getItem("screenUnit") === "LPI"){
      $unitLPI.checked = true;
      $unitLPCM.checked = false;
    }
    if(ls.getItem("volumeUnit") === "cm3/m2"){
      $unitBCM.checked = false;
      $unitCM3M2.checked = true;
    }
    if(ls.getItem("screenUnit") === "LPCM"){
      $unitLPI.checked = false;
      $unitLPCM.checked = true;
    }
  }
  if(e.target === $unitBCM){
    if($unitBCM.checked === true){
      ls.setItem("volumeUnit", "BCM");
      $volumeText.forEach(el=>{
        el.textContent = `(${ls.getItem("volumeUnit")}):`;
      });
      $volumeTitle.forEach(el=>{
        el.title = `Volumen de celda de ánilox (${ls.getItem("volumeUnit")})`;
      });
    }
  }
  if(e.target === $unitLPI){
    if($unitLPI.checked === true){
      ls.setItem("screenUnit", "LPI");
      $screenText.forEach(el=>{
        el.textContent = `(${ls.getItem("screenUnit")}):`;
      });
    }
  }
  if(e.target === $unitCM3M2){
    if($unitCM3M2.checked === true){
      ls.setItem("volumeUnit", "cm3/m2");
      $volumeText.forEach(el=>{
        el.textContent = `(${ls.getItem("volumeUnit")}):`;
      });
      $volumeTitle.forEach(el=>{
        el.title = `Volumen de celda de ánilox (${ls.getItem("volumeUnit")})`;
      });
    }
  }
  if(e.target === $unitLPCM){
    if($unitLPCM.checked === true){
      ls.setItem("screenUnit", "LPCM");
      $screenText.forEach(el=>{
        el.textContent = `(${ls.getItem("screenUnit")}):`;
      });
    }
  }
  if(e.target === $closeConfigUnits){
    $modalConfigUnits.style.display = "none";
    location.reload(true);
  }
});

// Service Worker

// if('serviceWorker' in navigator){
//   navigator.serviceWorker.register('./sw.js')
//   .catch(err => console.warn(err));
// }

// Dropdown

const dropArchivo = d.getElementById("drop-archivo"),
      dropVer = d.getElementById("drop-ver"),
      dropOpciones = d.getElementById("drop-opciones"),
      dropAyuda = d.getElementById("drop-ayuda"),

      sideMenu = d.querySelector(".left-content"),
      logo = d.querySelector(".logo"),
      ocultarMenu = d.getElementById("ocultar-menu"),

      modalSearchAnilox = d.getElementById("modal-search-anilox"),
      buscarAnilox = d.getElementById("buscar-anilox"),
      closeModalSearchAnilox = d.getElementById("close-search-anilox");

d.addEventListener("click",e=>{
  if(e.target.matches(".dropbtn")){
    let drop = e.target.nextElementSibling;
    if(drop.id == "drop-archivo"){
      dropArchivo.classList.add("show");
      dropVer.classList.remove("show");
      dropOpciones.classList.remove("show");
      dropAyuda.classList.remove("show");
    }
    else if(drop.id == "drop-ver"){
      dropArchivo.classList.remove("show");
      dropVer.classList.add("show");
      dropOpciones.classList.remove("show");
      dropAyuda.classList.remove("show");
    }
    else if(drop.id == "drop-opciones"){
      dropArchivo.classList.remove("show");
      dropVer.classList.remove("show");
      dropOpciones.classList.add("show");
      dropAyuda.classList.remove("show");
    }
    else if(drop.id == "drop-ayuda"){
      dropArchivo.classList.remove("show");
      dropVer.classList.remove("show");
      dropOpciones.classList.remove("show");
      dropAyuda.classList.add("show");
    }
  }

  if(!e.target.matches(".dropbtn")){
    dropArchivo.classList.remove("show");
    dropVer.classList.remove("show");
    dropOpciones.classList.remove("show");
    dropAyuda.classList.remove("show");
  }

  if(e.target == ocultarMenu){
    sideMenu.classList.toggle("hide");
    logo.classList.toggle("hide");
    if(ls.getItem("sidebar") == "show"){
      ls.setItem("sidebar","hide");
    }
    else if(ls.getItem("sidebar") == "hide"){
      ls.setItem("sidebar","show");
    }
  }

  if(e.target === buscarAnilox){
    modalSearchAnilox.style.display = "block";
  }

  if(e.target === closeModalSearchAnilox){
    modalSearchAnilox.style.display = "none";
  }

  if (e.target.matches("#cerrar-sesion")) {
    // Borrar todas las cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
});

d.addEventListener("DOMContentLoaded",()=>{
  if(ls.getItem("sidebar") === null){
    ls.setItem("sidebar","show");
  }
  if(ls.getItem("sidebar") === "show"){
    sideMenu.classList.remove("hide");
    logo.classList.remove("hide");
  }
  if(ls.getItem("sidebar") === "hide"){
    sideMenu.classList.add("hide");
    logo.classList.add("hide");
  }
});

//Topbar

const $user = d.getElementById("user-name"),
      $level = d.getElementById("user-level");

const $clientLogo = d.getElementById("client-logo");

const getUserLevelClient = async()=>{
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
  $clientLogo.src = `./assets/${json.client}-logo.png`;
  $user.textContent = ss.getItem("user");
  let level = ss.getItem("level");
  if(level === "1"){
    $level.textContent = "Operario";
  }
  else if(level === "2"){
    $level.textContent = "Supervisor";
  }
  else if(level === "3"){
    $level.textContent = "Administrador";
  }
 } catch (err) {
  let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $level.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
 }
}

d.addEventListener("DOMContentLoaded",getUserLevelClient);

//Sidebar

const $logOut = d.getElementById("log-out"),
      $modalSearchAnilox = d.getElementById("modal-search-anilox"),
      $searchAnilox = d.getElementById("search-anilox"),
      $closeSearchAnilox = d.getElementById("close-search-anilox");

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

const closeSearchAnilox = e=>{
  e.stopPropagation();
  $modalSearchAnilox.style.display = "none";
}

$logOut.addEventListener("click",logOut);
$searchAnilox.addEventListener("click",showSearchAnilox);
$closeSearchAnilox.addEventListener("click",closeSearchAnilox);

// Search Anilox

const $formSearch = d.querySelector(".form-search"),
      $searchId = d.getElementById("search-id");
      
const searchAnilox = async(e)=>{
  if(e.target === $formSearch){
    e.preventDefault();
    let searchId = $searchId.value.toUpperCase();
    let aniloxBrand;
    try {
      let res = await fetch("/api/listado", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
      }),
      json = await res.json();
      json = json.result;
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      
      let foundFlag;

      json.forEach(el=>{
        if(el.id === searchId){
          aniloxBrand = el.brand;
          foundFlag = 1;
        }
      });
      if(foundFlag === 1){
        ss.setItem("aniloxId", searchId);
        ss.setItem("aniloxBrand", aniloxBrand);
        window.location.href = 'anilox-detail.html';
      }
      if(foundFlag !== 1){
        alert("No se encontró ánilox con el código ingresado en su base de datos");
      }
      $searchId.value = "";
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
}

d.addEventListener("submit",searchAnilox);

// Alert Box

const closeAlertBox = (e)=>{
  if(e.target === $closeAlertBox){
    $modalAlertBox.style.display = "none";
  }
}

d.addEventListener("click", closeAlertBox);

// License remaining days

const $daysLeft = d.getElementById("days-left");

const getDaysLeft = async()=>{
  let expirationDate;
  try {
    let res = await fetch("/api/licencias", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
    }),
      json = await res.json();

    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    ss.setItem("expiration", json.result[0].expiration);
    expirationDate = json.result[0].expiration;
  } 
  catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $daysLeft.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
  
  let today = (new Date().toISOString()).slice(0,10);
  let days = Math.floor((Math.abs(Date.parse(expirationDate) - Date.parse(today)) /1000) / 86400);
  $daysLeft.textContent = days;
}

d.addEventListener("DOMContentLoaded", getDaysLeft);