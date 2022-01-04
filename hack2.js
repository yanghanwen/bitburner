/** 
 * 将脚本传播到目标机上执行(需要已经获得目标的root权限)
 * @param {NS} ns  
 **/
export async function main(ns) {
	var host =ns.getHostname(); 
	var target = ns.args[0];
	if(target=="")
	{
		ns.tprintf("需要指定参数0");
		return;
	}

	var hack1 = 'hack1.js';
	var hack2 = 'hack2.js'; 

    await ns.scp(hack1,host,target);
	await ns.scp(hack2,host,target);

	//停止正在运行的脚本
	ns.killall(target); 

	//吃光内存
	var needRam = ns.getScriptRam(hack1,target);
	var maxRam = ns.getServerMaxRam(target);
	var thread = Math.floor(maxRam/needRam);

	//运行
	await ns.exec(hack1,target,thread,target);    
}
