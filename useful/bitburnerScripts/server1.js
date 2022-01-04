/** 
 * @param {NS} ns 
 * 需要拥有：
 * 
 * root.js
 * 
 * 攻击脚本
 * 	hack1.js
 *  hack2.js
 * 
 * **/
export async function main(ns) {
	var target = ns.args[0];
	await ns.run('root.js',1,target); 
	await ns.run('hack1.js',1,target);
}