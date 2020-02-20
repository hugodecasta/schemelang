# scheme_js
NodeJS Scheme language interpreter

## usage

Simply execute scheme commands using the imported module
```js
const scheme = require('schemelang')

scheme("(define a 5)")
console.log(scheme("a"))
// -> 5

scheme("(define func (lamda (a b) (+ a b)))")
console.log("(func 5 3)")
// -> 7
```
