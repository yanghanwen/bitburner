/** @param {NS} ns **/
export async function main(ns) {
    //自动购买服务器 
    var ram = ns.args[0];//核心数量

    var i = 0;
    var limit = ns.getPurchasedServerLimit(); 
    while(i<limit)
    {
        await ns.sleep(10);
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
            }
            i = i+1;
        }
    }
}