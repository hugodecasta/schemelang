const test = require('ava')
const scheme = require('./index.js')
 
test('define', t => {
    scheme('(clear)')
    scheme('(define a 5)')
    t.is(scheme('a'), 5)
})

test('action', t => {
    scheme('(clear)')
    t.is(scheme('(define a (+ 5 4))'), 9)
})

test('lambda', t => {
    scheme('(clear)')
    let meth = scheme('(define func (lambda (a b) (+ a b)))')
    t.is(typeof meth, 'function')
})

test('exec lambda', t => {
    t.is(scheme('(func 2 3)'), 5)
})