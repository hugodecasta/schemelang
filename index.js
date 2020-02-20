// -----------------------------------

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
    'list':function(args) {
        return args
    },
    'car':function(args) {
        let list = handle(args[0])
        return list[0]
    },
    'cdr':function(args) {
        let list = handle(args[0])
        return list.slice(1)
    },
    'cadr':function(args) {
        return handle(['car',['cdr',args[0]]])
    },
    'cddr':function(args) {
        return handle(['cdr',['cdr',args[0]]])
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
                base[params[id]] = inner_args[id]
            }
            let ret = handle(prog)
            base = JSON.parse(old_base)
            return ret
        }
    }
}

// -----------------------------------

function handle(statement) {

    if(typeof statement === 'string') {
        if(!(statement in base)) {
            throw 'Base exception: "'+statement+'" not found'
        }
        return handle(base[statement])
    } else if (typeof statement === 'object') {
        let meth = statement[0]
        let inner_args = statement.slice(1)
        return methods[meth](inner_args)
    }
    return statement
}

function compile(str) {

    function create_eval(str) {

        let replacer = str.replace(/\'\(/g,'(list ')
    
        replacer = replacer
            .replace(/\(([^()]*|\(([^()]*|\([^()]*\))*\))*\)/g,function(found) {
                let repl = create_eval(found.slice(1,found.length-1))
                return '['+repl+']'
            })

        return replacer
    }

    let evaluer = create_eval(str)
        .replace(/(\w+|[-!$%^&*()_+|~=`{}:";'<>?,.\/])/g,function(test) {
            let val = parseInt(test)
            if(isNaN(val)) {
                val = '"'+test+'"'
            }
            return val
        })
        .replace(/\s/g,',')


    return handle(JSON.parse(evaluer))
}

module.exports = exports.compile = compile

let scheme = compile