const $clientsList = d.querySelector(".clients-table"),
      $clientsListTemplate = d.getElementById("clients-template").content,
      $clientsListFragment = d.createDocumentFragment(),
      $listaClientes = d.querySelector(".lista-clientes"),
      $aniloxList = d.querySelector(".anilox-table"),
      $aniloxListBody = d.getElementById("anilox-table-body"),
      $aniloxListTemplate = d.getElementById("anilox-template").content,
      $aniloxListFragment = d.createDocumentFragment(),
      $listaAnilox = d.querySelector(".lista-anilox"),
      $middle = d.querySelector(".middle"),
      $specificData = d.getElementById("specific-data"),
      $specificType = d.getElementById("specific-type"),
      $specificAngle = d.getElementById("specific-angle"),
      $specificVol = d.getElementById("specific-vol"),
      $specificScreen = d.getElementById("specific-screen"),
      $aniloxQuantity = d.getElementById("anilox-quantity");

const $quote = d.querySelector(".quote"),
      $quoteList = d.querySelector(".quote-list"),
      $quoteTemplate = d.getElementById("quote-template").content,
      $quoteBody = d.querySelector(".quote-body"),
      $addToQuote = d.getElementById("add-to-quote");

const $requestQuote = d.getElementById("request-quote");

let selectedClient;

const getClientsList = async()=>{
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
    let clientList = [];
    json.forEach(el=>clientList.push(el.name));
    clientList.forEach(el => {
      $clientsListTemplate.querySelector(".client").textContent = el.toUpperCase();
      let $clone = d.importNode($clientsListTemplate, true);
      $clientsListFragment.appendChild($clone);
    });
    $clientsList.querySelector("tbody").appendChild($clientsListFragment);
  } catch (err) {
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $clientsList.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
}

const getAniloxList = async(e)=>{
  if(e.target.matches(".client")){
    selectedClient = e.target.textContent.toLowerCase();
    $aniloxListBody.innerHTML = "";
    $quoteBody.innerHTML = "";
    $specificType.textContent = '';
    $specificAngle.textContent = '';
    $specificVol.textContent = '';
    $specificScreen.textContent = '';
    $aniloxQuantity.textContent = '';
    for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
      e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
    }
    e.target.classList.add("selected");
    try {
      let res = await fetch('/api/super-listado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({client: selectedClient, mensaje: "client"}),
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      json.forEach(el => {
        $aniloxListTemplate.querySelector(".id").textContent = el.id;
        let $clone = d.importNode($aniloxListTemplate, true);
        $aniloxListFragment.appendChild($clone);
      });
      $aniloxList.querySelector("tbody").appendChild($aniloxListFragment);
    } catch (err) {
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $aniloxList.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
    }
  }
}

const getAniloxData = async(e)=>{
  if(e.target.matches(".id")){
    selectedId = e.target.textContent.toUpperCase();
    $aniloxQuantity.value = "";
    for(let i = 0; i < e.target.parentElement.parentElement.children.length; i++){
      e.target.parentElement.parentElement.children[i].children[0].classList.remove("selected");
    }
    e.target.classList.add("selected");
    try {
      let res = await fetch('/api/super-listado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({client: selectedClient, mensaje: "quote", id: selectedId}),
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result[0];
      $specificType.textContent = json.type;
      $specificAngle.textContent = json.angle;
      $specificVol.textContent = json.nomvol;
      $specificScreen.textContent = json.screen;
    } catch (err) {
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $specificData.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
      setTimeout(()=>{
        $specificData.nextElementSibling.remove()
      }, 2000);
    }
  }
}

const addAniloxToQuote = (e)=>{
  if(e.target === $addToQuote){
    if($aniloxQuantity.value !== "" && $aniloxQuantity.value > 0 && $specificType.textContent !== '' && $specificAngle.textContent !== '' && $specificVol.textContent !== '' && $specificScreen.textContent !== ''){
      let cantItems = $quoteBody.childElementCount;
      $quoteTemplate.querySelector(".specific-item-number").textContent = (cantItems + 1);
      $quoteTemplate.querySelector(".specific-item-quantity").textContent = $aniloxQuantity.value;
      $quoteTemplate.querySelector(".specific-item-type").textContent = $specificType.textContent;
      $quoteTemplate.querySelector(".specific-item-angle").textContent = $specificAngle.textContent;
      $quoteTemplate.querySelector(".specific-item-vol").textContent = $specificVol.textContent;
      $quoteTemplate.querySelector(".specific-item-screen").textContent = $specificScreen.textContent;
      let $clone = d.importNode($quoteTemplate, true);
      $quoteBody.appendChild($clone);
      $aniloxQuantity.value = "";
    }
    else{
      $alertContent.textContent = "Por favor ingrese valores válidos para agregar a la cotización.";
      $modalAlertBox.style.display = "block";
    }
  }
}

const removeFromQuote = (e)=>{
  if(e.target.matches(".remove-from-quote")){
    e.target.parentElement.parentElement.remove();
    let cantItems = $quoteBody.childElementCount;
    for(let i = 0; i < cantItems; i++){
      $quoteBody.children[i].querySelector(".specific-item-number").textContent = (i + 1);
    }
  }
}

const requestQuote = async(e)=>{
  if(e.target === $requestQuote){
    let cantItems = $quoteBody.childElementCount;
    let mensaje;
    if(cantItems > 0){
      try {
        let req = [];
        if(cantItems === 1) mensaje = "send quote";
        for(let i = 0; i < cantItems; i++){
          let item = $quoteBody.children[i];
          let type = item.querySelector(".specific-item-type").textContent,
              nomvol = item.querySelector(".specific-item-vol").textContent,
              screen = item.querySelector(".specific-item-screen").textContent,
              angle = item.querySelector(".specific-item-angle").textContent,
              amount = item.querySelector(".specific-item-quantity").textContent;
          req.push({
            id: i+1,
            type: type,
            nomvol: nomvol,
            screen: screen,
            angle: angle,
            amount: amount,
            mensaje: mensaje
          });
        }
        let options = {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            reqDate: (new Date(Date.now()).toJSON()).slice(0, 10),
            req2: req,
            volUnit: "BCM",
            screenUnit: "LPI"
          }),
        },
            res = await fetch('/api/request-quotes', options);
        if(res.ok) {
          $alertContent.textContent = "Solicitud registrada exitosamente.";
          $modalAlertBox.style.display = "block";
          setTimeout(()=>{
            $quoteBody.replaceChildren();
          }, 3000);
        };
        if(!res.ok) throw{status: res.status, statusText: res.statusText};
      } catch (err) {
        let errorCode = err.status || "2316",
            errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
            message1 = "Error " + errorCode + ": ",
            message2 = errorStatus;
        $quoteList.insertAdjacentHTML("afterend",`<p><b>${message1}</b>${message2}</p>`);
        setTimeout(()=>{
          $quoteList.nextElementSibling.remove()
        }, 2000);
      }
    }
    else{
      $alertContent.textContent = "Por favor, ingrese items a su solicitud antes de registrarla.";
      $modalAlertBox.style.display = "block";
    }
  }
}

d.addEventListener("DOMContentLoaded", getClientsList);
d.addEventListener("click", getAniloxList);
d.addEventListener("click", getAniloxData);
d.addEventListener("click", addAniloxToQuote);
d.addEventListener("click", removeFromQuote);
d.addEventListener("click", requestQuote);