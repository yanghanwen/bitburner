// let baseRequire = [
// 	'/base/hack.js',
// 	'/base/grow.js',
// 	'/base/weaken.js',
// ];

// let utilsRequire = [
// 	'/utils/scan.js',
// 	'/utils/batch.js',
// 	'/utils/loop_batch.js',
// 	'/utils/analyze.js',
// 	'/utils/copy.js',
// ];

// let serverRequire = [
// 	'/server/buy.js',
// 	'/server/deploy.js',
// ];

/** 
 * @param {NS} ns 
 * @param arg0 拷贝到
 * **/
export async function main(ns) {
	if(ns.args.length<1)
	{
		ns.tprintf("args error");
		return;
	}

	var target = ns.args[0];
	
	//copy all
	var files = ns.ls('home','js'); 
	await scp(ns,target,files);
	// await scp(ns,target,baseRequire);
	// await scp(ns,target,utilsRequire);
	// await scp(ns,target,serverRequire);
}

/** 
 * @param {NS} ns 
 * @param target 拷贝到
 * **/
async function scp(ns,target,files)
{
	var host = 'home'; 
	for(var i in files)
	{
		var file = files[i];
		await ns.scp(file,host,target);
	}
}