const arrToObj = arr => {
	const map = {};
	for (let i = 0, l = arr.length; i < l; i++) {
		map[arr[i]] = i;
	}
	return map;
}

class Field {
	constructor (name, data) {
		this.data = data;
		this.name = name;
	}

	at (i) {
		return this.data[i];
	}
}

window.Measure =
class Measure extends Field {
	min () {
		return Math.min(...this.data);
	}

	max () {
		return Math.max(...this.data);
	}
}

window.Dimension = 
class Dimension extends Field {
	constructor (...params) {
		super(...params);

		this.values = Array.from(new Set(this.data));
		this.valueMap = arrToObj(this.values);
	}

	representative (val) {
		return this.valueMap[val];
	}
}

class Dataset {
	constructor (data, meta) {
		this.data = data
			.split('\n')
			.filter(row => !!row.trim())
			.map(row => row.split(','));
		this.meta = meta;
		this.header = this.data[0];
		const rawBody = this.data.slice(1);

		// Parse body
		this.body = rawBody.map(row => 
			row.map((val, i) => {
				const headerName = this.header[i];
				if (this.meta.desc[headerName] === 'Measure') {
					return parseInt(val);
				} else {
					const map = this.meta.dimMap[headerName];
					if (!map) return val;
					return map[val];
				}
			})
		);
		this.fields = { };
		this._createFields();
	}

	_createFields () {
		this.header.forEach((header, i) => {
			this.fields[header] = 
				new window[this.meta.desc[header]](
					header, 
					this.body
						.map(row =>row.filter((val, ii) => i === ii))
						.map(e => e[0])
				);
		})
	}

	col (name) {
		return this.fields[name];
	}

	at (i, field) {
		const d = this.header.map(field => this.fields[field].at(i));
		return d[this.header.indexOf(field)];
	}
}

const df = new Dataset(KNN_NS.data, KNN_NS.meta);
const svg = d3.select('#viz svg');

function plotPoints(mount, data, config) {
	const xAxisField = config.x;
	const yAxisField = config.y;
	const xDomain = [df.col(xAxisField).min() - 10, df.col(xAxisField).max() + 10];
	const yDomain = [df.col(yAxisField).min() - 10, df.col(yAxisField).max() + 10];
	const scales = {
		x: d3.scaleLinear().domain(xDomain).range(config.xRange),
		y: d3.scaleLinear().domain(yDomain).range(config.yRange),
	};

	svg
		.selectAll('circle')
		.data(df.body)
		.enter()
			.append('circle')
			.attr('cx', (d, i) => scales.x(df.at(i, xAxisField)))
			.attr('cy', (d, i) => scales.y(df.at(i, yAxisField)))
			.style('fill', (d, i) =>  d3.schemeSet2[df.col(config.color).representative(df.at(i, config.color))])
			.attr('r', 10)
			.classed('data-point', true);
}

plotPoints(svg, df, { 
	x: 'x', 
	y: 'y',
	color: 'c',
	xRange: [0, 500],
	yRange: [500, 0]
});
