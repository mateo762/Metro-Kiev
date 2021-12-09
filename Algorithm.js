
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