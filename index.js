// -----------------------------------

function get_list(statement) {
    let list = handle(statement)
    return list.filter(item=>item!='list')
}

let base = {}
let methods = {
    'define':function(args) {
        let name = args[0]
        let value = args[1]
        let ret = handle(value)
        if(typeof ret === 'function') {
            return methods[name] = ret
        } else {
            return base[name] = ret
        }
    },
    'eval':function(args) {
        let value = args[0]
        while(typeof value == 'object' || typeof value == 'string') {
            if(typeof value == 'object') {
                value = value.filter(item=>item != 'list')
            }
            value = handle(value)
        }
        return value
    },
    '+':function(args) {
        let end_args = args.map(arg=>handle(arg))
        return end_args.reduce(function(acc,cur) {
            return acc + cur
        })
    },
    '-':function(args) {
        let end_args = args.map(arg=>handle(arg))
        return end_args.reduce(function(acc,cur) {
            return acc - cur
        })
    },
    '*':function(args) {
        let end_args = args.map(arg=>handle(arg))
        return end_args.reduce(function(acc,cur) {
            return acc * cur
        })
    },
    '/':function(args) {
        let end_args = args.map(arg=>handle(arg))
        return end_args.reduce(function(acc,cur) {
            return acc / cur
        })
    },
    'if':function(args) {
        let cond = args[0]
        let yes = args[1]
        let no = args[2]
        if(handle(cond)) {
            return handle(yes)
        } else {
            return handle(no)
        }
    },
    // -----------------------------------------------------
    '>':function(args) {
        return handle(args[0]) > handle(args[1])
    },
    '<':function(args) {
        return handle(args[0]) < handle(args[1])
    },
    '>=':function(args) {
        return handle(args[0]) >= handle(args[1])
    },
    '<=':function(args) {
        return handle(args[0]) <= handle(args[1])
    },
    '=':function(args) {
        return handle(args[0]) == handle(args[1])
    },
    'and':function(args) {
        for(let arg of args) {
            if(!handle(arg)) {
                return false
            }
        }
        return true
    },
    'or':function(args) {
        for(let arg of args) {
            if(handle(arg)) {
                return true
            }
        }
        return false
    },
    // -----------------------------------------------------
    'null?':function(args) {
        let list = get_list(args[0])
        return list.length == 0
    },
    'abslist':function(args) {
        return ['list'].concat(args)
    },
    'car':function(args) {
        let list = get_list(args[0])
        return list[0]
    },
    'cdr':function(args) {
        let list = get_list(args[0])
        return ['list'].concat(list.slice(1))
    },
    'cadr':function(args) {
        return handle(['car',['cdr',args[0]]])
    },
    'cddr':function(args) {
        return handle(['cdr',['cdr',args[0]]])
    },
    // -----------------------------------------------------
    'append':function(args) {
        let final_list = ['list']
        for(let arg of args) {
            let sub_list = get_list(arg)
            for(let elm of sub_list) {
                final_list.push(elm)
            }
        }
        return final_list
    },
    'cons':function(args) {
        let car = handle(args[0])
        let cdr = get_list(args[1])
        return ['list',car].concat(cdr)
    },
    'list':function(args) {
        let list = args.map(item=>handle(item))
        return handle(['abslist'].concat(list))
    },
    // -----------------------------------------------------
    'clear':function() {
        base = {}
        return true
    },
    // -----------------------------------------------------
    'lambda':function(args) {
        let params = args[0]
        let prog = args[1]
        return function(inner_args) {
            let old_base = JSON.stringify(base)
            for(let id=0;id<params.length;++id) {
                handle(['define',params[id],inner_args[id]])
            }
            let ret = handle(prog)
            base = JSON.parse(old_base)
            return ret
        }
    },
    'exit':function(args) {
        process.exit(0)
    }
}

// -----------------------------------

function handle(statement) {

    if(typeof statement === 'string') {
        if(!(statement in base)) {
            throw 'Base exception: "'+statement+'" not found'
        }
        return base[statement]
    } else if (typeof statement === 'object') {
        let meth = statement[0]
        let inner_args = statement.slice(1)
        return methods[meth](inner_args)
    }
    return statement
}

function compile(str) {

    let replacer = str
        .replace(/\'\(\)/g,'(abslist)')
        .replace(/\'\(/g,'(abslist ')
        .replace(/\(/g,'[')
        .replace(/\)/g,']')
        .replace(/\s/g,',')
        .replace(/(\w+\?|\w+|[-!$%^&*()_+|~=`{}:";'<>?.\/])/g,function(match) {
            let ival = parseInt(match)
            if(isNaN(ival)) {
                return '"'+match+'"'
            }
            return ival
        })

    let obj_command = JSON.parse(replacer)

    return handle(obj_command)
}

module.exports = exports.compile = compile