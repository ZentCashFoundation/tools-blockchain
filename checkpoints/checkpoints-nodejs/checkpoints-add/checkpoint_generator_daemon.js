const CSV = require("export-to-csv"),
	  fs = require('fs'),
	  TurtleCoind = require('turtlecoin-rpc').TurtleCoind;

const daemon = new TurtleCoind({
	host: 'seedpro2.zent.cash', // ip address or hostname of the Telluriumd host
	port: 21698, // what port is the RPC server running on
	timeout: 30000, // request timeout
	ssl: false // whether we need to connect using SSL/TLS
});

const csv_options = {
	fieldSeparator: '-',
	quoteStrings: '"',
	decimalSeparator: '.',
	showLabels: false,
	showTitle: false,
	title: '',
	useTextFile: false,
	useBom: false,
	useKeysAsHeaders: false
};

const csvExporter = new CSV.ExportToCsv(csv_options);

class Checkpoint {
	constructor(height) {
			this.height = height;
	}
}

const checkpointEveryBlocks = 1000;
const checkpoints = [];

daemon.blockCount().then(async (height) => {
console.log("Got blockheight " + height + "!");

for (let i = 0; i < height; i += checkpointEveryBlocks){ 
	console.log("Getting block info for height " + i);
	const blockHash = await daemon.blockHeaderByHeight(i)
	console.log(blockHash.hash);
	checkpoints.push(new Checkpoint('{'+ i + ',' + ' '  + '\"' + blockHash.hash + '\"' + '};'));
}

  console.log("Checkpoints:\n" + JSON.stringify(checkpoints, false , 7));
	let csvdata = await csvExporter.generateCsv(checkpoints, true);

	await fs.writeFileSync('checkpoints.csv', csvdata);
	await console.log("New checkpoints.csv file has been written!");
});