/** @param {NS} ns **/
export async function main(ns) {
	var data = [];
	if(data[1]==undefined){
		data[1] = [];
		data[1][2] = 11;
	}
	ns.tprint(data[1][2]);
}