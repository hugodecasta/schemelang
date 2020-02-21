# Scheme Lang (schemelang)
NodeJS Scheme language interpreter

## basic usage

Simply create a new Scheme environnement and use its interpreter method
```js
// ---------

const SchemeLang = require('schemelang')
var my_scheme_env = new SchemeLang()

// ---------

const scheme = my_scheme_env.interpret

// ---------

scheme("(define a 5)")
console.log(scheme("a"))
// -> 5

scheme("(define func (lambda (a b) (+ a b)))")
console.log(scheme("(func 5 3)"))
// -> 8
```

## accessible methods

The schemelang module also gives you access to the parse and handle methods.
 * The **`parse`** method transforms string commands into JSON arrays
    ```javascript
    const parse = new (require('schemelang'))().parse
    
    let command_array = parse("(define a 5)")
    console.log(command_array)
    // -> ["define", "a", 5]
    ```
 * The **`handle`** method uses the command array to execute scheme commands
   ```javascript
   const handle = new (require('schemelang'))().handle

   handle(["define", "a", ["+", 1, 3]])
   let result = handle("a")
   console.log(result)
   // -> 4
   ```
 * The **`interpret`** method uses the two above methods to parse and handle string scheme commands
   ```javascript
   const interpret = new (require('schemelang'))().interpret

   interpret('(define a (+ 1 7))')
   let result = interpret('a')
   console.log(result)
   // -> 8
   ```