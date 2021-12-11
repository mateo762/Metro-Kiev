(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

class Algorithm {
    constructor(origen, destino, criterio) {
        this.origen = origen;
        this.destino = destino;
        this.criterio = criterio;
        this.graph = [];
        this.estaciones = require("./data/coord.json");
        this.nodos = [];
        for (let estacion of this.estaciones) {
            this.nodos.push(estacion['id']);
        }
        this.arist = require("./data/edges.json");
        this.aristas = [];
        for (let arista of this.arist) {
            this.aristas.push([arista['st1'], arista['st2'], arista['peso'][criterio]])
        }
        this.listaAbierta = [];
        this.listaCerrada = [];
        this.actual = undefined;
        this.pila = [];
    }

    principal() {
        for (let n of this.nodos) {
            this.graph[`${n}A`] = { "aristas": [] };
        }
        for (let n of this.aristas) {
            const [id1, id2, peso] = n;
            this.graph[`${id1}A`]['aristas'].push({ "destino": id2, peso });
            this.graph[`${id2}A`]['aristas'].push({ "destino": id1, peso });
        }
        this.graph[`${this.origen}A`]['F'] = 0;
        this.graph[`${this.origen}A`]['G'] = 0;

        for (let n of this.estaciones) {

            this.graph[`${n.id}A`]['coord'] = [n['lat'], n['lon']];
        }
        return this.algoritmo();
    }

    verticeMenor() {
        let resultado = this.listaAbierta[0];
        if (this.listaAbierta.length > 1) {
            for (let i of this.listaAbierta) {
                if (this.graph[`${i}A`]['G'] < this.graph[`${resultado}A`]['G']) {
                    resultado = i;
                }
            }
        }
        for (let i = 0; i < this.listaAbierta.length; i++) {
            if (this.listaAbierta[i] == resultado) {
                this.listaAbierta.splice(i, 1);
                break;
            }
        }
        return resultado;
    }

    setEcuacion(padre, hijo) {
        const distanciaH = this.getDistanciaH(hijo)
        const distanciaG = hijo['peso'];
        this.graph[`${hijo['destino']}A`]['G'] = this.graph[`${padre}A`]['G'] + distanciaG;
        this.graph[`${hijo['destino']}A`]['H'] = this.graph[`${padre}A`]['G'] + distanciaH;
        this.graph[`${hijo['destino']}A`]['F'] = this.graph[`${padre}A`]['G'] + this.graph[`${hijo['destino']}A`]['H'];
    }

    radians(degrees) {
        return degrees * Math.PI / 100;
    }

    getDistanciaH(hijo) {
        const R = 6371.0
        let coordDestino = this.graph[`${this.destino}A`]['coord'];
        let coordHijo = this.graph[`${hijo['destino']}A`]['coord'];
        let latDest = this.radians(coordDestino[0]);
        let lonDest = this.radians(coordDestino[1]);
        let latHijo = this.radians(coordHijo[0]);
        let lonHijo = this.radians(coordHijo[1]);

        let dlon = lonHijo - lonDest;
        let dlat = latHijo - latDest;

        let a = Math.sin(dlat / 2) ** 2 + Math.cos(latDest) * Math.cos(latHijo) * Math.sin(dlon / 2) ** 2;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let distance = R * c;
        return distance;
    }

    recursivo(node1, node2) {
        this.pila.push(node1);
        if (node1 != node2) {
            this.recursivo(this.graph[`${node1}A`]['padre'], node2);
        }
    }

    countValue(array, value) {
        let n = 0;
        for (let i of array) {
            if (i == value) n++;
        }
        return n;
    }

    algoritmo() {
        this.listaAbierta.push(this.origen);
        while (this.listaAbierta.length > 0) {
            this.actual = this.verticeMenor();
            this.listaCerrada.push(this.actual);
            if (this.actual == this.destino) {
                this.listaAbierta = [];
            } else {
                const listaAdyacentes = this.graph[`${this.actual}A`]['aristas'];
                for (let adyacente of listaAdyacentes) {
                    if (this.countValue(this.listaAbierta, adyacente['destino']) == 0 && this.countValue(this.listaCerrada, adyacente['destino']) == 0) {
                        this.setEcuacion(this.actual, adyacente);
                        this.graph[`${adyacente['destino']}A`]['padre'] = this.actual;
                        this.listaAbierta.push(adyacente['destino']);
                    } else if (this.countValue(this.listaAbierta, adyacente['destino']) > 0) {
                        if (this.graph[`${adyacente['destino']}A`]['G'] < this.graph[`${this.actual}A`]['G']) {
                            this.setEcuacion(this.actual, adyacente);
                            this.graph[`${adyacente['destino']}A`]['padre'] = this.actual;
                        }
                    }
                }
            }
        }
        this.recursivo(this.actual, this.origen);
        this.pila.reverse();
        let cont = 0;
        let anterior = undefined;
        let posterior = undefined;
        let dist = 0;
        let trans = 0;
        for (let i of this.pila) {
            cont++;
            if (cont != 1) {
                posterior = i;
                for (let n of this.arist) {
                    if ((n['st1'] == anterior && n['st2'] == posterior) || (n['st1'] == posterior && n['st2'] == anterior)) {
                        dist += n['peso']['distancia'];
                        trans += n['peso']['transbordo'];
                    }
                }
                anterior = posterior;
            } else {
                anterior = i;
            }
        }
        return [this.pila, dist, trans];
    }

}

module.exports = Algorithm;
},{"./data/coord.json":2,"./data/edges.json":3}],2:[function(require,module,exports){
module.exports=[
    {
        "id": 110,
        "lat": 50.466663,
        "lon": 30.380713
    },
    {
        "id": 111,
        "lat": 50.455728,
        "lon": 30.365040
    },
    {
        "id": 112,
        "lat": 50.457606,
        "lon": 30.392040
    },
    {
        "id": 113,
        "lat": 50.458723,
        "lon": 30.404282
    },
    {
        "id": 114,
        "lat": 50.458611,
        "lon": 30.419722
    },
    {
        "id": 115,
        "lat": 50.455,
        "lon": 30.445556
    },
    {
        "id": 116,
        "lat": 50.450833,
        "lon": 30.466389
    },
    {
        "id": 117,
        "lat": 50.441667,
        "lon": 30.448056
    },
    {
        "id": 118,
        "lat": 50.444167,
        "lon": 30.506111
    },
    {
        "id": 119,
        "lat": 50.445278,
        "lon": 30.518056
    },
    {
        "id": 120,
        "lat": 50.447222,
        "lon": 30.522778
    },
    {
        "id": 121,
        "lat": 50.444444,
        "lon": 30.545556
    },
    {
        "id": 122,
        "lat": 50.441205,
        "lon": 30.559335
    },
    {
        "id": 123,
        "lat": 50.445833,
        "lon": 30.576944
    },
    {
        "id": 124,
        "lat": 50.451944,
        "lon": 30.598333
    },
    {
        "id": 125,
        "lat": 50.455950,
        "lon": 30.612980
    },
    {
        "id": 126,
        "lat": 50.46,
        "lon": 30.630833
    },
    {
        "id": 127,
        "lat": 50.464444,
        "lon": 30.645
    },
    {
        "id": 210,
        "lat": 50.522778,
        "lon": 30.498611
    },
    {
        "id": 211,
        "lat": 50.512222,
        "lon": 30.498611
    },
    {
        "id": 212,
        "lat": 50.501389,
        "lon": 30.498056
    },
    {
        "id": 213,
        "lat": 50.486944,
        "lon": 30.497778
    },
    {
        "id": 214,
        "lat": 50.473056,
        "lon": 30.505278
    },
    {
        "id": 215,
        "lat": 50.465278,
        "lon": 30.516667
    },
    {
        "id": 216,
        "lat": 50.459167,
        "lon": 30.525
    },
    {
        "id": 217,
        "lat": 50.45,
        "lon": 30.524444
    },
    {
        "id": 218,
        "lat": 50.439444,
        "lon": 30.516667
    },
    {
        "id": 219,
        "lat": 50.432222,
        "lon": 30.516111
    },
    {
        "id": 220,
        "lat": 50.420833,
        "lon": 30.30520833
    },
    {
        "id": 221,
        "lat": 50.413056,
        "lon": 30.524444
    },
    {
        "id": 222,
        "lat": 50.404792,
        "lon": 30.516833
    },
    {
        "id": 223,
        "lat": 50.3975,
        "lon": 30.508333
    },
    {
        "id": 224,
        "lat": 50.393333,
        "lon": 30.488056
    },
    {
        "id": 225,
        "lat": 50.3825,
        "lon": 30.4775
    },
    {
        "id": 226,
        "lat": 50.376389,
        "lon": 30.468889
    },
    {
        "id": 227,
        "lat": 50.367044,
        "lon": 30.454203
    },
    {
        "id": 310,
        "lat": 50.476761,
        "lon": 30.432727
    },
    {
        "id": 311,
        "lat": 50.473611,
        "lon": 30.449167
    },
    {
        "id": 312,
        "lat": 50.4625,
        "lon": 30.481944
    },
    {
        "id": 314,
        "lat": 50.448333,
        "lon": 30.413333
    },
    {
        "id": 315,
        "lat": 50.438056,
        "lon": 30.520833
    },
    {
        "id": 316,
        "lat": 50.436944,
        "lon": 30.531667
    },
    {
        "id": 317,
        "lat": 50.4275,
        "lon": 30.538889
    },
    {
        "id": 318,
        "lat": 50.418056,
        "lon": 30.545
    },
    {
        "id": 319,
        "lat": 50.402222,
        "lon": 30.560833
    },
    {
        "id": 321,
        "lat": 50.394167,
        "lon": 30.604167
    },
    {
        "id": 322,
        "lat": 50.395556,
        "lon": 30.615833
    },
    {
        "id": 323,
        "lat": 50.398056,
        "lon": 30.633333
    },
    {
        "id": 324,
        "lat": 50.400833,
        "lon": 30.652222
    },
    {
        "id": 325,
        "lat": 50.403333,
        "lon": 30.666111
    },
    {
        "id": 326,
        "lat": 50.403333,
        "lon": 30.682778
    },
    {
        "id": 327,
        "lat": 50.408889,
        "lon": 30.694444
    }
]
},{}],3:[function(require,module,exports){
module.exports=[
    {
        "st1": 110,
        "st2": 111,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 111,
        "st2": 112,
        "peso": {
            "transbordo": 0,
            "distancia": 1.8
        }
    },
    {
        "st1": 112,
        "st2": 113,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 113,
        "st2": 114,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 114,
        "st2": 115,
        "peso": {
            "transbordo": 0,
            "distancia": 1.9
        }
    },
    {
        "st1": 115,
        "st2": 116,
        "peso": {
            "transbordo": 0,
            "distancia": 1.5
        }
    },
    {
        "st1": 116,
        "st2": 117,
        "peso": {
            "transbordo": 0,
            "distancia": 1.9
        }
    },
    {
        "st1": 117,
        "st2": 118,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 118,
        "st2": 119,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 119,
        "st2": 314,
        "peso": {
            "transbordo": 1,
            "distancia": 0.2
        }
    },
    {
        "st1": 119,
        "st2": 120,
        "peso": {
            "transbordo": 0,
            "distancia": 0.6
        }
    },
    {
        "st1": 120,
        "st2": 217,
        "peso": {
            "transbordo": 1,
            "distancia": 0.1
        }
    },
    {
        "st1": 120,
        "st2": 121,
        "peso": {
            "transbordo": 0,
            "distancia": 1.5
        }
    },
    {
        "st1": 121,
        "st2": 122,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 122,
        "st2": 123,
        "peso": {
            "transbordo": 0,
            "distancia": 1.4
        }
    },
    {
        "st1": 123,
        "st2": 124,
        "peso": {
            "transbordo": 0,
            "distancia": 1.6
        }
    },
    {
        "st1": 124,
        "st2": 125,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 125,
        "st2": 126,
        "peso": {
            "transbordo": 0,
            "distancia": 1.4
        }
    },
    {
        "st1": 126,
        "st2": 127,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 210,
        "st2": 211,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 211,
        "st2": 212,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 212,
        "st2": 213,
        "peso": {
            "transbordo": 0,
            "distancia": 1.8
        }
    },
    {
        "st1": 213,
        "st2": 214,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 214,
        "st2": 215,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 215,
        "st2": 216,
        "peso": {
            "transbordo": 0,
            "distancia": 1
        }
    },
    {
        "st1": 216,
        "st2": 217,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 217,
        "st2": 218,
        "peso": {
            "transbordo": 0,
            "distancia": 1
        }
    },
    {
        "st1": 218,
        "st2": 315,
        "peso": {
            "transbordo": 1,
            "distancia": 0.3
        }
    },
    {
        "st1": 218,
        "st2": 219,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 219,
        "st2": 220,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 220,
        "st2": 221,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 221,
        "st2": 222,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 222,
        "st2": 223,
        "peso": {
            "transbordo": 0,
            "distancia": 1
        }
    },
    {
        "st1": 223,
        "st2": 224,
        "peso": {
            "transbordo": 0,
            "distancia": 1.5
        }
    },
    {
        "st1": 224,
        "st2": 225,
        "peso": {
            "transbordo": 0,
            "distancia": 1.4
        }
    },
    {
        "st1": 225,
        "st2": 226,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 226,
        "st2": 227,
        "peso": {
            "transbordo": 0,
            "distancia": 1.5
        }
    },
    {
        "st1": 310,
        "st2": 311,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 311,
        "st2": 312,
        "peso": {
            "transbordo": 0,
            "distancia": 2.6
        }
    },
    {
        "st1": 312,
        "st2": 314,
        "peso": {
            "transbordo": 0,
            "distancia": 1.4
        }
    },
    {
        "st1": 314,
        "st2": 315,
        "peso": {
            "transbordo": 0,
            "distancia": 1
        }
    },
    {
        "st1": 315,
        "st2": 316,
        "peso": {
            "transbordo": 0,
            "distancia": 0.9
        }
    },
    {
        "st1": 316,
        "st2": 317,
        "peso": {
            "transbordo": 0,
            "distancia": 1
        }
    },
    {
        "st1": 317,
        "st2": 318,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 318,
        "st2": 319,
        "peso": {
            "transbordo": 0,
            "distancia": 2.1
        }
    },
    {
        "st1": 319,
        "st2": 321,
        "peso": {
            "transbordo": 0,
            "distancia": 3.3
        }
    },
    {
        "st1": 321,
        "st2": 322,
        "peso": {
            "transbordo": 0,
            "distancia": 0.8
        }
    },
    {
        "st1": 322,
        "st2": 323,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 323,
        "st2": 324,
        "peso": {
            "transbordo": 0,
            "distancia": 1.3
        }
    },
    {
        "st1": 324,
        "st2": 325,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    },
    {
        "st1": 325,
        "st2": 326,
        "peso": {
            "transbordo": 0,
            "distancia": 1.2
        }
    },
    {
        "st1": 326,
        "st2": 327,
        "peso": {
            "transbordo": 0,
            "distancia": 1.1
        }
    }
]
},{}],4:[function(require,module,exports){
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


let origen = undefined;
let destino = undefined;

const colorOrigen = "0389ff";
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


},{"../../Algorithm":1}]},{},[4]);
