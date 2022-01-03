/** @param {NS} ns **/
export async function main(ns) {
    var script = ns.args[0]; 
    var target = ns.args[1];

    var ram = 8;
    var i = 0;
    var limit = ns.getPurchasedServerLimit(); 
    while(i<limit)
    {
        await ns.sleep(100);
        if(ns.getServerMoneyAvailable('home')>ns.getPurchasedServerCost(ram))
        {
            var name = "pserv-" + i;
            var host = ns.purchaseServer(name,ram);
            if(host=="")
            {
                ns.tprintf("购买%s失败",name);
            }
            else
            {
                ns.tprintf("购买%s成功",name);     

                await ns.scp(script,'home',host); 
                ns.tprintf("拷贝 %s 到 %s ",script,host);     
 
                await ns.exec(script,host,2,target); 
            }
            i = i+1;
        }
    }
}
