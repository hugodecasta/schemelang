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

test('list car', t => {
    t.is(scheme("(car '(a b c d))"), "a")
})

test('list cdr', t => {
    t.deepEqual(scheme("(cdr '(a b c d))"), ['b','c','d'])
})

test('list cadr', t => {
    t.is(scheme("(cadr '(a b c d))"), 'b')
})

test('list define', t => {
    scheme('(clear)')
    t.deepEqual(scheme("(define tot '(+ a b))"), ['+','a','b'])
})

test('list eval', t => {
    t.is(scheme("(define a 5)"), 5)
    t.is(scheme("(define b 4)"), 4)
    t.is(scheme("(eval tot)"),9)
})