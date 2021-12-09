const Algorithm = require("../../Algorithm");
const estaciones = document.querySelectorAll(".estacion");
const select = document.querySelector("#criterio");
const map = document.querySelector(".img-metro");
const button = document.querySelector("#button");
const clear = document.querySelector("#clear");
const textOrigen = document.querySelector("#origenText");
const textDestino = document.querySelector("#destinoText");

const distancia = document.querySelector("#distancia");
const transbordo = document.querySelector("#transbordo");

let ready = false;

let origen = undefined;
let destino = undefined;

const colorOrigen = "0389ff";
const colorDestino = "0040ff";
let color = colorOrigen;



$(function () {
    $('.img-metro').maphilight({
        fillColor: color,
        fillOpacity: 0.75,
        stroke: false,
        neverOn: true
    });
    for (let estacion of estaciones) {
        estacion.addEventListener("click", function () {
            let isClicked = $(this).data("maphilight");
            if (isClicked) {
                if (estacion.station === "origen") {
                    origen = undefined;
                    textOrigen.textContent = "";
                } else if (estacion.station === "destino") {
                    destino = undefined;
                    textDestino.textContent = "";
                }
                checkValid();
                estacion.station = undefined;
                isClicked = false;
                $(this).data('maphilight', isClicked).trigger('alwaysOn.maphilight');
            } else {
                if (origen && !destino) {
                    destino = estacion.id;
                    textDestino.textContent = destino.toString();
                    estacion.station = "destino";
                    checkValid();
                    isClicked = {};
                    isClicked.alwaysOn = true;
                    $(this).data('maphilight', isClicked).trigger('alwaysOn.maphilight');;
                } else if (!destino || (destino && !origen)) {
                    origen = estacion.id;
                    textOrigen.textContent = origen.toString();
                    estacion.station = "origen";
                    checkValid();
                    isClicked = {};
                    isClicked.alwaysOn = true;
                    $(this).data('maphilight', isClicked).trigger('alwaysOn.maphilight');
                }
            }
        });

    }

    button.addEventListener("click", function () {
        clearMap();
        const algorithm = new Algorithm(origen, destino, select.value);
        const [path, distance, transbordos] = algorithm.principal();
        //camino.textContent = path;
        distancia.textContent = distance.toFixed(2) + "km";
        transbordo.textContent = transbordos;
        transbordo.textContent.fontsize(4);
        for (let estacion of path) {
            let isClicked = $(`#${estacion}`).data("maphilight");
            isClicked = {};
            isClicked.alwaysOn = true;
            $(`#${estacion}`).data('maphilight', isClicked).trigger('alwaysOn.maphilight');
        }
    })


    clear.addEventListener("click", function () {
        for (let estacion of estaciones) {
            let isClicked = $(`#${estacion.id}`).data("maphilight");
            isClicked = false;
            $(`#${estacion.id}`).data('maphilight', isClicked).trigger('alwaysOn.maphilight');
        }
        reset();
    })

    //$('.primero').click(function () {
    //    let isClicked = $(this).data("maphilight");
    //    if (isClicked) {
    //        isClicked = false;
    //        $(this).data('maphilight', isClicked).trigger('alwaysOn.maphilight');;
    //        console.log("true: ", $(this));
    //    } else {
    //        isClicked = {};
    //        isClicked.alwaysOn = true;
    //        $(this).data('maphilight', isClicked).trigger('alwaysOn.maphilight');;
    //        console.log("false: ", $(this));
    //    }
    //});
})

const clearMap = () => {
    for (let estacion of estaciones) {
        let isClicked = $(`#${estacion.id}`).data("maphilight");
        isClicked = false;
        $(`#${estacion.id}`).data('maphilight', isClicked).trigger('alwaysOn.maphilight');
    }
}

const reset = () => {
    origen = undefined;
    destino = undefined;
    button.disabled = true;
    textOrigen.textContent = ""
    textDestino.textContent = ""
}

const checkValid = () => {
    if (destino && origen) {
        button.disabled = false;
    } else {
        button.disabled = true;
    }
}

