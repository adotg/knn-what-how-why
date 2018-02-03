const arrToObj = arr => {
	const map = {};
	for (let i = 0, l = arr.length; i < l; i++) {
		map[arr[i]] = i;
	}
	return map;
};

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

const gConfig = { /* global config */
	r: 10
}

function setdrawingContext (context /* drawing context */) {
	function drawLine (from, to) {
		return new Promise(res => {
			const connector = context.mount.select('.connector');
			const transition = d3.transition().duration(300).ease(d3.easeLinear)
				.on('end', () => {
					// connector.selectAll('line').data([]).exit().remove();
					res();
				})

			const dSel = connector
					.selectAll('line')
					.data([[from, to]]);
			const eSel = dSel
				.enter()
				.append('line')
				.merge(dSel)
					.attr('x1', d => context.scales.x(d[0][0]))
					.attr('y1', d => context.scales.y(d[0][1]))
					.attr('x2', d => context.scales.x(d[0][0]))
					.attr('y2', d => context.scales.y(d[0][1]))
					.transition(transition)
					.attr('x2', d => context.scales.x(d[1][0]))
					.attr('y2', d => context.scales.y(d[1][1]));
		});		
	}

	function showDistance(distance) {
		const dSel = dpElem
			.selectAll('.block')
			.data(distance);

		dSel
			.exit()
				.remove();

		dSel
			.enter()
			.append('div')
				.attr('id', (d, i) => `dist-${i}`)
				.classed('block', true)
			.merge(dSel)
				.style('background', d => d.color)
				.text(d => Math.round(d.val));
	}

	return {
		addClassifiedPoints: (df, config) => {
			const xAxisField = config.x;
			const yAxisField = config.y;

			context.mount.append('g').classed('points', true)
				.selectAll('circle')
				.data(df.body)
				.enter()
					.append('circle')
					.attr('cx', (d, i) => context.scales.x(df.at(i, xAxisField)))
					.attr('cy', (d, i) => context.scales.y(df.at(i, yAxisField)))
					.attr('id', (d, i) => `pt-${i}`)
					.style('fill', (d, i) =>  d3.schemeSet2[df.col(config.color)
							.representative(df.at(i, config.color))])
					.attr('r', gConfig.r)
					.classed('data-point', true);

			context.mount.append('g').classed('connector', true);
		},

		addNewPoint: (pos) => {
			context.mount.select('.points')
				.append('circle')
				.attr('cx', pos[0])
				.attr('cy', pos[1])
				.attr('r', gConfig.r)
				.classed('data-point', true);		
		},

		findNeighbours: async point => {
			const valx = context.scales.x.invert(point[0]);
			const valy = context.scales.y.invert(point[1]);
			const df = context.df;
			const body = df.body;
			const header = df.header;
			const distance = [];
			for(let i = 0, l = body.length; i < l; i++) {
				const ix = header.indexOf(context.xAxisField);
				const iy = header.indexOf(context.yAxisField);
				const row = body[i];
				const tarx = row[ix];
				const tary = row[iy];
				await drawLine([valx, valy], [tarx, tary]);
				const dist = context.distanceFn([valx, valy], [tarx, tary]);
				distance.push({ 
					val: dist,
					colorSeed: df.at(i, context.colorField),
					color: d3.schemeSet2[df.col(context.colorField).representative(df.at(i, context.colorField))]
				});
				showDistance(distance);
			}

			return distance;
		},

		showDistance: showDistance
	}
}

function init (mount, df, config) {
	const xAxisField = config.x;
	const yAxisField = config.y;
	const xDomain = [df.col(xAxisField).min() - 10, df.col(xAxisField).max() + 10];
	const yDomain = [df.col(yAxisField).min() - 10, df.col(yAxisField).max() + 10];
	const context = {
		df: df,
		distanceFn: config.distanceFn,
		mount: mount,
		xAxisField: config.x,
		yAxisField: config.y,
		colorField: config.color,
		scales: {
			x: d3.scaleLinear().domain(xDomain).range(config.xRange),
			y: d3.scaleLinear().domain(yDomain).range(config.yRange),
		}
	};
	const drawingContext = setdrawingContext(context);
	drawingContext.addClassifiedPoints(df, config);
	return drawingContext;
}

const svg = d3.select('#viz svg');
const slider = d3.select('#k');
const dpElem = d3.select('#info'); /* display panel element */
const dataset = new Dataset(KNN_NS.data, KNN_NS.meta);
const distanceFn = (p1, p2) => {
	const dx = p1[0] - p2[0];
	const dy = p1[1] - p2[1];
	return Math.sqrt(dx * dx + dy * dy);
}
const drwctx = init(
	svg,
	dataset,
	{ 
		x: 'x', 
		y: 'y',
		color: 'c',
		xRange: [0, 500],
		yRange: [500, 0],
		distanceFn: distanceFn,
		dpElem: dpElem
	}
);

let distance;
const partialProcessState = ['sort', 'filterAndVote'];
let processStateIndex = -1;
svg.on('click', async function () {
	const x = d3.event.pageX;
	const y = d3.event.pageY;

	drwctx.addNewPoint([x, y]);
	distance = await drwctx.findNeighbours([x, y]);
	processStateIndex = 0;
});

function applyFade(target, src, set) {
	if (target === src.node()) { return; }

	src.classed('i-focus-ns', set);
	let id = src.attr('id');
	id = id.match(/dist-(\d+)/)[1];
	d3.select(`#pt-${id}`).classed('i-focus-ws', set);
}

dpElem
	.on('mouseover', function ()  {
		const target = this;
		const block = d3.select(d3.event.srcElement);
		applyFade(target, block, true);
	})
	.on('mouseout', function () {
		const target = this;
		const block = d3.select(d3.event.srcElement);
		applyFade(target, block, false);
	});

function getDataElement (e) {
	const path = e.path;
	let elem = null;
	for (let i = 0, l = path.length; i < l; i++) {
		if (!path[i].getAttribute) {
			break;
		} else if (path[i].getAttribute('data')) {
			elem = path[i];
			break;
		} else if (path[i].nodeName === 'LI') {
			break;
		}
	}

	return elem;
}

function updateProcessStatus (currentIndex) {
	if (currentIndex === partialProcessState.length) { return; }
	const currProcess = d3.select(`#action-${partialProcessState[currentIndex]}`);
	currProcess
		.classed('process-completed', true)
		.classed('process-current', false);

	const nextProcess = d3.select(`#action-${partialProcessState[currentIndex + 1]}`);
	nextProcess	
		.classed('process-current', true)
		.classed('process-pending', false);
}

function sort () {
	distance = distance.sort((m, n) => m.val - n.val);
	drwctx.showDistance(distance);
}

function filterAndVote (elem) {
	let k = parseInt(elem.value, 10);
	k = 2 * k + 1; // Make it odd always so that even no of vote does not arise
	distance._future = distance.slice(0, k);
	drwctx.showDistance(distance._future);	
}

d3.select('#control')
	.on('click', function () {
		const elem = getDataElement(d3.event);
		if (!elem) { return; }

		const action = elem.getAttribute('data');
		const index = partialProcessState.indexOf(action);
		
		if (index < processStateIndex || index > processStateIndex) { return; }
		
		window[action](elem);

		if (processStateIndex === partialProcessState.length - 1) { return; }
		updateProcessStatus(index);
		processStateIndex++;
	});


d3.select('#k-val').on('input', function () {
	d3.select('#k-val-pane').text(2 * parseInt(this.value, 10) + 1)
})