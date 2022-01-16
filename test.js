/** @param {NS} ns **/
export async function main(ns) {
	ns.exec('utils/scan_root.js','home',1);
	await ns.sleep(2000);
	ns.exec('server/all_deploy.js','home',1,'foodnstuff');
	ns.exec('utils/analyze.js','home',1);
}