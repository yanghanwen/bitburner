/** 
 * @param {NS} ns 
 * 方法：过滤掉属于购买的服务器
 * **/
export async function main(ns) {
	var check = ns.args[0];
	var p = ns.getPurchasedServers();
	return p.includes(check);
}