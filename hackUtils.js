var utils = ["NUKE.exe","BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe"];

export async function main(ns) { 

}

/** 
 * 尝试对目标使用所有程序
 * @param {NS} ns 
 * @param host 目标主机 
 **/
export function runAll(ns , host)
{
	ns.tprintf("尝试使用所有程序 at %s",host);
	for(var i in utils)
	{
		 run(ns , utils[i] , host);
	}
}

/** 
 * 尝试对目标使用指定程序
 * @param {NS} ns 
 * @param file 指定程序 
 * @param host 目标主机 
 **/
export function run(ns , file , host)
{ 
	var flag = true;
	if(utils.includes(file) && ns.fileExists(file))
	{
		ns.tprintf("尝试使用程序 %s",file);

		switch(file)
		{
			case "NUKE.exe":{
			 	ns.nuke(host);
			}
			break;
			case "BruteSSH.exe":{
				ns.brutessh(host);
			}
			break;
			case "FTPCrack.exe":{
				ns.ftpcrack(host);
			}
			break;
			case "relaySMTP.exe":{
				ns.relaysmtp(host);
			}
			break;
			case "HTTPWorm.exe":{
				ns.httpworm(host);
			}
			break;
			case "SQLInject.exe":{
				ns.sqlinject(host);
			}
			break;
			default:
			{
				flag=false; 
			}break;
		}
	}
	else
	{
		flag=false;
	}

	if(flag)
	{ 
		ns.tprintf("%s 成功使用 %s",host,file);  
	}
	else
	{
		ns.tprintf("%s 不存在、或者未安装 指定文件 %s",host,file);  
	}
}

/** 
 * 获得预计吃满内存需要的线程数
 * @param {NS} ns 
 * @param forecast 预估RAM消耗
 * @param host 目标主机 
 **/
export function getThread(ns,forecast,host)
{
	var maxRam = ns.getServerMaxRam(host);
	var thread = Math.floor(maxRam/forecast);
	return thread;
}

/** 
 * 获得在目标服务器上运行指定脚本，吃满内存需要的线程数
 * @param {NS} ns 
 * @param script 脚本名，需要在目标主机上
 * @param host 目标主机 
 **/
export function getScriptThread(ns,script,host)
{
	var ram = ns.getScriptRam(script,host);
	if(ram==0)
	{
		ns.tprintf("目标主机：%s 不存在脚本：%s",host,script);
		return 1;
	}
	var maxRam = ns.getServerMaxRam(host);
	var thread = Math.floor(maxRam/ram);
	return thread;
}