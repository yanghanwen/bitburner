import * as scan from '/utils/scan.js'

/** @param {NS} ns **/
export async function main(ns) {
	// var all = scan.scan(ns);
	// for(var i in all)
	// {
	// 	var temp = all[i];
	// 	if(temp=="run4theh111z")
	// 	{
	// 		ns.tprint('-------------');
	// 	}
	// }
	// let a = [];
	// a.b = [];
	// a.b.c = 111;
	// ns.tprint(a.b.c);	
	var path = await scan.scanPath(ns,"run4theh111z");
	ns.tprintf("complete");
	for(var i in path)
	{
		ns.tprintf(path[i]);
	}	
}