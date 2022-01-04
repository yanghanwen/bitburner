/** 
 * @param {NS} ns 
 * 
 * 单个参数的库函数
 * 调用完毕后需要让线程等待一定时间，避免并发
 **/
export async function main(ns) {
    var func = ns.args[0]; //参数名
    var param = ns.args[1]; //参数
    var p = ns.args[2]; //port

    switch (func) {
        case "hasRootAccess":
            {
                var s = Bool2String(ns.hasRootAccess(param));
                await ns.writePort(p, s);
            }
            break;
    }
}

function Bool2String(boolValue) {
    if (boolValue) {
        return "true";
    } else {
        return "false";
    }
}