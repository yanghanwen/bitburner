var utils = [
	"BruteSSH.exe", 
	"FTPCrack.exe", 
	"relaySMTP.exe", 
	"HTTPWorm.exe", 
	"SQLInject.exe", 
	"NUKE.exe"
];

/** 
 * 尝试破解某台电脑
 * @param {NS} ns 
 * **/
export async function main(ns) 
{
	if(ns.args.length==0)
	{
		ns.print('args error');
		return;
	}

	var target = ns.args[0];
	if(ns.hasRootAccess(target))
	{ 
		ns.tprintf("[%s] already root",target);
		return;
	}
	 
	var home = 'home';
	var files = ns.ls(home,'exe');
	
	if(files.includes('BruteSSH.exe'))
	{
		ns.brutessh(target);	
	}
	if(files.includes('FTPCrack.exe'))
	{
		ns.ftpcrack(target);	
	}
	if(files.includes('relaySMTP.exe'))
	{
		ns.relaysmtp(target);	
	}
	if(files.includes('HTTPWorm.exe'))
	{
		ns.httpworm(target);	
	}
	if(files.includes('SQLInject.exe'))
	{
		ns.sqlinject(target);	
	}
	
	var server = ns.getServer(target);
	if(server.openPortCount>=server.numOpenPortsRequired)
	{
		ns.nuke(target);	
	}

	await ns.sleep(1000);
	if(ns.hasRootAccess(target))
	{
		ns.tprintf("[%s] 本次破解成功",target);
	}
}