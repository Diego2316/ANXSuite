Chart.register(ChartDataLabels);

const $aniloxId = d.getElementById("anilox-id"),
      aniloxId = ss.getItem("aniloxId"),
      aniloxBrand = ss.getItem("aniloxBrand");

const $dataTop = d.querySelector(".data-top"),
      $dataMid = d.querySelector(".data-middle"),
      $dataBot = d.querySelector(".data-bottom");

const $dataBrand = d.getElementById("data-brand"),
      $dataType = d.getElementById("data-type"),
      $dataPurchase = d.getElementById("data-purchase"),
      $dataVolume = d.getElementById("data-volume"),
      $dataDepth = d.getElementById("data-depth"),
      $dataOpening = d.getElementById("data-opening"),
      $dataWall = d.getElementById("data-wall"),
      $dataScreen = d.getElementById("data-screen"),
      $dataAngle = d.getElementById("data-angle"),
      $dataLast = d.getElementById("data-last"),
      $dataNext = d.getElementById("data-next");

const $viewMore = d.getElementById("ver-mas"),
      $closeModalDataAnilox = d.getElementById("close-modal-data-anilox"),
      $modalDataAnilox = d.getElementById("modal-data-anilox");

const $moreBrand = d.getElementById("more-brand"),
      $moreType = d.getElementById("more-type"),
      $morePurchase = d.getElementById("more-purchase"),
      $moreRecorrido = d.getElementById("more-recorrido"),
      $moreVolume = d.getElementById("more-volume"),
      $moreDepth = d.getElementById("more-depth"),
      $moreOpening = d.getElementById("more-opening"),
      $moreWall = d.getElementById("more-wall"),
      $moreScreen = d.getElementById("more-screen"),
      $moreAngle = d.getElementById("more-angle"),
      $moreLast = d.getElementById("more-last"),
      $moreNext = d.getElementById("more-next");

const $cleanGraph = d.getElementById("clean-graph"),
      $damagedGraph = d.getElementById("damaged-graph"),
      $wearGraph = d.getElementById("wear-graph"),
      $bcmChart = d.getElementById("bcm-graph"),
      $imagePatron = d.getElementById("patron-image"),
      $imageLast = d.getElementById("last-image"),
      $dataStatus = d.getElementById("data-status"),
      $dataStatusTransfer = d.getElementById("data-status-transfer"),
      $dataDiag = d.getElementById("data-diag"),
      $dataAct = d.getElementById("data-act");

const $eolGraph = d.getElementById("eol-graph"),
      $eolGraphContainer = d.getElementById("eol-graph-container"),
      $estimarVida = d.getElementById("estimar-vida"),
      $closeModalEOLAnilox = d.getElementById("close-modal-eol-anilox"),
      $modalEOLAnilox = d.getElementById("modal-eol-anilox"),
      $eolDescription = d.getElementById("eol-description");

const $cleanGraph2 = d.getElementById("clean-graph-2"),
      $damagedGraph2 = d.getElementById("damaged-graph-2"),
      $wearGraph2 = d.getElementById("wear-graph-2");

let cleanGraph, cleanGraphConfig, damagedGraph, damagedGraphConfig, wearGraph, wearGraphConfig, bcmChart, eolGraph, cleanGraph2, damagedGraph2, wearGraph2;

const $table = d.querySelector(".eol-table"),
      $tableContainer = d.getElementById("tabla-porcentajes"),
      $tableBody = d.querySelector(".table-body"),
      $template = d.getElementById("eol-table-template").content,
      $fragment = d.createDocumentFragment();

const $prevAnilox = d.getElementById("prev-anilox"),
      $nextAnilox = d.getElementById("next-anilox");

Chart.defaults.font.family = 'Rajdhani';

const getCompleteList = async() =>{
  let completeList = [];
  let currentIndex;
  let item = {
    id: '',
    brand: '',
  };
  try {
    let res = await fetch("api/listado", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }),
        json = await res.json();
        json = json.result;
    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    for(let i = 0; i < json.length; i++){
      let newItem = {...item};
      newItem.id = json[i].id;
      newItem.brand = json[i].brand;
      if(newItem.id === aniloxId){
        currentIndex = i;
      }
      completeList.push(newItem);
    }
  } catch (err) {
    console.log(err);
    let errorCode = error.status || "2316",
        errorStatus = error.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $alertContent.textContent = `${message1}: ${message2}`;
    $modalAlertBox.style.display = "block";
  }
  if(currentIndex > 0){
    $prevAnilox.dataset.load = `${completeList[currentIndex - 1].id},${completeList[currentIndex - 1].brand}`;
    $prevAnilox.title = completeList[currentIndex - 1].id;
    $prevAnilox.style.cursor = "pointer";
  }
  if(currentIndex < completeList.length - 1){
    $nextAnilox.dataset.load = `${completeList[currentIndex + 1].id},${completeList[currentIndex + 1].brand}`;
    $nextAnilox.title = completeList[currentIndex + 1].id;
    $nextAnilox.style.cursor = "pointer";
  }
  if($prevAnilox.dataset.load == ''){
    $prevAnilox.style.cursor = "not-allowed";
  }
  if($nextAnilox.dataset.load == ''){
    $nextAnilox.style.cursor = "not-allowed";
  }
}

const getAnilox = async()=>{
  try {
    $aniloxId.textContent = `${aniloxBrand} - ${aniloxId}`;

    let res1 = await fetch('api/listado', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: aniloxId})
    }),
        json1 = await res1.json();
        
    let res2 = await fetch('api/analysis', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: aniloxId})
    }),
        json2 = await res2.json();

    if(!res1.ok) throw{status: res1.status, statusText: res1.statusText};
    if(!res2.ok) throw{status: res2.status, statusText: res2.statusText};

    json1 = json1.result;
    json2 = json2.result;

    let brand = json1[0].brand;
    let type = json1[0].type;
    let purchase = json1[0].purchase;
    let recorrido = json1[0].recorrido;
    let volume = Math.round(((json1[0].volume*volMulti)+Number.EPSILON)*10)/10;
    let nomVol = Math.round(((json1[0].nomvol*volMulti)+Number.EPSILON)*10)/10;
    let depth = json1[0].depth;
    let opening = json1[0].opening;
    let wall = json1[0].wall;
    let screen = Math.round(((json1[0].screen/screenMulti)+Number.EPSILON)*10)/10;
    let angle = json1[0].angle;
    let last = json1[0].last;
    let next = json2[0].next;

    $dataBrand.textContent = brand;
    $dataType.textContent = type;
    $dataPurchase.textContent = purchase;
    $dataVolume.textContent = Math.round(volume * 10) / 10;
    $dataScreen.textContent = screen;
    $dataLast.textContent = last;
    $dataNext.textContent = next;

    $moreBrand.textContent = brand;
    $moreType.textContent = type;
    $morePurchase.textContent = purchase;
    $moreRecorrido.textContent = recorrido;
    $moreVolume.textContent = Math.round(volume * 10) / 10;
    $moreDepth.textContent = depth;
    $moreOpening.textContent = opening;
    $moreWall.textContent = wall;
    $moreScreen.textContent = screen;
    $moreAngle.textContent = angle;
    $moreLast.textContent = last;
    $moreNext.textContent = next;

    let statusTransfer = Math.round((((volume / nomVol) * 100) + Number.EPSILON) * 10) / 10;
    
    let tapadas = parseFloat(json2[0].tapadas),
        limpias = 100 - tapadas,
        danadas = parseFloat(json2[0].danadas),
        sinDano = 100 - danadas,
        desgastadas = parseFloat(json2[0].desgastadas),
        sinDesgaste = 100 - desgastadas;

    const dataCleanStat = {
      labels: [
        'Limpias',
        'Tapadas',
      ],
      datasets: [{
        data: [limpias, tapadas],
        backgroundColor: [
          'rgba(231,255,23,0.35)',
          'rgba(255,76,163,0.35)',
        ],
        hoverOffset: 4,
      }],
    };

    const dataDamagedStat = {
      labels: [
        'Sin Daño',
        'Dañadas',
      ],
      datasets: [{
        data: [sinDano, danadas],
        backgroundColor: [
          'rgba(231,255,23,0.35)',
          'rgba(255,76,163,0.35)',
        ],
        hoverOffset: 4,
      }]
    };

    const dataWearStat = {
      labels: [
        'Sin Desgaste',
        'Desgastadas',
      ],
      datasets: [{
        data: [sinDesgaste, desgastadas],
        backgroundColor: [
          'rgba(231,255,23,0.35)',
          'rgba(255,76,163,0.35)',
        ],
        hoverOffset: 4,
      }]
    };

    cleanGraphConfig = {
      type: "doughnut",
      data: dataCleanStat,
      options: {
        layout: {
          padding: {
            left: 20,
            right: 20,
          },
        },
        plugins: {
          title: {
            display: true,
            align: "center",
            color: "#363949",
            font: {
              weight: 500,
              size: 22,
            },
            padding: {
              top: 10,
              bottom: 10,
            },
            text: '% Celdas Tapadas'
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: {
                weight: 500,
                size: 14,
              },
              padding: 15,
              boxWidth: 35,
            },
            reverse: true,
          },
          datalabels:{
            color: '#363949',
            anchor: 'center',
            font: {
              size: 16,
              weight: 500,
            },
            formatter: function(value){
              return value + '%';
            }
          },
          tooltip: {
            enabled: true,
            titleFont: {
              size: 16,
              weight: 600,
            },
            bodyFont: {
              size: 14,
              weight: 500,
            },
            callbacks: {  
              label: function(context){
                let data = context.parsed;

                return ' ' + data + '%';
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    };
    cleanGraph = new Chart($cleanGraph, cleanGraphConfig);

    damagedGraphConfig = {
      type: "doughnut",
      data: dataDamagedStat,
      options: {
        layout: {
          padding: {
            left: 20,
            right: 20,
          },
        },
        plugins: {
          title: {
            display: true,
            align: "center",
            color: "#363949",
            font: {
              weight: 500,
              size: 22,
            },
            padding: {
              top: 10,
              bottom: 10,
            },
            text: '% Celdas Dañadas'
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: {
                weight: 500,
                size: 14,
              },
              padding: 15,
              boxWidth: 35,
            },
            reverse: true,
          },
          datalabels:{
            color: '#363949',
            anchor: 'center',
            font: {
              size: 16,
              weight: 500,
            },
            formatter: function(value){
              return value + '%';
            }
          },
          tooltip: {
            enabled: true,
            titleFont: {
              size: 16,
              weight: 600,
            },
            bodyFont: {
              size: 14,
              weight: 500,
            },
            callbacks: {  
              label: function(context){
                let data = context.parsed;

                return ' ' + data + '%';
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    };
    damagedGraph = new Chart($damagedGraph, damagedGraphConfig);

    wearGraphConfig = {
      type: "doughnut",
      data: dataWearStat,
      options: {
        layout: {
          padding: {
            left: 20,
            right: 20,
          },
        },
        plugins: {
          title: {
            display: true,
            align: "center",
            color: "#363949",
            font: {
              weight: 500,
              size: 22,
            },
            padding: {
              top: 10,
              bottom: 10,
            },
            text: '% Celdas Desgastadas'
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: {

                weight: 500,
                size: 14,
              },
              padding: 15,
              boxWidth: 35,
            },
            reverse: true,
          },
          datalabels:{
            color: '#363949',
            anchor: 'center',
            font: {
              size: 16,
              weight: 500,
            },
            formatter: function(value){
              return value + '%';
            }
          },
          tooltip: {
            enabled: true,
            titleFont: {
              size: 16,
              weight: 600,
            },
            bodyFont: {
              size: 14,
              weight: 500,
            },
            callbacks: {  
              label: function(context){
                let data = context.parsed;
                return ' ' + data + '%';
              },
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      }
    };
    wearGraph = new Chart($wearGraph, wearGraphConfig);
    
    $imagePatron.src = json1[0].patron;
    if(json1[0].hasOwnProperty("revision")){
      $imageLast.src = json1[0].revision;
    }
    $dataStatus.textContent = `${json2[0].estado}%`;
    $dataStatusTransfer.textContent = `${statusTransfer}%`;
    $dataDiag.textContent = json2[0].diagnostico;
    $dataAct.textContent = json2[0].recomendacion;
  } catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
    $dataTop.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }

  try {
    let res = await fetch('/api/anilox-history', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: aniloxId})
    }),
        json = await res.json();
        json = json.result;

    let res2 = await fetch('api/listado', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({id: aniloxId})
    }),
        json2 = await res2.json();
        json2 = json2.result

    if(!res.ok) throw{status: res.status, statusText: res.statusText};
    if(!res2.ok) throw{status: res2.status, statusText: res2.statusText};

    let volLabels = [],
        volData = [],
        diag = [];

    for(let i = 0; i < json.length; i++){
     volLabels[i] = json[i].date;
     volData[i] = Math.round(((json[i].volume*volMulti)+Number.EPSILON)*10)/10;
     diag[i] = json[i].diagnostico;
    }

    let nomVol = Math.round(((json2[0].nomvol*volMulti)+Number.EPSILON)*10)/10;
    let nomData = [];

    for(let i = 0; i < json.length; i++){
      nomData[i] = nomVol;
    }

    const dataBcmStat = {
      labels: volLabels,
      datasets: [{
        label: `Volumen medido (${ls.getItem("volumeUnit")})`, // Verificar
        data: volData,
        info: diag,
        fill: false,
        borderColor: 'rgba(0, 0, 255, 0.35)',
        tension: 0.1,
      },
      {
        label:`Volumen nominal (${ls.getItem("volumeUnit")})`,
        data: nomData,
        fill: false,
        borderColor: 'rgba(255, 0, 0, 0.35)',
        tension: 0.1,
        pointStyle: false,
        datalabels: {
          display: false, // Desactiva etiquetas
        },
      }]
    };

    bcmChart = new Chart($bcmChart, {
      type: "line",
      data: dataBcmStat,
      options: {
        plugins: {
          title: {
            display: true,
            align: "center",
            color: "#363949",
            font: {
              weight: 500,
              size: 22,
            },
            padding: {
              top: 10,
              bottom: 10,
            },
            text: 'Historial de Volumen de Celda'
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              font: {
                weight: 500,
                size: 14,
              },
              padding: 15,
              boxWidth: 30,
            },
            reverse: true,
          },
          datalabels:{
            color: '#363949',
            align: -45,
            font: {
              size: 14,
              weight: 500,
            },
            clip: false,
          },
          tooltip: {
            enabled: true,
            titleFont: {
              size: 16,
              weight: 600,
            },
            bodyFont: {
              size: 14,
              weight: 500,
            },
            footerFont: {
              size: 16,
              weight: 300,
            },
            callbacks: {  
              label: function(tooltipItem){
                if(tooltipItem.datasetIndex == 0){
                  let data = tooltipItem.parsed.y;
                  return 'Volumen: ' + data + ' ' + ls.getItem("volumeUnit"); 
                }
                else{return ""}
              },
              footer: function(tooltipItem){
                if(tooltipItem[0].datasetIndex == 0){
                  let diag = tooltipItem[0].dataset.info[tooltipItem[0].dataIndex];
                  return 'Diagnostico:' + '\n' + diag;
                }
              }
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              display: true,
              font: {
                weight: 500,
                size: 14,
              }
            },
          },
          y: {
            grace: 0.15,
            ticks: {
              stepSize: 0.05,
              font: {
                weight: 500,
                size: 14,
              }
            },
          },
        },
      }
    });
  } catch (err) {
    console.log(err);
    let errorCode = err.status || "2316",
        errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
        message1 = "Error " + errorCode + ": ",
        message2 = errorStatus;
        $bcmChart.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
  }
}

const viewMore = (e)=>{
  if(e.target === $viewMore){
    $modalDataAnilox.style.display = "block";
  }
  if(e.target === $closeModalDataAnilox){
    $modalDataAnilox.style.display = "none"
  }
}

const dateEstimation = (measuredVol, measuredDates, estimatedVol)=>{
  let estimatedDates = measuredDates.map(el => el);
  for(let i = 0; i < estimatedVol.length - measuredVol.length; i++){
    let last = `${estimatedDates[estimatedDates.length - 1]} 00:00:00`;
    last = new Date(last);
    let next = new Date(last.setMonth(last.getMonth() + 6)),
        year = String(next.getFullYear()),
        month = String(next.getMonth() + 1),
        day = String(next.getDate());
    month.length < 2 ? month = `0${month}` : month = month;
    day.length < 2 ? day = `0${day}` : day = day;
    next = [year, month, day].join('-');
    estimatedDates.push(next);
  }
  return estimatedDates;
}

const percentEstimation = (nomVol, estimatedVol)=>{
  let estimatedIndex = [], estimatedValue = [];
  estimatedVol.some((el, index) => {
    if(el <= 0.9*nomVol){
      estimatedIndex.push(index);
      estimatedValue.push(el);
      return true;
    }
  });
  estimatedVol.some((el, index) => {
    if(el <= 0.8*nomVol){
      estimatedIndex.push(index);
      estimatedValue.push(el);
      return true;
    }
  });
  estimatedVol.some((el, index) => {
    if(el <= 0.7*nomVol){
      estimatedIndex.push(index);
      estimatedValue.push(el);
      return true;
    }
  });
  estimatedIndex.push(estimatedVol.length - 1);
  estimatedValue.push(estimatedVol[estimatedVol.length - 1]);
  let estimatedPercent = {0: estimatedIndex, 1: estimatedValue};
  return estimatedPercent;
}

const linearRegression = (nomVol, measuredVol, measuredDates)=>{
  let lim = 0.6*nomVol, estimatedVol = [], estimatedDates = [], estimatedPercent = {};
  let m = 0, b = 0;
  let xSum = 0, ySum = 0, xxSum = 0, xySum = 0, count = measuredVol.length;
  if(measuredVol[measuredVol.length - 1] > lim){
    for(let i = 0; i < count ; i++){
      xSum += i;
      ySum += measuredVol[i];
      xxSum += i * i;
      xySum += i * measuredVol[i];
    }
    m = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
    if(m <= -0.01){
      b = (ySum / count) - (m * xSum) / count;
      let h = ((lim - b) / m) + 10;
      for(let i = 0; i < h; i++){
        let vol = Math.round(((i * m + b) + Number.EPSILON) * 1000) / 1000;
        estimatedVol.push(vol);
        if(estimatedVol[i] < lim){
          break;
        }
      }
      estimatedPercent = percentEstimation(nomVol, estimatedVol);
      estimatedDates = dateEstimation(measuredVol, measuredDates, estimatedVol);
    }
    else estimatedVol = 2000;
  }
  else estimatedVol = 1000;
  return [m, b, estimatedVol, estimatedDates, estimatedPercent];
}

const estimarVida = async(e)=>{
  if(e.target === $estimarVida){ 
    $modalEOLAnilox.style.display = "block";
    let nomVol;
    let measuredVol = [];
    let measuredDates = [];
    try {
      let res = await fetch('api/listado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: aniloxId,
          eol: 1
        })
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      nomVol = Math.round(((json.result[0].nomvol*volMulti)+Number.EPSILON)*1000)/1000;
    } catch (err) {
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $tableContainer.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
    }
    try {
      let res = await fetch('api/anilox-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: aniloxId})
      }),
          json = await res.json();
      if(!res.ok) throw{status: res.status, statusText: res.statusText};
      json = json.result;
      for(let i = 0; i < json.length; i++){
        measuredVol[i] = Math.round(((json[i].volume*volMulti)+Number.EPSILON)*1000)/1000;
        measuredDates[i]= json[i].date;
      }
    } catch (err) {
      let errorCode = err.status || "2316",
          errorStatus = err.statusText || "No se pudo establecer contacto con el servidor",
          message1 = "Error " + errorCode + ": ",
          message2 = errorStatus;
      $tableContainer.insertAdjacentHTML("afterend", `<p><b>${message1}</b>${message2}</p>`);
    }
    let [m, b, estimatedVol, estimatedDates, estimatedPercent] = linearRegression(nomVol, measuredVol, measuredDates);
    // console.log("m: ", m);
    // console.log("b: ", b);
    // console.log("Estimated Vol: ", estimatedVol);
    // console.log('Estimated Dates: ', estimatedDates);
    // console.log('Estimated Percent', estimatedPercent);
    let msg = "";
    if(estimatedVol === 1000) msg = `El volumen de celda ya se encuentra por debajo del 60% del volumen nominal (${Math.round(((nomVol * 0.6) + Number.EPSILON) * 10) / 10}).`;
    else if (estimatedVol === 2000) msg = `No se cuenta suficientes datos para realizar una estimación.`;
    else {
      const dataEOLGraph = {
        labels: estimatedDates,
        datasets: [{
          type: 'line',
          label: `Volumen estimado (${ls.getItem("volumeUnit")})`,
          data: estimatedVol,
          fill: false,
          borderColor: 'rgba(255, 0, 0, 0.35)',
          tension: 0.1,
          datalabels: {
            display: true,
            align: 'top',
          },
        }, {
          type: 'scatter',
          label: `Volumen medido (${ls.getItem("volumeUnit")})`,
          data: measuredVol,
          fill: false,
          borderColor: 'rgba(0, 0, 255, 0.6)',
          datalabels: {
            display: true,
          },
        }]
      };
      eolGraph = new Chart($eolGraph, {
        data: dataEOLGraph,
        options: {
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                font: {
                  weight: 500,
                  size: 14,
                },
                padding: 15,
                boxWidth: 30,
              },
              reverse: true,
            },
            datalabels:{
              color: '#363949',
              align: 'right',
              padding: {
                right: 7,
              },
              font: {
                size: 13,
                weight: 500,
              },
              clip: false,
              formatter: function(value, context){
                if(context.dataset.type === 'line'){
                  if(estimatedPercent[1].includes(value) && value < measuredVol[measuredVol.length - 1]) return value;
                  else return '';
                }
              },
            },
            tooltip: {
              enabled: true,
              titleFont: {
                size: 16,
                weight: 600,
              },
              bodyFont: {
                size: 14,
                weight: 500,
              },
              footerFont: {
                size: 16,
                weight: 300,
              },
              callbacks: {  
                label: function(context){
                  let data = context.parsed.y;
                  return 'Volumen: ' + data + ' ' + ls.getItem("volumeUnit");
                },
                footer: function(tooltipItems){
                  let vol = tooltipItems[0].dataset.data[tooltipItems[0].dataIndex];
                  if(vol === estimatedPercent[1][0] && estimatedPercent[0][0] > measuredDates.length - 1) return `Volumen de celda aprox. 90% del nominal (${Math.round(((nomVol * 0.9) + Number.EPSILON) * 10) / 10})`
                  if(vol === estimatedPercent[1][1] && estimatedPercent[0][1] > measuredDates.length - 1) return `Volumen de celda aprox. 80% del nominal (${Math.round(((nomVol * 0.8) + Number.EPSILON) * 10) / 10})`
                  if(vol === estimatedPercent[1][2] && estimatedPercent[0][2] > measuredDates.length - 1) return `Volumen de celda aprox. 70% del nominal (${Math.round(((nomVol * 0.7) + Number.EPSILON) * 10) / 10})`
                  if(vol === estimatedPercent[1][3] && estimatedPercent[0][3] > measuredDates.length - 1) return `Volumen de celda aprox. 60% del nominal (${Math.round(((nomVol * 0.6) + Number.EPSILON) * 10) / 10})`
                }
              },
            },
          },
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                display: true,
                font: {
                  weight: 500,
                  size: 14,
                }
              },
            },
            y: {
              ticks: {
                stepSize: 0.1,
                font: {
                  weight: 500,
                  size: 14,
                }
              },
            },
          },
        }
      });
      let tableData = Array.from(Array(estimatedPercent[1].length), ()=>({
        volumePercent: '',
        volumeEstimated: '',
        timeRemainingEstimated: '',
      }));
      for (let i = 0; i < estimatedPercent[1].length; i++){
        if(estimatedPercent[0][i] <= measuredDates.length - 1){
          tableData[i].volumePercent = null;
          tableData[i].volumeEstimated = null;
          tableData[i].timeRemainingEstimated = null;
        }
        else {
          tableData[i].volumePercent = (90 - (i * 10));
          tableData[i].volumeEstimated = estimatedPercent[1][i];
          tableData[i].timeRemainingEstimated = (estimatedPercent[0][i] - measuredDates.length + 1) / 2;
        }
      }
      tableData.forEach(el=>{
        if(el.volumePercent != null && el.volumeEstimated !== null && el.timeRemainingEstimated != null){
          $template.querySelector(".volume-percent").textContent = `${el.volumePercent}%`;
          $template.querySelector(".volume-estimated").textContent = el.volumeEstimated;
          $template.querySelector(".time-remaining-estimated").textContent = `${el.timeRemainingEstimated} año(s)`;
          let $clone = d.importNode($template, true);
          $fragment.appendChild($clone);
        }
      });
      $table.querySelector(".table-body").appendChild($fragment);
      cleanGraph2 = new Chart($cleanGraph2, cleanGraphConfig);
      damagedGraph2 = new Chart($damagedGraph2, damagedGraphConfig);
      wearGraph2 = new Chart($wearGraph2, wearGraphConfig);
      $eolGraphContainer.style.display = "flex";
      $tableContainer.style.display = "flex";
    }
    $eolDescription.textContent = msg;
  }

  if(e.target === $closeModalEOLAnilox){
    $modalEOLAnilox.style.display = "none"
    if(typeof eolGraph !== 'undefined'){eolGraph.destroy()}
    if(typeof cleanGraph2 !== 'undefined'){cleanGraph2.destroy()}
    if(typeof damagedGraph2 !== 'undefined'){damagedGraph2.destroy()}
    if(typeof wearGraph2 !== 'undefined'){wearGraph2.destroy()}
    $tableBody.innerHTML = '';
  }
}

const load = (e)=>{
  if(e.target.matches(".arrow")){
    if(e.target.dataset.load !== ""){
      let data = e.target.dataset.load.split(",");
      ss.setItem("aniloxId", data[0]);
      ss.setItem("aniloxBrand", data[1]);
      window.location.reload();
    }
  }
}

d.addEventListener("DOMContentLoaded",getAnilox);
d.addEventListener("DOMContentLoaded",getCompleteList);
d.addEventListener("click",viewMore);
d.addEventListener("click",estimarVida);
d.addEventListener("click",load);
