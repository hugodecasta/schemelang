# Scheme Lang (schemelang)
NodeJS Scheme language interpreter

## basic usage

Simply execute scheme commands using the imported module's interpret method
```js
const scheme = require('schemelang').interpret

scheme("(define a 5)")
console.log(scheme("a"))
// -> 5

scheme("(define func (lamda (a b) (+ a b)))")
console.log("(func 5 3)")
// -> 7
```

## accessible methods

The schemelang module also gives you access to the parse and handle methods.
 * The **`parse`** method transforms string commands into JSON arrays
   ```javascript
   const parse = require('schemelang').parse

   let command_array = parse("(define a 5)")
   // ["define", "a", 5]
   ```
 * The **`handle`** method uses the command array to execute scheme commands
   ```javascript
   const handle = require('schemelang').handle

   handle(["define", "a", ["+", 1, 3]])
   let result = handle("a")
   // 4
   ```
 * The **`interpret`** method uses the two above methods to parse and handle string scheme commands
   ```javascript
   const interpret = require('schemelang').interpret

   interpret('(define a (+ 1 7))')
   let result = interpret('a')
   // 8
   ```