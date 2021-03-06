
// ------------------------------------------ ERRORS

class SchemeError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name
        this.message = message
        Error.captureStackTrace(this, this.constructor)
    }
}

class ExistenceError extends SchemeError {
    constructor(name,type) {
        super(`${type} "${name}" not found.`)
        this.data = {name,type}
    }
}

class ParserError extends SchemeError {
    constructor(command) {
        super(`Cannot parse command "${command}".`)
        this.data = {command}
    }
}

// -------------- LET's WRAPP IT

let schemelang = (function(given_base={}){

// ------------------------------------------ INNER METHODS

function get_list(statement) {
    let list = handle(statement)
    return list.filter(item=>item!='list')
}

function is_string(statement) {
    if(typeof statement == 'object') {
        return false
    }
    var count = (statement.match(/"/g) || []).length
    return statement.charAt(0) == '"' 
        && statement.charAt(statement.length-1) == '"' 
        && count == 2
}

// ------------------------------------------ SCHEME BASE

let base = given_base
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
            if(is_string(value)) {
                return value
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
        if(end_args.length == 1) {
            return -end_args[0]
        }
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
        if(end_args.length == 1) {
            return 1/end_args[0]
        }
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
        if(args.length == 0) {
            return true
        }
        let car = handle(args[0])
        let cdr = args.slice(1)
        if(car === false) {
            return false
        }
        if(cdr.length == 0) {
            return car
        }
        return handle(['and'].concat(cdr))
    },
    'or':function(args) {
        if(args.length == 0) {
            return false
        }
        let car = handle(args[0])
        let cdr = args.slice(1)
        if(car !== false) {
            return car
        }
        return handle(['or'].concat(cdr))
    },
    'not':function(args) {
        let car = handle(args[0])
        if(car !== false) {
            return false
        }
        return !car
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
    'let':function(args) {
        let params = args[0]
        let prog = args[1]
        let old_base = JSON.stringify(base)
        for(let param of params) {
            handle(['define',param[0],param[1]])
        }
        let ret = handle(prog)
        base = JSON.parse(old_base)
        return ret

    },
    'exit':function(args) {
        process.exit(0)
    }
}

// ------------------------------------------ HANDLING METHODS

// -----------------

function handle(statement) {

    if(typeof statement === 'string') {
        if(is_string(statement)) {
            return statement
        }
        if(!(statement in base)) {
            throw new ExistenceError(statement,'variable')
        }
        return base[statement]
    } else if (typeof statement === 'object') {
        let meth = statement[0]
        let inner_args = statement.slice(1)
        if(!(meth in methods)) {
            throw new ExistenceError(meth,'method')
        }
        return methods[meth](inner_args)
    }
    return statement
}

// -----------------

function parse(str) {

    let str_next_index = 0
    let strs = {}

    let replacer = str
        .replace(/"(.*?)"/g,function(_,string){
            let index = str_next_index
            str_next_index++
            strs[index] = string
            return '#'+index+'#'
        })
        .replace(/(\#t)/g,'true')
        .replace(/(\#f)/g,'false')
        .replace(/\'\(\)/g,'(abslist)')
        .replace(/\'\(/g,'(abslist ')
        .replace(/\(/g,'[')
        .replace(/\)/g,']')
        .replace(/\s/g,',')
        .replace(/(\w+\?|\w+|[-!$%^&*()_+|~=`{}:";'<>?.\/])/g,function(match) {
            try {
                return JSON.parse(match)
            } catch(e) {
                return '"'+match+'"'
            }
        })
        .replace(/#(.*?)#/g,function(_,index) {
            return '"\\"'+strs[index]+'\\""'
        })

    try {
        let obj_command = JSON.parse(replacer)
        return obj_command
    } catch(err) {
        throw new ParserError(str)
    }
}

// -----------------

function interpret(str) {
    let array = parse(str)
    return handle(array)
}

// ------------------------------------------ EXPORTS

this.interpret = interpret
this.parse = parse
this.handle = handle

})

// ------------------------------------------ MODULE EXPORTS

module.exports = schemelang