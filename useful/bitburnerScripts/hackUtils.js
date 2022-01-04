//定义你需要指定的程序
//会按照数组顺序依次执行
//如果不存在则不会执行
var utils = ["BruteSSH.exe","FTPCrack.exe","relaySMTP.exe","HTTPWorm.exe","SQLInject.exe","NUKE.exe"];

export async function main(ns) { 

}

/** 
 * 尝试对目标使用所有程序,获取ROOT权限
 * @param {NS} ns 
 * @param host 目标主机 
 **/
export function root(ns , host)
{ 
	ns.tprintf("尝试使用所有程序 at %s",host);
	for(var i in utils)
	{
		 runFile(ns , utils[i] , host);
	}

	return ns.hasRootAccess(host);
}

/** 
 * 尝试对目标使用指定程序
 * @param {NS} ns 
 * @param file 指定程序 
 * @param host 目标主机 
 **/
export function runFile(ns , file , host)
{ 
	var flag = true;

	//file 理论上应该是home拥有了就可以使用
	if(utils.includes(file) && ns.fileExists(file,'home'))
	{
		ns.tprintf("尝试使用程序 %s",file);

		switch(file)
		{
			case "NUKE.exe":{
				if(isPortOpen(ns,host))
				{
			 		ns.nuke(host);
				}
				else
				{
					ns.tprintf("端口不满足NUKE运行条件");
					flag = false;
				}
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
		ns.tprintf("[%s] run [%s] 成功",host,file);  
	}
	else
	{
		ns.tprintf("[%s] run [%s] 失败",host,file);   
	}
	return flag;
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
 * 目标的端口是否满足需要
 * @param {NS} ns  
 * @param host 目标主机 
 **/
export function isPortOpen(ns,host)
{
	var sucNum = ns.getServerNumPortsRequired(host); 
	var server = ns.getServer(host);
	return server.openPortCount>=server.numOpenPortsRequired; 
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